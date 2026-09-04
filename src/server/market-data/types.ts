/**
 * Normalized market-data contracts.
 *
 * Every provider must translate its own wire format into these shapes, so the
 * rest of Tradehere never learns which upstream supplied a figure. The fields
 * below are the guaranteed minimum; providers may attach richer optional data
 * (for example an index's region) when they have it.
 */

/**
 * Honesty about what the caller is looking at. This value travels with every
 * response and is surfaced in the UI — mock or stale data is never presented
 * as live.
 */
export type DataStatus =
  /** Real-time from an upstream feed. */
  | "LIVE"
  /** Real but intentionally lagged (typical of free upstream tiers). */
  | "DELAYED"
  /** Served from cache while still inside its TTL. */
  | "CACHED"
  /** Every provider failed; this is the last good value we hold, and it is stale. */
  | "LAST_KNOWN"
  /** Generated sample data. Never to be described as a real quote. */
  | "MOCK"
  /** Nothing could be produced. */
  | "UNAVAILABLE";

export type ProviderId = string;

export type CandleInterval = "1D" | "1W" | "1M" | "1Y" | "5Y";

/** What a provider is able to answer. The registry routes on these. */
export interface ProviderCapabilities {
  quotes: boolean;
  historical: boolean;
  indices: boolean;
  search: boolean;
  sectors: boolean;
  breadth: boolean;
  fundamentals: boolean;
  /** Streaming push. Nothing consumes this yet; reserved for Phase 2B. */
  websocket: boolean;
  news: boolean;
}

export type Capability = keyof ProviderCapabilities;

/* -------------------------------------------------------------------------- */
/* Normalized payloads                                                        */
/* -------------------------------------------------------------------------- */

export interface NormalizedQuote {
  symbol: string;
  exchange: string;
  instrumentId: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  /** ISO-8601 time the figure refers to (not the time we fetched it). */
  timestamp: string;
  source: ProviderId;
  dataStatus: DataStatus;
}

export interface HistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedIndex {
  symbol: string;
  name: string;
  currentValue: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  timestamp: string;
  source: ProviderId;
  /** Optional enrichment — present when the provider knows it. */
  region?: string;
  shortName?: string;
}

export type InstrumentType = "EQUITY" | "INDEX" | "ETF" | "FUND";

export interface InstrumentSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  instrumentType: InstrumentType;
  instrumentId: string;
  /** Optional enrichment used by the screener. */
  sector?: string;
}

export interface NormalizedSector {
  sector: string;
  /** Stable machine key, used for lookups and visual placement. */
  sectorId: string;
  performance: number;
  changePercent: number;
  advancingCount: number;
  decliningCount: number;
  /** Share of total market capitalisation, when the provider reports it. */
  marketCapShare?: number;
  timestamp: string;
}

/** Advance/decline and session state — standard breadth data. */
export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  sentimentScore: number;
  sentimentLabel: string;
  isOpen: boolean;
  sessionLabel: string;
  timestamp: string;
}

export interface CompanyFinancialYear {
  year: string;
  revenue: number;
  profit: number;
  ebitdaMargin: number;
}

/** Fundamentals — a separate capability from quotes, and often a separate vendor. */
export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  bookValue: number;
  dividendYield: number;
  high52: number;
  low52: number;
  roe: number;
  debtToEquity: number;
  revenueGrowth: number;
  profitGrowth: number;
  founded: number;
  headquarters: string;
  employees: number;
  website: string;
  financials: CompanyFinancialYear[];
  shareholding: { label: string; value: number }[];
  timestamp: string;
}

/* -------------------------------------------------------------------------- */
/* Envelopes                                                                  */
/* -------------------------------------------------------------------------- */

/** What a provider hands back: the payload plus how trustworthy it is. */
export interface ProviderResult<T> {
  data: T;
  status: DataStatus;
  /** ISO-8601 time the data refers to. */
  timestamp: string;
}

export interface ResponseMeta {
  /** The single provider that produced this payload. Never a blend. */
  source: ProviderId | null;
  status: DataStatus;
  /** When the data itself is from. */
  timestamp: string;
  /** When Tradehere obtained it. */
  retrievedAt: string;
  fromCache: boolean;
  /** True when the first-choice provider did not serve this request. */
  failoverUsed: boolean;
  /** Providers tried, in order, for this request. */
  attempted: ProviderId[];
}

/** The shape every orchestrator call and every internal API route returns. */
export interface DataEnvelope<T> {
  data: T;
  meta: ResponseMeta;
}
