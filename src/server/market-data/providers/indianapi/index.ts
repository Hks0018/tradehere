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
import { INDIANAPI_ID, IndianApiClient } from "./client";
import {
  normalizeHistorical,
  normalizeNews,
  normalizeProfile,
  normalizeQuote,
  normalizeSearch,
} from "./normalize";
import { toProviderName } from "./symbol-map";

const PERIOD_BY_INTERVAL: Record<CandleInterval, string> = {
  "1D": "1m",
  "1W": "1m",
  "1M": "6m",
  "1Y": "1yr",
  "5Y": "5yr",
};

/** Mirrors the tail-slice Alpha Vantage's daily series is trimmed to. */
const TRADING_DAYS: Record<CandleInterval, number> = {
  "1D": 10,
  "1W": 10,
  "1M": 22,
  "1Y": 252,
  "5Y": 1260,
};

/**
 * INDIANAPI PROVIDER
 *
 * indianapi.in is a third-party API marketplace reselling NSE/BSE data, not
 * an exchange-authorized vendor — its own Terms of Service disclaim any
 * accuracy or availability warranty and place responsibility for legal
 * compliance on the integrator, rather than asserting a data license from
 * NSE or BSE. It was wired in at the user's explicit direction after that gap
 * was raised and acknowledged; the `source` field still reports it honestly
 * as "indianapi" so nothing here is mistaken for a licensed feed.
 *
 * Capabilities reflect what the real endpoints return, established by actual
 * requests rather than the (partially incomplete) published docs:
 *
 *   quotes        yes, via /stock — no volume field and no intraday open
 *   historical    yes, via /historical_data — daily close + volume only, no
 *                 true OHLC, so open/high/low collapse to the close
 *   search        yes, via /industry_search
 *   fundamentals  yes, via /stock's embedded profile/metrics — financials and
 *                 several ratios are absent and stay at zero
 *   news          yes, via /stock's embedded recentNews
 *   indices       no — no NIFTY/SENSEX/BANKNIFTY endpoint was found
 *   sectors       no sector-breadth endpoint was found
 *   breadth       no advance/decline endpoint was found
 */
export class IndianApiMarketDataProvider implements MarketDataProvider {
  readonly id = INDIANAPI_ID;
  readonly label = "IndianAPI";
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

  private readonly client: IndianApiClient;

  constructor() {
    this.client = new IndianApiClient({
      apiKey: marketDataConfig.indianApi.apiKey,
      baseUrl: marketDataConfig.indianApi.baseUrl,
      timeoutMs: marketDataConfig.indianApi.timeoutMs,
    });
  }

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    const body = await this.client.request("/stock", { name: toProviderName(symbol) });
    const quote = normalizeQuote(body, symbol.trim().toUpperCase());
    return { data: quote, status: "DELAYED", timestamp: quote.timestamp };
  }

  async getHistoricalData(
    symbol: string,
    interval: CandleInterval,
  ): Promise<ProviderResult<HistoricalCandle[]>> {
    const body = await this.client.request("/historical_data", {
      stock_name: toProviderName(symbol),
      period: PERIOD_BY_INTERVAL[interval],
      filter: "price",
    });

    const candles = normalizeHistorical(body).slice(-TRADING_DAYS[interval]);
    if (candles.length < 2) {
      throw new MarketDataError("NO_DATA", "Not enough history for this window", {
        providerId: INDIANAPI_ID,
        retryable: true,
        affectsHealth: false,
      });
    }

    return {
      data: candles,
      status: "DELAYED",
      timestamp: candles[candles.length - 1].timestamp,
    };
  }

  async searchInstruments(
    query: string,
    limit: number,
  ): Promise<ProviderResult<InstrumentSearchResult[]>> {
    const term = query.trim();
    if (!term) return { data: [], status: "DELAYED", timestamp: new Date().toISOString() };

    const body = await this.client.request("/industry_search", { query: term });
    return {
      data: normalizeSearch(body).slice(0, limit),
      status: "DELAYED",
      timestamp: new Date().toISOString(),
    };
  }

  async getCompanyProfile(symbol: string): Promise<ProviderResult<CompanyProfile>> {
    const body = await this.client.request("/stock", { name: toProviderName(symbol) });
    const profile = normalizeProfile(body, symbol.trim().toUpperCase());
    return { data: profile, status: "DELAYED", timestamp: profile.timestamp };
  }

  async getMarketNews(symbol: string, limit: number): Promise<ProviderResult<MarketNewsItem[]>> {
    const tradehereSymbol = symbol.trim().toUpperCase();
    const body = await this.client.request("/stock", { name: toProviderName(symbol) });
    return {
      data: normalizeNews(body, tradehereSymbol, limit),
      status: "DELAYED",
      timestamp: new Date().toISOString(),
    };
  }
}
