import { describe, it, expect, beforeEach } from "vitest";
import { ProviderCircuitBreaker } from "../lib/sms/circuit-breaker";

describe("ProviderCircuitBreaker", () => {
  beforeEach(() => {
    ProviderCircuitBreaker.reset("test-provider");
    ProviderCircuitBreaker.setGlobalEmergencyHalt(false);
  });

  it("should permit execution when circuit is CLOSED", () => {
    const status = ProviderCircuitBreaker.canExecute("test-provider");
    expect(status.allowed).toBe(true);
    expect(status.state).toBe("CLOSED");
  });

  it("should trip to OPEN after 5 consecutive failures", () => {
    for (let i = 0; i < 4; i++) {
      ProviderCircuitBreaker.recordFailure("test-provider", { failureThreshold: 5 });
      const check = ProviderCircuitBreaker.canExecute("test-provider");
      expect(check.allowed).toBe(true);
    }

    // 5th failure should trip the breaker
    ProviderCircuitBreaker.recordFailure("test-provider", { failureThreshold: 5, cooldownDurationMs: 30000 });
    const tripped = ProviderCircuitBreaker.canExecute("test-provider");
    expect(tripped.allowed).toBe(false);
    expect(tripped.state).toBe("OPEN");
    expect(tripped.reason).toMatch(/Provider circuit is OPEN/);
  });

  it("should immediately halt all dispatch when global emergency shutdown is active", () => {
    ProviderCircuitBreaker.setGlobalEmergencyHalt(true);

    const check = ProviderCircuitBreaker.canExecute("test-provider");
    expect(check.allowed).toBe(false);
    expect(check.reason).toMatch(/Global emergency dispatch halt/);
  });

  it("should recover to CLOSED after consecutive successes in HALF_OPEN", () => {
    // Trip to open with 0ms cooldown for instant test transition
    ProviderCircuitBreaker.recordFailure("test-provider", { failureThreshold: 1, cooldownDurationMs: -1 });

    // Transition to HALF_OPEN on next call
    const halfOpenCheck = ProviderCircuitBreaker.canExecute("test-provider", { cooldownDurationMs: -1 });
    expect(halfOpenCheck.allowed).toBe(true);
    expect(halfOpenCheck.state).toBe("HALF_OPEN");

    // Record two successes in HALF_OPEN to close circuit
    ProviderCircuitBreaker.recordSuccess("test-provider", { halfOpenSuccessThreshold: 2 });
    ProviderCircuitBreaker.recordSuccess("test-provider", { halfOpenSuccessThreshold: 2 });

    const recovered = ProviderCircuitBreaker.canExecute("test-provider");
    expect(recovered.allowed).toBe(true);
    expect(recovered.state).toBe("CLOSED");
  });
});
