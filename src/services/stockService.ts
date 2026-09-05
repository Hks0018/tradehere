import "server-only";

import { marketData } from "@/server/market-data";
import type {
  CandleInterval,
  CompanyProfile,
  NormalizedQuote,
  ResponseMeta,
} from "@/server/market-data";
import type { MarketCapBucket, PricePoint, Stock, StockDetail, Timeframe } from "@/types";
import type { SortDirection, StockCategory, StockSortKey } from "./stockService.types";
import {
  candlesToPricePoints,
  deriveTagSets,
  toStock,
  toStockDetail,
  type StockTagSets,
} from "./marketDataMapper";

/**
 * Equity data for the interface.
 *
 * Every figure here now originates from the market-data orchestrator, so this
 * module has no idea which provider answered. Signatures are unchanged from
 * Phase 1 — the pages that consume them did not need editing.
 */

export type {
  StockCategory,
  StockSortKey,
  SortDirection,
} from "./stockService.types";

export interface StockQuery {
  search?: string;
  category?: StockCategory;
  sectors?: string[];
  sortKey?: StockSortKey;
  sortDirection?: SortDirection;
  limit?: number;
}

/** The sparkline shown in list views. */
const LIST_INTERVAL: CandleInterval = "1M";

interface UniverseEntry {
  quote: NormalizedQuote;
  profile: CompanyProfile;
}

/**
 * Loads quotes and profiles for the whole covered universe.
 *
 * Quotes come back in one batched call; profiles are per-symbol because
 * fundamentals are usually a different endpoint (and often a different vendor).
 * The orchestrator's cache absorbs the repetition.
 */
async function loadUniverse(): Promise<{ entries: UniverseEntry[]; tags: StockTagSets }> {
  const instruments = await marketData.listInstruments();
  const symbols = instruments.data.map((instrument) => instrument.symbol);

  const quotes = await marketData.getQuotes(symbols);
  const profiles = await Promise.all(
    quotes.data.map(async (quote) => {
      try {
        // Bulk: metered providers are skipped so a list render cannot spend
        // the day's API allowance.
        return await marketData.getCompanyProfile(quote.symbol, { allowMetered: false });
      } catch {
        // A missing profile must not remove a tradable instrument from the list.
        return null;
      }
    }),
  );

  const entries: UniverseEntry[] = [];
  quotes.data.forEach((quote, index) => {
    const profile = profiles[index];
    if (profile) entries.push({ quote, profile: profile.data });
  });

  const tags = deriveTagSets(
    entries.map(({ quote, profile }) => ({
      symbol: quote.symbol,
      marketCap: profile.marketCap,
      changePercent: quote.changePercent,
      volume: quote.volume,
    })),
  );

  return { entries, tags };
}

async function historyFor(
  symbol: string,
  interval: CandleInterval,
  options: { allowMetered?: boolean } = {},
): Promise<{ points: PricePoint[]; meta: ResponseMeta | null }> {
  try {
    const history = await marketData.getHistoricalData(symbol, interval, options);
    return { points: candlesToPricePoints(history.data, interval), meta: history.meta };
  } catch {
    // A chart is an enhancement; losing it must not blank the row.
    return { points: [], meta: null };
  }
}

async function seriesFor(symbol: string, interval: CandleInterval): Promise<PricePoint[]> {
  // Every caller of this helper is rendering a list; detail views ask for
  // history explicitly through `historyFor`.
  return (await historyFor(symbol, interval, { allowMetered: false })).points;
}

async function buildStocks(entries: UniverseEntry[], tags: StockTagSets): Promise<Stock[]> {
  return Promise.all(
    entries.map(async ({ quote, profile }) =>
      toStock(quote, profile, await seriesFor(quote.symbol, LIST_INTERVAL), tags),
    ),
  );
}

export async function getStocks(query: StockQuery = {}): Promise<Stock[]> {
  const {
    search = "",
    category = "all",
    sectors = [],
    sortKey = "marketCap",
    sortDirection = "desc",
    limit,
  } = query;

  const { entries, tags } = await loadUniverse();
  let results = await buildStocks(entries, tags);

  const term = search.trim().toLowerCase();
  if (term) {
    results = results.filter(
      (stock) =>
        stock.name.toLowerCase().includes(term) ||
        stock.symbol.toLowerCase().includes(term) ||
        stock.sector.toLowerCase().includes(term),
    );
  }

  if (category !== "all") {
    const bucket: Partial<Record<StockCategory, MarketCapBucket>> = {
      large: "Large Cap",
      mid: "Mid Cap",
      small: "Small Cap",
    };
    const capBucket = bucket[category];
    results = capBucket
      ? results.filter((stock) => stock.capBucket === capBucket)
      : results.filter((stock) => stock.tags.includes(category as "popular" | "trending"));
  }

  if (sectors.length) {
    results = results.filter((stock) => sectors.includes(stock.sector));
  }

  results.sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
  });

  return limit ? results.slice(0, limit) : results;
}

/**
 * A company with the provenance of each part of it.
 *
 * Quote and fundamentals can legitimately come from different providers — a
 * live price with sample fundamentals, say — so the page is told about each
 * separately and can describe them accurately instead of applying one blanket
 * label to the whole screen.
 */
