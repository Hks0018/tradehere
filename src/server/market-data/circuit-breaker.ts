import type { ProviderId } from "./types";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  successThreshold: number;
  /** Injectable clock so cooldown behaviour is testable without waiting. */
  now?: () => number;
}

export interface CircuitSnapshot {
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number | null;
  /** When a HALF_OPEN trial becomes possible. Null unless OPEN. */
  retryAt: number | null;
}

/**
 * Per-provider circuit breaker.
 *
 * CLOSED → (failureThreshold consecutive failures) → OPEN → (cooldown elapses)
 * → HALF_OPEN → (successThreshold successes) → CLOSED, or one failure → OPEN.
 *
 * The point is to stop hammering a provider that is already down, so requests
 * fail over to the next provider immediately instead of paying the timeout.
 */
export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private consecutiveFailures = 0;
  private halfOpenSuccesses = 0;
  private openedAt: number | null = null;

  private readonly failureThreshold: number;
  private readonly cooldownMs: number;
  private readonly successThreshold: number;
  private readonly now: () => number;

  constructor(
    readonly providerId: ProviderId,
    options: CircuitBreakerOptions,
  ) {
    this.failureThreshold = Math.max(1, options.failureThreshold);
    this.cooldownMs = Math.max(0, options.cooldownMs);
    this.successThreshold = Math.max(1, options.successThreshold);
    this.now = options.now ?? Date.now;
  }

  /**
   * Whether a request may be sent. Transitions OPEN → HALF_OPEN once the
   * cooldown has elapsed, which is what lets a recovered provider back in.
   */
  canAttempt(): boolean {
    if (this.state === "CLOSED") return true;

    if (this.state === "OPEN") {
      if (this.openedAt !== null && this.now() - this.openedAt >= this.cooldownMs) {
        this.state = "HALF_OPEN";
        this.halfOpenSuccesses = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow trial traffic through.
    return true;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;

    if (this.state === "HALF_OPEN") {
      this.halfOpenSuccesses += 1;
      if (this.halfOpenSuccesses >= this.successThreshold) {
        this.state = "CLOSED";
        this.openedAt = null;
        this.halfOpenSuccesses = 0;
      }
      return;
    }

    this.state = "CLOSED";
    this.openedAt = null;
  }

  recordFailure(): void {
    this.consecutiveFailures += 1;

    // A failed trial sends us straight back to OPEN with a fresh cooldown.
    if (this.state === "HALF_OPEN") {
      this.trip();
      return;
    }

    if (this.consecutiveFailures >= this.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state = "OPEN";
    this.openedAt = this.now();
    this.halfOpenSuccesses = 0;
  }

  snapshot(): CircuitSnapshot {
    return {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      openedAt: this.openedAt,
      retryAt: this.state === "OPEN" && this.openedAt !== null ? this.openedAt + this.cooldownMs : null,
    };
  }

  /** Test/admin helper — returns the breaker to its initial state. */
  reset(): void {
    this.state = "CLOSED";
    this.consecutiveFailures = 0;
    this.halfOpenSuccesses = 0;
    this.openedAt = null;
  }
}
