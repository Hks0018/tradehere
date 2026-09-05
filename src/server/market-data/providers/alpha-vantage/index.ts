import { DailyCallBudget } from "../../budget";
import { marketDataConfig } from "../../config";
import { MarketDataError } from "../../errors";
import type { MarketDataProvider } from "../../provider.interface";
import type {
  CandleInterval,
  CompanyProfile,
  HistoricalCandle,
  InstrumentSearchResult,
  MarketNewsItem,
  NormalizedQuote,
  ProviderCapabilities,
  ProviderResult,
} from "../../types";
import { ALPHA_VANTAGE_ID, AlphaVantageClient } from "./client";
import {
  normalizeDailyCandles,
  normalizeNews,
  normalizeProfile,
  normalizeQuote,
  normalizeSearch,
} from "./normalize";
import { supportsFundamentals, toProviderSymbol } from "./symbol-map";

/**
 * ALPHA VANTAGE PROVIDER
 *
 * Capabilities reflect what a free key genuinely returns, established by real
 * requests rather than by reading marketing pages:
 *
 *   quotes        yes, end-of-day close for US and BSE listings
 *   historical    yes, daily OHLCV. Intraday is premium, so 1D falls back to
 *                 daily rather than inventing minute bars
 *   search        yes
 *   fundamentals  US listings only; `.BSE` returns an empty object
 *   news          yes, with sentiment
 *   indices       no — Alpha Vantage publishes no NIFTY/SENSEX symbol
 *   sectors       no endpoint
 *   breadth       no endpoint
 *
 * `getQuotes` is deliberately absent. Alpha Vantage has no batch quote
 * endpoint, so serving a list of 28 stocks would mean 28 calls against a
 * 25-a-day quota. Without the method, the registry routes every batch request
 * to the sample provider automatically, and single quotes — the stock detail
 * page — still get real data.
 */
export class AlphaVantageMarketDataProvider implements MarketDataProvider {
  readonly id = ALPHA_VANTAGE_ID;
  readonly label = "Alpha Vantage";
  /** Free keys allow a small number of calls per day. */
  readonly metered = true;

  readonly capabilities: ProviderCapabilities = {
    quotes: true,
    historical: true,
    search: true,
    fundamentals: true,
    news: true,
    indices: false,
    sectors: false,
    breadth: false,
    websocket: false,
  };

  private readonly client: AlphaVantageClient;
  private readonly budget: DailyCallBudget;
  private readonly now: () => number;

  /**
   * Remembers combinations this key demonstrably cannot serve.
   *
   * Successes are cached by the orchestrator, but failures were not — so an
   * uncovered symbol re-spent a call on every single page view. Since coverage
   * gaps and premium gating are stable facts about the plan, they are recorded
   * here and answered locally until the entry lapses.
   */
  private readonly unsupported = new Map<string, number>();

  constructor(now: () => number = Date.now) {
    this.now = now;
    this.budget = new DailyCallBudget(
      ALPHA_VANTAGE_ID,
      marketDataConfig.alphaVantage.dailyLimit,
      now,
    );
    this.client = new AlphaVantageClient({
      apiKey: marketDataConfig.alphaVantage.apiKey,
      baseUrl: marketDataConfig.alphaVantage.baseUrl,
      timeoutMs: marketDataConfig.alphaVantage.timeoutMs,
      budget: this.budget,
    });
  }

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  /** Remaining quota, for the health endpoint. Contains no credentials. */
  budgetSnapshot() {
    return this.client.budgetSnapshot();
  }

  /** How long a known coverage gap is trusted before being re-tested. */
  private static readonly UNSUPPORTED_TTL_MS = 6 * 60 * 60 * 1000;