export interface StockWithProvenance {
  stock: StockDetail;
  quoteMeta: ResponseMeta;
  profileMeta: ResponseMeta;
  historyMeta: ResponseMeta | null;
}

export async function getStockWithProvenance(
  symbol: string,
): Promise<StockWithProvenance | undefined> {
  try {
    const [quote, profile] = await Promise.all([
      marketData.getQuote(symbol),
      marketData.getCompanyProfile(symbol),
    ]);


    const { entries } = await loadUniverse();
    const tags = deriveTagSets(
      entries.map((entry) => ({
        symbol: entry.quote.symbol,
        marketCap: entry.profile.marketCap,
        changePercent: entry.quote.changePercent,
        volume: entry.quote.volume,
      })),
    );

    const history = await historyFor(quote.data.symbol, LIST_INTERVAL);

    return {
      stock: toStockDetail(quote.data, profile.data, history.points, tags),
      quoteMeta: quote.meta,
      profileMeta: profile.meta,
      historyMeta: history.meta,
    };
  } catch {
    // Unknown symbol, or no provider could answer — the page renders its 404.
    return undefined;
  }
}

export async function getStockBySymbol(symbol: string): Promise<StockDetail | undefined> {
  return (await getStockWithProvenance(symbol))?.stock;
}

export async function getStockSymbols(): Promise<string[]> {
  const instruments = await marketData.listInstruments();
  return instruments.data.map((instrument) => instrument.symbol);
}

export async function getSectorList(): Promise<string[]> {
  const instruments = await marketData.listInstruments();
  const sectors = new Set<string>();
  for (const instrument of instruments.data) {
    if (instrument.sector) sectors.add(instrument.sector);
  }
  return [...sectors].sort();
}

/**
 * History for one instrument, with provenance.
 *
 * Called from the stock detail chart, which is an explicit user request for one
 * symbol and therefore worth a metered call.
 */
export async function getPriceHistoryWithProvenance(
  symbol: string,
  timeframe: Timeframe,
): Promise<{ points: PricePoint[]; meta: ResponseMeta | null }> {
  return historyFor(symbol, timeframe);
}

export async function getPriceHistory(
  symbol: string,
  timeframe: Timeframe,
): Promise<PricePoint[]> {
  return (await historyFor(symbol, timeframe)).points;
}

export async function getRelatedStocks(symbol: string, limit = 4): Promise<Stock[]> {
  const target = await getStockBySymbol(symbol);
  if (!target) return [];
  const all = await getStocks();
  return all.filter((stock) => stock.sector === target.sector && stock.symbol !== target.symbol)
    .slice(0, limit);
}

export interface StockStory {
  verdict: string;
  paragraphs: string[];
  sectorChange: number;
  benchmarkChange: number;
}

/**
 * A plain-language reading of the day for one company, composed from the same
 * figures shown elsewhere on the page — the stock against its sector, and the
 * sector against the benchmark. The words are derived, so they cannot drift
 * away from the data.
 */
export async function getStockStory(symbol: string): Promise<StockStory | undefined> {
  const stock = await getStockBySymbol(symbol);
  if (!stock) return undefined;

  const { getIndexById, getSectors } = await import("./marketService");
  const [sectors, benchmark] = await Promise.all([getSectors(), getIndexById("nifty-50")]);

  const sector = sectors.find((entry) => entry.name === stock.sector);
  const sectorChange = sector?.changePercent ?? 0;
  const benchmarkChange = benchmark?.changePercent ?? 0;

  const vsBenchmark = stock.changePercent - benchmarkChange;
  const vsSector = stock.changePercent - sectorChange;

  const verdict =
    vsBenchmark > 0.75
      ? "Outperforming the benchmark"
      : vsBenchmark < -0.75
        ? "Lagging the benchmark"
        : "Broadly tracking the benchmark";

  const paragraphs = [
    `${stock.name} closed ${stock.changePercent >= 0 ? "higher" : "lower"} in the sample session, moving ${Math.abs(
      stock.changePercent,
    ).toFixed(2)}% against a benchmark that ${
      benchmarkChange >= 0 ? "gained" : "fell"
    } ${Math.abs(benchmarkChange).toFixed(2)}%. Its sector, ${stock.sector.toLowerCase()}, ${
      sectorChange >= 0 ? "advanced" : "declined"
    } ${Math.abs(sectorChange).toFixed(2)}% overall, so the move is ${
      Math.abs(vsSector) < 0.5 ? "in line with" : vsSector > 0 ? "stronger than" : "weaker than"
    } its peers.`,
    `The company trades at ${stock.pe.toFixed(1)} times earnings on a book value of ₹${stock.bookValue.toFixed(
      0,
    )} per share, with a return on equity of ${stock.roe.toFixed(1)}% and a debt-to-equity ratio of ${stock.debtToEquity.toFixed(
      2,
    )}. Revenue grew ${stock.revenueGrowth.toFixed(1)}% in the most recent year and profit ${stock.profitGrowth.toFixed(
      1,
    )}%.`,
  ];

  return { verdict, paragraphs, sectorChange, benchmarkChange };
}
