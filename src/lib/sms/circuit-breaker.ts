import { redis, redisLock } from '@/lib/redis';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderCircuitStatus {
  providerId: string;
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime?: number;
  cooldownUntil?: number;
  successCountInHalfOpen: number;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownDurationMs?: number;
  halfOpenSuccessThreshold?: number;
}

const CIRCUIT_KEY_PREFIX = 'range-bulk-sms:circuit:provider:';
const GLOBAL_HALT_KEY = 'range-bulk-sms:circuit:global-halt';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Provider health is shared through Redis in production so web and worker
 * processes agree on open circuits and emergency dispatch halts.
 */
export class ProviderCircuitBreaker {
  private static circuits = new Map<string, ProviderCircuitStatus>();
  private static globalEmergencyHalted = false;

  static async setGlobalEmergencyHalt(halted: boolean): Promise<boolean> {
    if (!redis) {
      this.globalEmergencyHalted = halted;
      return !isProduction;
    }

    try {
      if (halted) await redis.set(GLOBAL_HALT_KEY, true);
      else await redis.del(GLOBAL_HALT_KEY);
      this.globalEmergencyHalted = false;
      console.warn(`[CIRCUIT_BREAKER] Global emergency halt is now: ${halted ? 'ACTIVE' : 'INACTIVE'}`);
      return true;
    } catch (error) {
      this.globalEmergencyHalted = false;
      this.reportFailure('global halt update', error);
      return false;
    }
  }

  static async isGloballyHalted(): Promise<boolean> {
    if (!redis) return isProduction || this.globalEmergencyHalted;

    try {
      const halted = await redis.get<boolean>(GLOBAL_HALT_KEY);
      return halted === true;
    } catch (error) {
      this.reportFailure('global halt read', error);
      return isProduction || this.globalEmergencyHalted;
    }
  }

  static async canExecute(
    providerId: string,
    _options: CircuitBreakerOptions = {}
  ): Promise<{ allowed: boolean; state: CircuitState; reason?: string }> {
    if (await this.isGloballyHalted()) {
      return { allowed: false, state: 'OPEN', reason: 'Global emergency dispatch halt is actively engaged.' };
    }

    if (!redis && isProduction) {
      return { allowed: false, state: 'OPEN', reason: 'Shared provider health state is unavailable; dispatch is paused.' };
    }

    const current = await this.readProviderState(providerId);
    if (!current) {
      return { allowed: false, state: 'OPEN', reason: 'Shared provider health state is unavailable; dispatch is paused.' };
    }

    if (current.state !== 'OPEN') {
      return { allowed: true, state: current.state };
    }

    if (!current.cooldownUntil || Date.now() < current.cooldownUntil) {
      const remainingMs = (current.cooldownUntil || 0) - Date.now();
      return {
        allowed: false,
        state: 'OPEN',
        reason: `Provider circuit is OPEN. Cooling down for ${Math.ceil(remainingMs / 1000)}s.`,
      };
    }

    const state = await this.withProviderState(providerId, (circuit) => {
      const now = Date.now();
      if (circuit.state === 'OPEN') {
        if (circuit.cooldownUntil && now >= circuit.cooldownUntil) {
          circuit.state = 'HALF_OPEN';
          circuit.successCountInHalfOpen = 0;
        } else {
          const remainingMs = (circuit.cooldownUntil || 0) - now;
          return {
            allowed: false,
            state: 'OPEN' as const,
            reason: `Provider circuit is OPEN. Cooling down for ${Math.ceil(remainingMs / 1000)}s.`,
          };
        }
      }
      return { allowed: true, state: circuit.state };
    });

    return state ?? {
      allowed: false,
      state: 'OPEN',
      reason: 'Shared provider health state is unavailable; dispatch is paused.',
    };
  }

  static async recordSuccess(providerId: string, options: CircuitBreakerOptions = {}): Promise<void> {
    await this.withProviderState(providerId, (circuit) => {
      const halfOpenThreshold = options.halfOpenSuccessThreshold ?? 2;
      if (circuit.state === 'HALF_OPEN') {
        circuit.successCountInHalfOpen += 1;
        if (circuit.successCountInHalfOpen >= halfOpenThreshold) {
          circuit.state = 'CLOSED';
          circuit.consecutiveFailures = 0;
          circuit.cooldownUntil = undefined;
          console.log(`[CIRCUIT_BREAKER] Provider ${providerId} recovered. Circuit is now CLOSED.`);
        }
      } else if (circuit.state === 'CLOSED') {
        circuit.consecutiveFailures = 0;
      }
    });
  }