  private assertSupported(operation: string, symbol: string): void {
    const key = `${operation}:${symbol}`;
    const until = this.unsupported.get(key);

    if (until !== undefined && this.now() < until) {
      throw new MarketDataError("NO_DATA", "Not covered for this instrument", {
        providerId: ALPHA_VANTAGE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }
    if (until !== undefined) this.unsupported.delete(key);
  }

  /** Runs a call, remembering coverage and entitlement gaps so they cost once. */
  private async attempt<T>(operation: string, symbol: string, run: () => Promise<T>): Promise<T> {
    this.assertSupported(operation, symbol);

    try {
      return await run();
    } catch (error) {
      const code = (error as MarketDataError)?.code;
      if (code === "NO_DATA" || code === "PREMIUM_REQUIRED") {
        this.unsupported.set(
          `${operation}:${symbol}`,
          this.now() + AlphaVantageMarketDataProvider.UNSUPPORTED_TTL_MS,
        );
      }
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    const providerSymbol = toProviderSymbol(symbol);

    return this.attempt("quote", providerSymbol, async () => {
      const body = await this.client.request({
        function: "GLOBAL_QUOTE",
        symbol: providerSymbol,
      });

      const quote = normalizeQuote(
        body,
        symbol.trim().toUpperCase(),
        symbol.trim().toUpperCase(),
        providerSymbol.endsWith(".BSE") ? "BSE" : "NASDAQ",
      );

      return { data: quote, status: "DELAYED" as const, timestamp: quote.timestamp };
    });
  }

  /**
   * Daily OHLCV.
   *
   * Intraday is a premium endpoint, so a 1D request is served with daily bars
   * rather than fabricated minute data. The interface still renders, and the
   * status makes clear this is not real-time.
   */
  async getHistoricalData(
    symbol: string,
    interval: CandleInterval,
  ): Promise<ProviderResult<HistoricalCandle[]>> {
    const providerSymbol = toProviderSymbol(symbol);

    // `full` is only worth the larger payload for multi-year windows.
    const outputsize = interval === "1Y" || interval === "5Y" ? "full" : "compact";

    return this.attempt("history", providerSymbol, async () => {
      const body = await this.client.request({
        function: "TIME_SERIES_DAILY",
        symbol: providerSymbol,
        outputsize,
      });

      const candles = trimToInterval(normalizeDailyCandles(body), interval);
      if (candles.length < 2) {
        throw new MarketDataError("NO_DATA", "Not enough history for this window", {
          providerId: ALPHA_VANTAGE_ID,
          retryable: true,
          affectsHealth: false,
        });
      }

      return {
        data: candles,
        status: "DELAYED" as const,
        timestamp: candles[candles.length - 1].timestamp,
      };
    });
  }

  async searchInstruments(
    query: string,
    limit: number,
  ): Promise<ProviderResult<InstrumentSearchResult[]>> {
    const term = query.trim();
    if (!term) return { data: [], status: "DELAYED", timestamp: new Date().toISOString() };

    const body = await this.client.request({ function: "SYMBOL_SEARCH", keywords: term });
    return {
      data: normalizeSearch(body).slice(0, limit),
      status: "DELAYED",
      timestamp: new Date().toISOString(),
    };
  }

  async getCompanyProfile(symbol: string): Promise<ProviderResult<CompanyProfile>> {
    const providerSymbol = toProviderSymbol(symbol);

    // Verified by real request: `.BSE` listings return `{}` from OVERVIEW.
    // Asking anyway would spend a call to learn nothing.
    if (!supportsFundamentals(providerSymbol)) {
      throw new MarketDataError("NO_DATA", "Fundamentals are not covered for this listing", {
        providerId: ALPHA_VANTAGE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }

    return this.attempt("profile", providerSymbol, async () => {
      const body = await this.client.request({ function: "OVERVIEW", symbol: providerSymbol });
      const profile = normalizeProfile(body, symbol.trim().toUpperCase(), "NASDAQ");
      return { data: profile, status: "DELAYED" as const, timestamp: profile.timestamp };
    });
  }

  async getMarketNews(symbol: string, limit: number): Promise<ProviderResult<MarketNewsItem[]>> {
    const providerSymbol = toProviderSymbol(symbol);

    return this.attempt("news", providerSymbol, async () => {
      const body = await this.client.request({
        function: "NEWS_SENTIMENT",
        tickers: providerSymbol,
        limit: String(Math.max(limit, 10)),
      });

      return {
        data: normalizeNews(body, limit),
        status: "DELAYED" as const,
        timestamp: new Date().toISOString(),
      };
    });
  }
}

/**
 * Narrows a daily series to the requested window.
 *
 * Alpha Vantage always returns daily bars, so a 1W or 1M chart is the tail of
 * the same series. 1D is given the last two weeks: a single bar would draw
 * nothing, and inventing intraday points to fill the gap is not an option.
 */
function trimToInterval(candles: HistoricalCandle[], interval: CandleInterval): HistoricalCandle[] {
  const TRADING_DAYS: Record<CandleInterval, number> = {
    "1D": 10,
    "1W": 10,
    "1M": 22,
    "1Y": 252,
    "5Y": 1260,
  };
  return candles.slice(-TRADING_DAYS[interval]);
}
