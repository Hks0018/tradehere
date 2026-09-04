import { MarketDataError } from "../errors";
import type { MarketDataProvider } from "../provider.interface";
import type {
  CandleInterval,
  HistoricalCandle,
  InstrumentSearchResult,
  NormalizedIndex,
  NormalizedQuote,
  ProviderCapabilities,
  ProviderResult,
} from "../types";

export interface RestProviderConfig {
  id: string;
  label: string;
  capabilities: ProviderCapabilities;
  enabled: boolean;
  baseUrl: string | undefined;
  apiKey: string | undefined;
  timeoutMs: number;
  /** Whether this vendor's tier serves real-time or lagged prices. */
  dataStatus: "LIVE" | "DELAYED";
}

/**
 * The wire shape Tradehere expects from a REST market-data vendor.
 *
 * Vendors differ, so Phase 2B either points a provider at an endpoint that
 * already matches this contract, or subclasses and overrides the `normalize*`
 * methods. Either way the HTTP mechanics, timeout handling, error
 * classification and validation below are shared and do not get rewritten.
 */
interface WireQuote {
  symbol: string;
  name?: string;
  exchange?: string;
  instrumentId?: string;
  price: number;
  previousClose: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  timestamp?: string;
}

interface WireCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface WireIndex {
  symbol: string;
  name: string;
  value: number;
  previousClose: number;
  open?: number;
  high?: number;
  low?: number;
  timestamp?: string;
  region?: string;
  shortName?: string;
}

interface WireInstrument {
  symbol: string;
  name: string;
  exchange?: string;
  instrumentId?: string;
  type?: string;
}

/**
 * Shared implementation for HTTP market-data vendors.
 *
 * `isConfigured()` returns false until the feature flag, base URL and key are
 * all present, which is what keeps these providers inert — and out of the
 * failover chain entirely — while the platform runs on sample data.
 */
export class RestMarketDataProvider implements MarketDataProvider {
  readonly id: string;
  readonly label: string;
  readonly capabilities: ProviderCapabilities;

  constructor(protected readonly config: RestProviderConfig) {
    this.id = config.id;
    this.label = config.label;
    this.capabilities = config.capabilities;
  }

  isConfigured(): boolean {
    return Boolean(this.config.enabled && this.config.baseUrl && this.config.apiKey);
  }

  async healthCheck(): Promise<void> {
    this.assertConfigured();
    await this.request<unknown>("/health", {});
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    const payload = await this.request<WireQuote>("/quote", { symbol });
    return this.wrap(this.normalizeQuote(payload));
  }

  async getQuotes(symbols: string[]): Promise<ProviderResult<NormalizedQuote[]>> {
    const payload = await this.request<WireQuote[]>("/quotes", { symbols: symbols.join(",") });
    this.assertArray(payload);
    return this.wrap(payload.map((entry) => this.normalizeQuote(entry)));
  }

  async getHistoricalData(
    symbol: string,
    interval: CandleInterval,
  ): Promise<ProviderResult<HistoricalCandle[]>> {
    const payload = await this.request<WireCandle[]>("/history", { symbol, interval });
    this.assertArray(payload);
    return this.wrap(payload.map((entry) => this.normalizeCandle(entry)));
  }

  async getIndices(): Promise<ProviderResult<NormalizedIndex[]>> {
    const payload = await this.request<WireIndex[]>("/indices", {});
    this.assertArray(payload);
    return this.wrap(payload.map((entry) => this.normalizeIndex(entry)));
  }

  async searchInstruments(
    query: string,
    limit: number,
  ): Promise<ProviderResult<InstrumentSearchResult[]>> {
    const payload = await this.request<WireInstrument[]>("/search", { q: query, limit });
    this.assertArray(payload);
    return this.wrap(payload.map((entry) => this.normalizeInstrument(entry)));
  }

  /* ---------------------------------------------------------------------- */
  /* Normalisation — override these to fit a specific vendor                */
  /* ---------------------------------------------------------------------- */

