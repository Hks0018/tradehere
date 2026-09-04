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
