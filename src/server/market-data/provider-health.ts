import { CircuitBreaker, type CircuitSnapshot } from "./circuit-breaker";
import { marketDataConfig } from "./config";
import type { ProviderId } from "./types";

export type ProviderHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export interface ProviderHealthSnapshot {
  providerId: ProviderId;
  status: ProviderHealthStatus;
  configured: boolean;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  /** Error *code* only — upstream messages never reach this surface. */
  lastErrorCode: string | null;
  circuit: CircuitSnapshot;
}

interface ProviderRecord {
  breaker: CircuitBreaker;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastErrorCode: string | null;
}

/**
 * Tracks how each provider is behaving and owns its circuit breaker.
 *
 * Health is derived rather than stored: an open circuit means UNAVAILABLE, any
 * recent failure means DEGRADED, otherwise HEALTHY.
 */
export class ProviderHealthRegistry {
  private readonly records = new Map<ProviderId, ProviderRecord>();

  constructor(private readonly now: () => number = Date.now) {}

  private record(providerId: ProviderId): ProviderRecord {
    let record = this.records.get(providerId);
    if (!record) {
      record = {
        breaker: new CircuitBreaker(providerId, {
          ...marketDataConfig.circuitBreaker,
          now: this.now,
        }),
        consecutiveFailures: 0,
        totalRequests: 0,
        totalFailures: 0,
        lastSuccessAt: null,
        lastFailureAt: null,
        lastErrorCode: null,
      };
      this.records.set(providerId, record);
    }
    return record;
  }

  /** False when the provider's circuit is open and still cooling down. */
  canAttempt(providerId: ProviderId): boolean {
    return this.record(providerId).breaker.canAttempt();
  }

  recordSuccess(providerId: ProviderId): void {
    const record = this.record(providerId);
    record.breaker.recordSuccess();
    record.consecutiveFailures = 0;
    record.totalRequests += 1;
    record.lastSuccessAt = this.now();
  }

  recordFailure(providerId: ProviderId, errorCode: string): void {
    const record = this.record(providerId);
    record.breaker.recordFailure();
    record.consecutiveFailures += 1;
    record.totalRequests += 1;
    record.totalFailures += 1;
    record.lastFailureAt = this.now();
    record.lastErrorCode = errorCode;
  }

  status(providerId: ProviderId, configured: boolean): ProviderHealthStatus {
    if (!configured) return "UNAVAILABLE";
    const record = this.record(providerId);
    const open = record.breaker.snapshot().state === "OPEN";

    // Being rate limited is reported distinctly from being broken: the
    // provider is fine, the quota is spent, and it will recover on its own.
    if (record.lastErrorCode === "RATE_LIMITED" && (open || record.consecutiveFailures > 0)) {
      return "RATE_LIMITED";
    }
    if (open) return "UNAVAILABLE";
    if (record.consecutiveFailures > 0) return "DEGRADED";
    return "HEALTHY";
  }

  snapshot(providerId: ProviderId, configured: boolean): ProviderHealthSnapshot {
    const record = this.record(providerId);
    const toIso = (value: number | null) => (value === null ? null : new Date(value).toISOString());

    return {
      providerId,
      status: this.status(providerId, configured),
      configured,
      consecutiveFailures: record.consecutiveFailures,
      totalRequests: record.totalRequests,
      totalFailures: record.totalFailures,
      lastSuccessAt: toIso(record.lastSuccessAt),
      lastFailureAt: toIso(record.lastFailureAt),
      lastErrorCode: record.lastErrorCode,
      circuit: record.breaker.snapshot(),
    };
  }

  reset(): void {
    this.records.clear();
  }
}
