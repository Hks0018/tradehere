import { marketDataConfig } from "../../config";
import { MarketDataError } from "../../errors";
import type { MarketDataProvider } from "../../provider.interface";
import type { NormalizedIndex, ProviderCapabilities, ProviderResult } from "../../types";
import { fetchIndicesClose, NSE_ID } from "./client";
import { parseIndicesClose } from "./normalize";

/**
 * Resolves the day's indices dataset once, caches it in memory, and
 * re-checks for a newer trading day only after `recheckMs` — so every
 * request within that window is a Map lookup, not a network call. A failed
 * resolution is not cached: the next request simply tries again, bounded by
 * the orchestrator's own circuit breaker so a sustained outage cannot cause
 * a request storm.
 */
class DailyDataset {
  private cache: { resolvedAt: number; rows: Map<string, NormalizedIndex> } | undefined;
  private pending: Promise<Map<string, NormalizedIndex>> | undefined;

  constructor(
    private readonly now: () => number,
    private readonly recheckMs: number,
    private readonly load: () => Promise<Map<string, NormalizedIndex>>,
  ) {}

  async rows(): Promise<Map<string, NormalizedIndex>> {
    if (this.cache && this.now() - this.cache.resolvedAt < this.recheckMs) {
      return this.cache.rows;
    }
    if (!this.pending) {
      this.pending = this.load()
        .then((rows) => {
          this.cache = { resolvedAt: this.now(), rows };
          return rows;
        })
        .finally(() => {
          this.pending = undefined;
        });
    }
    return this.pending;
  }
}

/**
 * NSE INDICES PROVIDER
 *
 * Sourced from NSE's own published end-of-day indices-close report rather
 * than the interactive nseindia.com API. That API sits behind Akamai bot
 * detection a server-side request cannot pass: verified directly, even a
 * plain GET of the homepage returns HTTP 403 with no cookies ever issued.
 * The archive host serving this report is a separate, unprotected static
 * file server.
 *
 * The trade-off is freshness, not reliability: this is the previous closing
 * session, published once a day, never an intraday feed. Every response is
 * stamped DELAYED and dated with the session it refers to, matching how
 * Alpha Vantage's own EOD quotes are already labelled, so the UI treats both
 * the same honest way.
 *
 * Covers only four of Tradehere's eight indices — NIFTY 50, NIFTY BANK,
 * NIFTY MIDCAP 100 and NIFTY IT are NSE-published; SENSEX is a BSE index and
 * the rest are global benchmarks, genuinely outside NSE's data. Because of
 * that partial coverage, this provider deliberately implements only
 * `getIndex` (one index at a time), never the bulk `getIndices` — a partial
 * bulk answer would silently drop the four indices it does not cover from
 * the board instead of leaving them to the sample provider.
 */
export class NseIndicesProvider implements MarketDataProvider {
  readonly id = NSE_ID;
  readonly label = "NSE India";
  /** No quota to protect — this is a public, unauthenticated static file. */
  readonly metered = false;

  readonly capabilities: ProviderCapabilities = {
    quotes: false,
    historical: false,
    indices: true,
    search: false,
    sectors: false,
    breadth: false,
    fundamentals: false,
    websocket: false,
    news: false,
  };

  private readonly enabled: boolean;
  private readonly dataset: DailyDataset;

  constructor(now: () => number = Date.now) {
    const config = marketDataConfig.nse;
    this.enabled = config.enabled;

    this.dataset = new DailyDataset(now, config.recheckMs, async () => {
      const { tradingDate, text } = await fetchIndicesClose(
        { archiveBaseUrl: config.archiveBaseUrl, timeoutMs: config.timeoutMs, lookbackDays: config.lookbackDays },
        now,
      );
      return parseIndicesClose(text, tradingDate);
    });
  }

  isConfigured(): boolean {
    return this.enabled;
  }

  async healthCheck(): Promise<void> {
    await this.dataset.rows();
  }

  async getIndex(symbol: string): Promise<ProviderResult<NormalizedIndex>> {
    const rows = await this.dataset.rows();
    const index = rows.get(symbol.trim().toUpperCase());
    if (!index) {
      throw new MarketDataError("NO_DATA", `${symbol} is not among NSE's published indices`, {
        providerId: NSE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }
    return { data: index, status: "DELAYED", timestamp: index.timestamp };
  }
}