  protected normalizeQuote(raw: WireQuote): NormalizedQuote {
    if (!raw || typeof raw.symbol !== "string" || !Number.isFinite(raw.price)) {
      throw new MarketDataError("VALIDATION_FAILED", "Quote payload failed validation", {
        providerId: this.id,
      });
    }

    const previousClose = Number.isFinite(raw.previousClose) ? raw.previousClose : raw.price;
    const change = Number((raw.price - previousClose).toFixed(4));
    const changePercent = previousClose === 0 ? 0 : Number(((change / previousClose) * 100).toFixed(4));

    return {
      symbol: raw.symbol.toUpperCase(),
      exchange: raw.exchange ?? "",
      instrumentId: raw.instrumentId ?? `${this.id}-${raw.symbol.toUpperCase()}`,
      name: raw.name ?? raw.symbol.toUpperCase(),
      currentPrice: raw.price,
      previousClose,
      open: raw.open ?? previousClose,
      high: raw.high ?? Math.max(raw.price, previousClose),
      low: raw.low ?? Math.min(raw.price, previousClose),
      change,
      changePercent,
      volume: raw.volume ?? 0,
      timestamp: raw.timestamp ?? new Date().toISOString(),
      source: this.id,
      dataStatus: this.config.dataStatus,
    };
  }

  protected normalizeCandle(raw: WireCandle): HistoricalCandle {
    if (!raw || !Number.isFinite(raw.close)) {
      throw new MarketDataError("VALIDATION_FAILED", "Candle payload failed validation", {
        providerId: this.id,
      });
    }
    return {
      timestamp: raw.timestamp,
      open: raw.open,
      high: raw.high,
      low: raw.low,
      close: raw.close,
      volume: raw.volume ?? 0,
    };
  }

  protected normalizeIndex(raw: WireIndex): NormalizedIndex {
    if (!raw || !Number.isFinite(raw.value)) {
      throw new MarketDataError("VALIDATION_FAILED", "Index payload failed validation", {
        providerId: this.id,
      });
    }
    const change = Number((raw.value - raw.previousClose).toFixed(4));
    const changePercent =
      raw.previousClose === 0 ? 0 : Number(((change / raw.previousClose) * 100).toFixed(4));

    return {
      symbol: raw.symbol.toUpperCase(),
      name: raw.name,
      currentValue: raw.value,
      previousClose: raw.previousClose,
      change,
      changePercent,
      open: raw.open ?? raw.previousClose,
      high: raw.high ?? Math.max(raw.value, raw.previousClose),
      low: raw.low ?? Math.min(raw.value, raw.previousClose),
      timestamp: raw.timestamp ?? new Date().toISOString(),
      source: this.id,
      region: raw.region,
      shortName: raw.shortName,
    };
  }

  protected normalizeInstrument(raw: WireInstrument): InstrumentSearchResult {
    return {
      symbol: raw.symbol.toUpperCase(),
      name: raw.name,
      exchange: raw.exchange ?? "",
      instrumentType: raw.type === "INDEX" || raw.type === "ETF" || raw.type === "FUND" ? raw.type : "EQUITY",
      instrumentId: raw.instrumentId ?? `${this.id}-${raw.symbol.toUpperCase()}`,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* HTTP                                                                   */
  /* ---------------------------------------------------------------------- */

  private wrap<T>(data: T): ProviderResult<T> {
    return { data, status: this.config.dataStatus, timestamp: new Date().toISOString() };
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new MarketDataError("PROVIDER_NOT_CONFIGURED", `${this.id} is not configured`, {
        providerId: this.id,
      });
    }
  }

  private assertArray(payload: unknown): asserts payload is unknown[] {
    if (!Array.isArray(payload)) {
      throw new MarketDataError("VALIDATION_FAILED", "Expected a list payload", {
        providerId: this.id,
      });
    }
  }

  /**
   * Performs the call and translates transport outcomes into the error
   * taxonomy, so the orchestrator can tell "back off from this vendor" apart
   * from "the caller asked for a symbol that does not exist".
   */
  protected async request<T>(path: string, params: Record<string, string | number>): Promise<T> {
    this.assertConfigured();

    const url = new URL(path.replace(/^\//, ""), `${this.config.baseUrl!.replace(/\/$/, "")}/`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          // The key stays server-side; it is never returned to a caller.
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (response.status === 429) {
        throw new MarketDataError("RATE_LIMITED", "Upstream rate limit reached", {
          providerId: this.id,
        });
      }
      if (response.status === 404) {
        throw new MarketDataError("INVALID_SYMBOL", "Upstream reported an unknown instrument", {
          providerId: this.id,
        });
      }
      if (!response.ok) {
        throw new MarketDataError("PROVIDER_UNAVAILABLE", `Upstream responded ${response.status}`, {
          providerId: this.id,
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof MarketDataError) throw error;
      const aborted = error instanceof Error && error.name === "AbortError";
      throw new MarketDataError(
        aborted ? "PROVIDER_UNAVAILABLE" : "NETWORK_ERROR",
        aborted ? "Upstream request timed out" : "Upstream request failed",
        { providerId: this.id, cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
