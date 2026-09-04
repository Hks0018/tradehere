/**
 * Shared domain models for the Tradehere platform.
 *
 * These types describe the shape of the data the UI consumes. In Phase 1 they
 * are satisfied by the mock datasets in `src/data`; in Phase 2 a real API
 * adapter must satisfy exactly the same contracts, so no UI code changes.
 */

export type Trend = "up" | "down" | "flat";

export interface PricePoint {
  /** ISO date (daily series) or `HH:MM` label (intraday series). */
  t: string;
  v: number;
}

export type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

export interface MarketIndex {
  id: string;
  name: string;
  shortName: string;
  region: "India" | "Global";
  value: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  series: PricePoint[];
}

export type MarketCapBucket = "Large Cap" | "Mid Cap" | "Small Cap";

export interface Stock {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  capBucket: MarketCapBucket;
  volume: number;
  pe: number;
  eps: number;
  high52: number;
  low52: number;
  dividendYield: number;
  bookValue: number;
  tags: Array<"popular" | "trending" | "active">;
  series: PricePoint[];
}

export interface FinancialYear {
  year: string;
  revenue: number;
  profit: number;
  ebitdaMargin: number;
}

export interface StockDetail extends Stock {
  description: string;
  founded: number;
  headquarters: string;
  employees: number;
  website: string;
  financials: FinancialYear[];
  shareholding: { label: string; value: number }[];
  revenueGrowth: number;
  profitGrowth: number;
  roe: number;
  debtToEquity: number;
}

export interface Sector {
  id: string;
  name: string;
  changePercent: number;
  marketCapShare: number;
  advancers: number;
  decliners: number;
}

export interface MarketSentiment {
  /** 0 (extreme fear) – 100 (extreme greed). */
  score: number;
  label: string;
  advancers: number;
  decliners: number;
  unchanged: number;
  updatedLabel: string;
}

export interface MarketHighlight {
  id: string;
  title: string;
  detail: string;
  tone: "positive" | "negative" | "neutral";
}

export type FundCategory = "Equity" | "Debt" | "Hybrid" | "Index";
export type RiskLevel = "Low" | "Moderate" | "High" | "Very High";

export interface MutualFund {
  id: string;
  name: string;
  house: string;
  category: FundCategory;
  subCategory: string;
  risk: RiskLevel;
  nav: number;
  aum: number;
  expenseRatio: number;
  minSip: number;
  rating: number;
  returns: { y1: number; y3: number; y5: number };
  series: PricePoint[];
}

export type IpoStatus = "Upcoming" | "Open" | "Listed";

export interface Ipo {
  id: string;
  company: string;
  sector: string;
  status: IpoStatus;
  priceBand: { min: number; max: number };
  lotSize: number;
  issueSize: number;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  listingPrice?: number;
  currentPrice?: number;
  subscriptionTimes?: number;
  summary: string;
}

export type NewsCategory =
  | "Markets"
  | "Stocks"
  | "Economy"
  | "Business"
  | "Personal Finance";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  category: NewsCategory;
  source: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  featured: boolean;
  trending: boolean;
  tickers: string[];
  accent: string;
}

export type LearnLevel = "Beginner" | "Intermediate" | "Advanced";
export type LearnFormat = "Article" | "Video" | "Guide";

export interface LearnItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: { heading: string; paragraphs: string[] }[];
  level: LearnLevel;
  format: LearnFormat;
  topic: string;
  minutes: number;
  accent: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: LearnLevel;
  itemSlugs: string[];
}

export interface CalculatorMeta {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
}

export interface EcosystemProduct {
  id: string;
  name: string;
  icon: string;
  description: string;
  href: string;
  stat: string;
  statLabel: string;
  accent: string;
}

export type SearchResultType = "stock" | "fund" | "ipo" | "article" | "learn" | "tool";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
  trend?: number;
}

/* ---------------------------------------------------------------------------
 * Market Pulse — the derived view the signature visualisation consumes.
 * Everything here is computed from `Sector` + `MarketSentiment`, so a real
 * data source only has to satisfy those two contracts.
 * ------------------------------------------------------------------------ */

export interface SectorPulse extends Sector {
  /** Absolute move normalised against the strongest mover, 0–1. */
  momentum: number;
  direction: Trend;
  /** 1 = strongest performer in the session. */
  rank: number;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  advancePercent: number;
}

export interface MarketPulseData {
  score: number;
  label: string;
  breadth: MarketBreadth;
  sectors: SectorPulse[];
  leaders: SectorPulse[];
  laggards: SectorPulse[];
  updatedLabel: string;
}

/** Plain-language reading of the session, composed from live figures. */
export interface MarketNarrative {
  mood: string;
  headline: string[];
  sentence: string;
  leadSector: SectorPulse;
  lagSector: SectorPulse;
}

export interface FlowChain {
  id: string;
  tone: "strong" | "weak";
  label: string;
  detail: string;
  nodes: { name: string; changePercent: number }[];
}
