import type { ISmsProvider, SmsSendRequest, SmsSendResponse } from './provider-interface';

interface ProviderConfig {
  provider: ISmsProvider;
  priority: number;
  isFallback: boolean;
  healthy: boolean;
  failureCount: number;
  lastSuccess?: Date;
  cooldownUntil?: Date;
}

export class SmsProviderRouter {
  private providers: Map<string, ProviderConfig> = new Map();
  private readonly MAX_FAILURES = 5;
  private readonly COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

  addProvider(provider: ISmsProvider, priority: number, isFallback: boolean): void {
    this.providers.set(provider.name, {
      provider,
      priority,
      isFallback,
      healthy: true,
      failureCount: 0,
    });
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  private updateHealth() {
    const now = new Date();
    for (const [name, config] of this.providers.entries()) {
      if (!config.healthy && config.cooldownUntil && now >= config.cooldownUntil) {
        config.healthy = true;
        config.failureCount = 0;
        config.cooldownUntil = undefined;
      }
    }
  }

  getActiveProvider(): ISmsProvider | null {
    this.updateHealth();
    let selected: ProviderConfig | null = null;
    
    for (const config of this.providers.values()) {
      if (config.healthy && !config.isFallback) {
        if (!selected || config.priority > selected.priority) {
          selected = config;
        }
      }
    }
    return selected ? selected.provider : null;
  }

  getFallbackProvider(): ISmsProvider | null {
    this.updateHealth();
    let selected: ProviderConfig | null = null;
    
    for (const config of this.providers.values()) {
      if (config.healthy && config.isFallback) {
        if (!selected || config.priority > selected.priority) {
          selected = config;
        }
      }
    }
    return selected ? selected.provider : null;
  }

  private handleFailure(providerName: string) {
    const config = this.providers.get(providerName);
    if (!config) return;
    
    config.failureCount += 1;
    if (config.failureCount >= this.MAX_FAILURES) {
      config.healthy = false;
      config.cooldownUntil = new Date(Date.now() + this.COOLDOWN_MS);
      console.warn(`[ProviderRouter] Provider ${providerName} marked unhealthy due to ${config.failureCount} consecutive failures. Cooldown until ${config.cooldownUntil}`);
    }
  }

  private handleSuccess(providerName: string) {
    const config = this.providers.get(providerName);
    if (!config) return;
    config.failureCount = 0;
    config.lastSuccess = new Date();
  }

  async send(request: SmsSendRequest): Promise<SmsSendResponse> {
    const primary = this.getActiveProvider();
    
    if (primary) {
      try {
        const result = await primary.send(request);
        if (result.success) {
          this.handleSuccess(primary.name);
          return result;
        } else {
          this.handleFailure(primary.name);
        }
      } catch (error) {
        this.handleFailure(primary.name);
      }
    }

    const fallback = this.getFallbackProvider();
    if (fallback) {
      console.log(`[ProviderRouter] Routing through fallback provider ${fallback.name} (idempotency key: ${request.idempotencyKey})`);
      try {
        const result = await fallback.send(request);
        if (result.success) {
          this.handleSuccess(fallback.name);
          return result;
        } else {
          this.handleFailure(fallback.name);
          return result;
        }
      } catch (error) {
        this.handleFailure(fallback.name);
        return { success: false, status: 'FAILED', error: 'Fallback provider also failed' };
      }
    }

    return { success: false, status: 'FAILED', error: 'No providers available' };
  }

  async sendBulk(requests: SmsSendRequest[]): Promise<SmsSendResponse[]> {
    const primary = this.getActiveProvider();
    if (primary) {
      try {
        const results = await primary.sendBulk(requests);
        this.handleSuccess(primary.name);
        return results;
      } catch (err) {
        this.handleFailure(primary.name);
      }
    }

    const fallback = this.getFallbackProvider();
    if (fallback) {
      try {
        const results = await fallback.sendBulk(requests);
        this.handleSuccess(fallback.name);
        return results;
      } catch (err) {
        this.handleFailure(fallback.name);
      }
    }

    return requests.map(() => ({ success: false, status: 'FAILED', error: 'No providers available' }));
  }

  async checkHealth(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    for (const [name, config] of this.providers.entries()) {
      try {
        const isHealthy = await config.provider.isHealthy();
        if (isHealthy) {
          this.handleSuccess(name);
        } else {
          this.handleFailure(name);
        }
        status[name] = config.healthy;
      } catch {
        this.handleFailure(name);
        status[name] = false;
      }
    }
    return status;
  }

  getProviderStatus(): Record<string, { healthy: boolean; failureCount: number; lastSuccess?: Date }> {
    this.updateHealth();
    const status: Record<string, { healthy: boolean; failureCount: number; lastSuccess?: Date }> = {};
    for (const [name, config] of this.providers.entries()) {
      status[name] = {
        healthy: config.healthy,
        failureCount: config.failureCount,
        lastSuccess: config.lastSuccess,
      };
    }
    return status;
  }
}