  static async recordFailure(providerId: string, options: CircuitBreakerOptions = {}): Promise<void> {
    await this.withProviderState(providerId, (circuit) => {
      const failureThreshold = options.failureThreshold ?? 5;
      const cooldownDuration = options.cooldownDurationMs ?? 60_000;
      const now = Date.now();
      circuit.consecutiveFailures += 1;
      circuit.lastFailureTime = now;

      if (circuit.state === 'HALF_OPEN' || circuit.consecutiveFailures >= failureThreshold) {
        circuit.state = 'OPEN';
        circuit.cooldownUntil = now + cooldownDuration;
        console.warn(
          `[CIRCUIT_BREAKER] Provider ${providerId} tripped to OPEN (${circuit.consecutiveFailures} consecutive failures). Cooldown for ${cooldownDuration / 1000}s.`
        );
      }
    });
  }

  static async reset(providerId: string): Promise<void> {
    this.circuits.delete(providerId);
    if (!redis) return;
    const lockKey = `circuit:${providerId}`;
    let token: string | undefined;
    try {
      const lock = await redisLock.acquire(lockKey, 10);
      if (!lock.acquired) return;
      token = lock.token;
      await redis.del(`${CIRCUIT_KEY_PREFIX}${providerId}`);
    } catch (error) {
      this.reportFailure('provider circuit reset', error);
    } finally {
      if (token) await redisLock.release(lockKey, token);
    }
  }

  static async getStatus(): Promise<ProviderCircuitStatus[]> {
    if (!redis) return Array.from(this.circuits.values());
    try {
      let cursor = '0';
      const keys: string[] = [];
      do {
        const [nextCursor, batch] = await redis.scan(cursor, { match: `${CIRCUIT_KEY_PREFIX}*`, count: 100 });
        cursor = String(nextCursor);
        keys.push(...batch);
      } while (cursor !== '0');

      const statuses = await Promise.all(keys.map((key) => redis.get<ProviderCircuitStatus>(key)));
      return statuses.filter((status): status is ProviderCircuitStatus => status !== null);
    } catch (error) {
      this.reportFailure('provider circuit status read', error);
      return isProduction ? [] : Array.from(this.circuits.values());
    }
  }

  private static async withProviderState<T>(
    providerId: string,
    operation: (circuit: ProviderCircuitStatus) => T
  ): Promise<T | null> {
    if (redis) {
      let token: string | undefined;
      try {
        const lock = await redisLock.acquire(`circuit:${providerId}`, 10);
        if (!lock.acquired) return null;
        token = lock.token;

        const key = `${CIRCUIT_KEY_PREFIX}${providerId}`;
        const circuit = (await redis.get<ProviderCircuitStatus>(key)) ?? this.createCircuit(providerId);
        const result = operation(circuit);
        await redis.set(key, circuit);
        return result;
      } catch (error) {
        this.reportFailure('provider circuit update', error);
        if (isProduction) return null;
      } finally {
        if (token) await redisLock.release(`circuit:${providerId}`, token);
      }
    } else if (isProduction) {
      return null;
    }

    const circuit = this.circuits.get(providerId) ?? this.createCircuit(providerId);
    this.circuits.set(providerId, circuit);
    return operation(circuit);
  }

  private static async readProviderState(providerId: string): Promise<ProviderCircuitStatus | null> {
    if (redis) {
      try {
        return (await redis.get<ProviderCircuitStatus>(`${CIRCUIT_KEY_PREFIX}${providerId}`)) ?? this.createCircuit(providerId);
      } catch (error) {
        this.reportFailure('provider circuit read', error);
        return isProduction ? null : (this.circuits.get(providerId) ?? this.createCircuit(providerId));
      }
    }

    return isProduction ? null : (this.circuits.get(providerId) ?? this.createCircuit(providerId));
  }

  private static createCircuit(providerId: string): ProviderCircuitStatus {
    return {
      providerId,
      state: 'CLOSED',
      consecutiveFailures: 0,
      successCountInHalfOpen: 0,
    };
  }

  private static reportFailure(operation: string, error: unknown) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error(`[CIRCUIT_BREAKER] Redis ${operation} failed (${errorName}).`);
  }
}
