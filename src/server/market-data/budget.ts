import type { ProviderId } from "./types";

export interface BudgetSnapshot {
  used: number;
  limit: number;
  remaining: number;
  /** UTC day the counter belongs to; it resets when this rolls over. */
  day: string;
  exhausted: boolean;
}

/**
 * Daily call budget for metered providers.
 *
 * A free Alpha Vantage key allows a small number of calls per day. Spending
 * them is easy and the consequence is a dead data source, so the engine keeps
 * its own count and stops *before* the upstream starts refusing — a local
 * decision is free, a rejected HTTP round trip is not, and it keeps the
 * provider out of a failure spiral.
 *
 * A reserve can be held back so interactive requests still work after bulk
 * ones have used most of the quota.
 */
export class DailyCallBudget {
  private day: string;
  private used = 0;

  constructor(
    readonly providerId: ProviderId,
    private readonly limit: number,
    private readonly now: () => number = Date.now,
  ) {
    this.day = this.currentDay();
  }

  private currentDay(): string {
    return new Date(this.now()).toISOString().slice(0, 10);
  }

  private rollover(): void {
    const today = this.currentDay();
    if (today !== this.day) {
      this.day = today;
      this.used = 0;
    }
  }

  /** True when a call may be made, leaving `reserve` calls untouched. */
  canSpend(reserve = 0): boolean {
    this.rollover();
    return this.used + reserve < this.limit;
  }

  spend(): void {
    this.rollover();
    this.used += 1;
  }

  /**
   * Upstream told us the quota is gone, so trust it over the local count and
   * close the budget for the rest of the day.
   */
  markExhausted(): void {
    this.rollover();
    this.used = this.limit;
  }

  snapshot(): BudgetSnapshot {
    this.rollover();
    return {
      used: this.used,
      limit: this.limit,
      remaining: Math.max(this.limit - this.used, 0),
      day: this.day,
      exhausted: this.used >= this.limit,
    };
  }
}
