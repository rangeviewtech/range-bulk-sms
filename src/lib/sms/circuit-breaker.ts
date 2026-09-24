export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface ProviderCircuitStatus {
  providerId: string;
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime?: number;
  cooldownUntil?: number;
  successCountInHalfOpen: number;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number; // consecutive failures before opening circuit (default: 5)
  cooldownDurationMs?: number; // time circuit stays OPEN before HALF_OPEN test (default: 60,000 ms)
  halfOpenSuccessThreshold?: number; // successful calls in HALF_OPEN to close circuit (default: 2)
}

/**
 * Per-Provider Circuit Breaker.
 * Prevents cascading telecom failures, SMSC socket flooding, and duplicate charge loops
 * when an external operator SMSC or aggregator gateway suffers an outage.
 */
export class ProviderCircuitBreaker {
  private static circuits = new Map<string, ProviderCircuitStatus>();
  private static globalEmergencyHalted = false;

  /**
   * Sets or clears the global emergency shutdown switch.
   * Halts all outbound telecom signaling across all providers immediately.
   */
  static setGlobalEmergencyHalt(halted: boolean): void {
    this.globalEmergencyHalted = halted;
    console.warn(`[CIRCUIT_BREAKER] Global emergency halt is now: ${halted ? "ACTIVE" : "INACTIVE"}`);
  }

  static isGloballyHalted(): boolean {
    return this.globalEmergencyHalted;
  }

  /**
   * Evaluates if requests to a specific provider are permitted.
   */
  static canExecute(
    providerId: string,
    _options: CircuitBreakerOptions = {}
  ): { allowed: boolean; state: CircuitState; reason?: string } {
    if (this.globalEmergencyHalted) {
      return {
        allowed: false,
        state: "OPEN",
        reason: "Global emergency dispatch halt is actively engaged.",
      };
    }

    const circuit = this.getOrCreateCircuit(providerId);
    const now = Date.now();

    // Check if cooldown expired in OPEN state -> transition to HALF_OPEN
    if (circuit.state === "OPEN") {
      if (circuit.cooldownUntil && now >= circuit.cooldownUntil) {
        circuit.state = "HALF_OPEN";
        circuit.successCountInHalfOpen = 0;
        console.log(`[CIRCUIT_BREAKER] Provider ${providerId} cooldown expired. Transitioned to HALF_OPEN.`);
      } else {
        const remainingMs = (circuit.cooldownUntil || 0) - now;
        return {
          allowed: false,
          state: "OPEN",
          reason: `Provider circuit is OPEN. Cooling down for ${Math.ceil(remainingMs / 1000)}s.`,
        };
      }
    }

    return { allowed: true, state: circuit.state };
  }

  /**
   * Records a successful communication attempt to a provider.
   */
  static recordSuccess(providerId: string, options: CircuitBreakerOptions = {}): void {
    const circuit = this.getOrCreateCircuit(providerId);
    const halfOpenThreshold = options.halfOpenSuccessThreshold ?? 2;

    if (circuit.state === "HALF_OPEN") {
      circuit.successCountInHalfOpen += 1;
      if (circuit.successCountInHalfOpen >= halfOpenThreshold) {
        circuit.state = "CLOSED";
        circuit.consecutiveFailures = 0;
        circuit.cooldownUntil = undefined;
        console.log(`[CIRCUIT_BREAKER] Provider ${providerId} recovered. Circuit is now CLOSED.`);
      }
    } else if (circuit.state === "CLOSED") {
      circuit.consecutiveFailures = 0;
    }
  }

  /**
   * Records a communication failure (e.g. timeout, connection refusal, SMSC reject).
   */
  static recordFailure(providerId: string, options: CircuitBreakerOptions = {}): void {
    const circuit = this.getOrCreateCircuit(providerId);
    const failureThreshold = options.failureThreshold ?? 5;
    const cooldownDuration = options.cooldownDurationMs ?? 60000;
    const now = Date.now();

    circuit.consecutiveFailures += 1;
    circuit.lastFailureTime = now;

    if (circuit.state === "HALF_OPEN" || circuit.consecutiveFailures >= failureThreshold) {
      circuit.state = "OPEN";
      circuit.cooldownUntil = now + cooldownDuration;
      console.warn(
        `[CIRCUIT_BREAKER] Provider ${providerId} tripped to OPEN (${circuit.consecutiveFailures} consecutive failures). Cooldown for ${cooldownDuration / 1000}s.`
      );
    }
  }

  /**
   * Resets circuit breaker for a provider.
   */
  static reset(providerId: string): void {
    this.circuits.delete(providerId);
  }

  /**
   * Inspects all circuit statuses across all configured providers.
   */
  static getStatus(): ProviderCircuitStatus[] {
    return Array.from(this.circuits.values());
  }

  private static getOrCreateCircuit(providerId: string): ProviderCircuitStatus {
    let circuit = this.circuits.get(providerId);
    if (!circuit) {
      circuit = {
        providerId,
        state: "CLOSED",
        consecutiveFailures: 0,
        successCountInHalfOpen: 0,
      };
      this.circuits.set(providerId, circuit);
    }
    return circuit;
  }
}
