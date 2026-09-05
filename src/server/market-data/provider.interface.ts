import type {
  CandleInterval,
  CompanyProfile,
  HistoricalCandle,
  InstrumentSearchResult,
  MarketBreadth,
  MarketNewsItem,
  NormalizedIndex,
  NormalizedQuote,
  NormalizedSector,
  ProviderCapabilities,
  ProviderId,
  ProviderResult,
} from "./types";

/**
 * The contract every market-data source implements.
 *
 * Methods are optional on purpose: a provider declares what it can do through
 * `capabilities`, and the registry only routes work it has advertised. A quotes
 * vendor that has no fundamentals simply omits `getCompanyProfile`.
 *
 * Implementations are responsible for normalising their own wire format and
 * for throwing `MarketDataError` with an accurate code — the orchestrator uses
 * that code to decide whether to fail over.
 */
export interface MarketDataProvider {
  /** Stable id used in config, health output and the `source` field. */
  readonly id: ProviderId;
  /** Human-readable name for health reporting. */
  readonly label: string;
  readonly capabilities: ProviderCapabilities;
  /**
   * True when calls cost quota. Bulk work can opt out of metered providers so
   * a list of 28 instruments cannot spend a day's allowance in one render.
   */
  readonly metered?: boolean;

  /**
   * Whether this provider has everything it needs to run (credentials, base
   * URL, feature flag). Unconfigured providers are skipped without being
   * counted as failures, so they never trip a circuit breaker.
   */
  isConfigured(): boolean;

  /** Optional cheap liveness probe for the health endpoint. */
  healthCheck?(): Promise<void>;

  getQuote?(symbol: string): Promise<ProviderResult<NormalizedQuote>>;
  getQuotes?(symbols: string[]): Promise<ProviderResult<NormalizedQuote[]>>;
  getHistoricalData?(
    symbol: string,
    interval: CandleInterval,
  ): Promise<ProviderResult<HistoricalCandle[]>>;
  getIndices?(): Promise<ProviderResult<NormalizedIndex[]>>;
  searchInstruments?(query: string, limit: number): Promise<ProviderResult<InstrumentSearchResult[]>>;
  /** The tradable universe this provider knows about. */
  listInstruments?(): Promise<ProviderResult<InstrumentSearchResult[]>>;
  getSectorData?(): Promise<ProviderResult<NormalizedSector[]>>;
  getMarketBreadth?(): Promise<ProviderResult<MarketBreadth>>;
  getCompanyProfile?(symbol: string): Promise<ProviderResult<CompanyProfile>>;
  getMarketNews?(symbol: string, limit: number): Promise<ProviderResult<MarketNewsItem[]>>;
}
