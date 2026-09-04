import "server-only";

import type {
  CandleInterval,
  CompanyProfile,
  HistoricalCandle,
  NormalizedIndex,
  NormalizedQuote,
  NormalizedSector,
} from "@/server/market-data";
import type {
  MarketCapBucket,
  MarketIndex,
  PricePoint,
  Sector,
  Stock,
  StockDetail,
} from "@/types";

/**
 * Translates the engine's normalized shapes into the domain types the Phase 1
 * interface already renders.
 *
 * Keeping this seam explicit is what let the whole data path be replaced
 * without touching a single component: the engine owns the vendor-neutral
 * contract, the interface keeps its own vocabulary, and this file is the only
 * place the two meet.
 */

/**
 * Candle timestamps carry an explicit +05:30 offset and are read by slicing
 * rather than `Date` parsing, so an axis label cannot shift with the server's
 * timezone. Intraday shows `HH:MM`; everything longer shows the date.
 */
export function candlesToPricePoints(
  candles: HistoricalCandle[],
  interval: CandleInterval,
): PricePoint[] {
  return candles.map((candle) => ({
    t: interval === "1D" ? candle.timestamp.slice(11, 16) : candle.timestamp.slice(0, 10),
    v: candle.close,
  }));
}

export function toMarketIndex(index: NormalizedIndex, series: PricePoint[]): MarketIndex {
  return {
    id: index.symbol.toLowerCase(),
    name: index.name,
    shortName: index.shortName ?? index.symbol,
    region: index.region === "Global" ? "Global" : "India",
    value: index.currentValue,
    change: index.change,
    changePercent: index.changePercent,
    dayHigh: index.high,
    dayLow: index.low,
    previousClose: index.previousClose,
    series,
  };
}

/** Matches the buckets the interface labels: ₹1,00,000 cr and ₹30,000 cr. */
export function toCapBucket(marketCap: number): MarketCapBucket {
  if (marketCap >= 1e12) return "Large Cap";
  if (marketCap >= 3e11) return "Mid Cap";
  return "Small Cap";
}

/**
 * Tags are Tradehere's own reading of the session, not something a vendor
 * supplies, so they are derived from the universe rather than stored. The
 * caller passes the sets it computed across all instruments.
 */
export interface StockTagSets {
  popular: Set<string>;
  trending: Set<string>;
  active: Set<string>;
}

export function toStock(
  quote: NormalizedQuote,
  profile: CompanyProfile,
  series: PricePoint[],
  tags: StockTagSets,
): Stock {
  const applied: Stock["tags"] = [];
  if (tags.popular.has(quote.symbol)) applied.push("popular");
  if (tags.trending.has(quote.symbol)) applied.push("trending");
  if (tags.active.has(quote.symbol)) applied.push("active");

  return {
    symbol: quote.symbol,
    name: profile.name || quote.name,
    exchange: quote.exchange === "BSE" ? "BSE" : "NSE",
    sector: profile.sector,
    industry: profile.industry,
    price: quote.currentPrice,
    change: quote.change,
    changePercent: quote.changePercent,
    marketCap: profile.marketCap,
    capBucket: toCapBucket(profile.marketCap),
    volume: quote.volume,
    pe: profile.peRatio,
    eps: profile.eps,
    high52: profile.high52,
    low52: profile.low52,
    dividendYield: profile.dividendYield,
    bookValue: profile.bookValue,
    tags: applied,
    series,
  };
}

export function toStockDetail(
  quote: NormalizedQuote,
  profile: CompanyProfile,
  series: PricePoint[],
  tags: StockTagSets,
): StockDetail {
  return {
    ...toStock(quote, profile, series, tags),
    description: profile.description,
    founded: profile.founded,
    headquarters: profile.headquarters,
    employees: profile.employees,
    website: profile.website,
    financials: profile.financials,
    shareholding: profile.shareholding,
    revenueGrowth: profile.revenueGrowth,
    profitGrowth: profile.profitGrowth,
    roe: profile.roe,
    debtToEquity: profile.debtToEquity,
  };
}

export function toSector(sector: NormalizedSector): Sector {
  return {
    id: sector.sectorId,
    name: sector.sector,
    changePercent: sector.changePercent,
    marketCapShare: sector.marketCapShare ?? 0,
    advancers: sector.advancingCount,
    decliners: sector.decliningCount,
  };
}

/**
 * Ranks the universe once so every list view agrees on what counts as popular,
 * trending or most active.
 */
export function deriveTagSets(
  entries: { symbol: string; marketCap: number; changePercent: number; volume: number }[],
): StockTagSets {
  const top = (
    compare: (a: (typeof entries)[number], b: (typeof entries)[number]) => number,
    count: number,
  ) => new Set([...entries].sort(compare).slice(0, count).map((entry) => entry.symbol));

  return {
    popular: top((a, b) => b.marketCap - a.marketCap, 10),
    trending: top(
      (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
      8,
    ),
    active: top((a, b) => b.volume - a.volume, 8),
  };
}
