import { STOCKS, STOCK_SECTORS } from "@/data/stocks";
import type { MarketCapBucket, PricePoint, Stock, StockDetail, Timeframe } from "@/types";
import { seriesForTimeframe } from "@/utils/series";

export type StockCategory = "popular" | "trending" | "large" | "mid" | "small" | "all";
export type StockSortKey = "name" | "price" | "changePercent" | "marketCap" | "volume";
export type SortDirection = "asc" | "desc";

export interface StockQuery {
  search?: string;
  category?: StockCategory;
  sectors?: string[];
  sortKey?: StockSortKey;
  sortDirection?: SortDirection;
  limit?: number;
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

  let results: Stock[] = [...STOCKS];

  const term = search.trim().toLowerCase();
  if (term) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.symbol.toLowerCase().includes(term) ||
        s.sector.toLowerCase().includes(term),
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
      ? results.filter((s) => s.capBucket === capBucket)
      : results.filter((s) => s.tags.includes(category as "popular" | "trending"));
  }

  if (sectors.length) {
    results = results.filter((s) => sectors.includes(s.sector));
  }

  results.sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
  });

  return limit ? results.slice(0, limit) : results;
}

export async function getStockBySymbol(symbol: string): Promise<StockDetail | undefined> {
  return STOCKS.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase());
}

export async function getStockSymbols(): Promise<string[]> {
  return STOCKS.map((s) => s.symbol);
}

export async function getSectorList(): Promise<string[]> {
  return STOCK_SECTORS;
}

export async function getPriceHistory(
  symbol: string,
  timeframe: Timeframe,
): Promise<PricePoint[]> {
  const stock = await getStockBySymbol(symbol);
  if (!stock) return [];
  return seriesForTimeframe(`history:${stock.symbol}`, stock.price, timeframe);
}

export async function getRelatedStocks(symbol: string, limit = 4): Promise<Stock[]> {
  const stock = await getStockBySymbol(symbol);
  if (!stock) return [];
  return STOCKS.filter((s) => s.sector === stock.sector && s.symbol !== stock.symbol).slice(0, limit);
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
 * sector against the benchmark. Phase 2 can replace the body with a richer
 * model without changing the shape the UI consumes.
 */
export async function getStockStory(symbol: string): Promise<StockStory | undefined> {
  const stock = await getStockBySymbol(symbol);
  if (!stock) return undefined;

  const { getIndexById, getSectors } = await import("./marketService");
  const [sectors, benchmark] = await Promise.all([getSectors(), getIndexById("nifty-50")]);

  const sector = sectors.find((s) => s.name === stock.sector);
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

  const direction = stock.changePercent >= 0 ? "higher" : "lower";
  const sectorDirection = sectorChange >= 0 ? "advanced" : "declined";

  const paragraphs = [
    `${stock.name} closed ${direction} in the sample session, moving ${Math.abs(
      stock.changePercent,
    ).toFixed(2)}% against a benchmark that ${
      benchmarkChange >= 0 ? "gained" : "fell"
    } ${Math.abs(benchmarkChange).toFixed(2)}%. Its sector, ${stock.sector.toLowerCase()}, ${sectorDirection} ${Math.abs(
      sectorChange,
    ).toFixed(2)}% overall, so the move is ${
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
