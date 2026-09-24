import { prisma } from "@/lib/prisma";
import { SmsProviderAdapter } from "./providers/base-provider";
import { MockProviderAdapter } from "./providers/mock-provider";
import { SmppProviderAdapter } from "./providers/smpp-provider";
import { normalizePhoneNumber, detectCarrier } from "./normalizer";
import { ProviderCircuitBreaker } from "./circuit-breaker";

export interface ResolvedRoute {
  adapter: SmsProviderAdapter;
  providerId: string;
  providerName: string;
  carrier: string;
  isFailover: boolean;
  costPerUnit: number;
}

export class RoutingEngine {
  /**
   * Resolves the best available, healthy provider route for a given phone number.
   * Considers:
   * 1. Destination carrier detection (MTN, Airtel, UTL, Safaricom).
   * 2. Per-provider Circuit Breaker status (prevents routing through failing SMSCs).
   * 3. Lowest cost per unit and operator affinity.
   * 4. Automatic failover to secondary healthy routes if primary is OPEN or degraded.
   */
  static async resolveRoute(phone: string): Promise<ResolvedRoute | null> {
    if (ProviderCircuitBreaker.isGloballyHalted()) {
      console.warn("[ROUTING_ENGINE] Outbound routing halted: Global emergency stop is active.");
      return null;
    }

    const { isValid } = normalizePhoneNumber(phone);
    const network = detectCarrier(phone);
    const targetCarrier = isValid && network ? network.toUpperCase() : "ALL";

    // 1. Fetch active providers
    const providers = await prisma.smsProvider.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" },
    });

    if (providers.length === 0) {
      // Fallback to any provider if no active filter match
      const anyProviders = await prisma.smsProvider.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (anyProviders.length === 0) return null;
      
      const p = anyProviders[0];
      const adapter = this.createAdapter(p);
      return {
        adapter,
        providerId: p.id,
        providerName: p.name,
        carrier: targetCarrier,
        isFailover: false,
        costPerUnit: Number(p.costPerSms || 0),
      };
    }

    // 2. Filter candidates whose circuit breaker allows execution
    const healthyProviders = providers.filter((p) => {
      const check = ProviderCircuitBreaker.canExecute(p.id);
      return check.allowed;
    });

    if (healthyProviders.length === 0) {
      console.error(`[ROUTING_ENGINE] All active SMS providers are currently OPEN / in circuit breaker cooldown.`);
      return null;
    }

    // 3. Sort by carrier affinity first, then lowest cost
    const sorted = [...healthyProviders].sort((a, b) => {
      const aMatchesCarrier = a.name.toUpperCase().includes(targetCarrier) ? 1 : 0;
      const bMatchesCarrier = b.name.toUpperCase().includes(targetCarrier) ? 1 : 0;
      if (aMatchesCarrier !== bMatchesCarrier) {
        return bMatchesCarrier - aMatchesCarrier;
      }
      return Number(a.costPerSms || 0) - Number(b.costPerSms || 0);
    });

    const primary = sorted[0];
    const isFailover = !primary.name.toUpperCase().includes(targetCarrier) && targetCarrier !== "ALL";

    const adapter = this.createAdapter(primary);

    return {
      adapter,
      providerId: primary.id,
      providerName: primary.name,
      carrier: targetCarrier,
      isFailover,
      costPerUnit: Number(primary.costPerSms || 0),
    };
  }

  /**
   * Reports the outcome of a dispatch back to the circuit breaker.
   */
  static reportOutcome(providerId: string, success: boolean): void {
    if (success) {
      ProviderCircuitBreaker.recordSuccess(providerId);
    } else {
      ProviderCircuitBreaker.recordFailure(providerId);
    }
  }

  private static createAdapter(provider: { name: string; type?: string }): SmsProviderAdapter {
    const providerType = ((provider as { type?: string }).type || "").toUpperCase();
    const isSmpp = providerType === "SMPP" || provider.name.toUpperCase().includes("SMPP");

    return isSmpp
      ? new SmppProviderAdapter(provider.name)
      : new MockProviderAdapter(provider.name);
  }
}
