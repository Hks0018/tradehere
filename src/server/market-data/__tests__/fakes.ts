import type { MarketDataProvider } from "../provider.interface";
import type { NormalizedQuote, ProviderCapabilities, ProviderResult } from "../types";
import { MarketDataError } from "../errors";

export const ALL_CAPABILITIES: ProviderCapabilities = {
  quotes: true,
  historical: true,
  indices: true,
  search: true,
  sectors: true,
  breadth: true,
  fundamentals: true,
  websocket: false,
  news: false,
};

export function makeQuote(symbol: string, price: number, source: string): NormalizedQuote {
  return {
    symbol,
    exchange: "NSE",
    instrumentId: `${source}-${symbol}`,
    name: `${symbol} Ltd`,
    currentPrice: price,
    previousClose: price - 1,
    open: price - 0.5,
    high: price + 1,
    low: price - 2,
    change: 1,
    changePercent: 0.5,
    volume: 1000,
    timestamp: "2026-09-04T10:00:00.000Z",
    source,
    dataStatus: "LIVE",
  };
}

/**
 * A controllable provider. `mode` decides how the next call behaves, and
 * `calls` records how many times it was actually invoked — which is what lets
 * the circuit-breaker tests prove a provider was *skipped* rather than merely
 * failing again.
 */
export class FakeProvider implements MarketDataProvider {
  calls = 0;
  mode: "ok" | "fail" | "rate-limited" | "invalid-symbol" | "garbage" = "ok";
  configured = true;

  constructor(
    readonly id: string,
    readonly price = 100,
    readonly capabilities: ProviderCapabilities = ALL_CAPABILITIES,
  ) {}

  get label() {
    return `Fake ${this.id}`;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    this.calls += 1;

    switch (this.mode) {
      case "fail":
        throw new MarketDataError("PROVIDER_UNAVAILABLE", "upstream down", { providerId: this.id });
      case "rate-limited":
        throw new MarketDataError("RATE_LIMITED", "429", { providerId: this.id });
      case "invalid-symbol":
        throw new MarketDataError("INVALID_SYMBOL", "no such symbol", { providerId: this.id });
      case "garbage":
        // Structurally wrong payload — the orchestrator must reject it.
        return {
          data: { symbol: "", currentPrice: Number.NaN } as unknown as NormalizedQuote,
          status: "LIVE",
          timestamp: "2026-09-04T10:00:00.000Z",
        };
      default:
        return {
          data: makeQuote(symbol, this.price, this.id),
          status: "LIVE",
          timestamp: "2026-09-04T10:00:00.000Z",
        };
    }
  }
}

/** Advanceable clock, so cooldown behaviour is tested without real waiting. */
export function makeClock(start = 1_000_000) {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}
