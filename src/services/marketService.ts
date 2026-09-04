import { MARKET_HIGHLIGHTS, MARKET_INDICES, MARKET_SENTIMENT, MARKET_STATUS, SECTORS, SNAPSHOT_INDEX_IDS } from "@/data/markets";
import { STOCKS } from "@/data/stocks";
import type { MarketHighlight, MarketIndex, MarketSentiment, Sector, Stock } from "@/types";

export type MoverKind = "gainers" | "losers" | "active" | "trending";

export async function getIndices(region?: MarketIndex["region"]): Promise<MarketIndex[]> {
  return region ? MARKET_INDICES.filter((i) => i.region === region) : MARKET_INDICES;
}

export async function getSnapshotIndices(): Promise<MarketIndex[]> {
  return SNAPSHOT_INDEX_IDS.map((id) => MARKET_INDICES.find((i) => i.id === id)).filter(
    (i): i is MarketIndex => Boolean(i),
  );
}

export async function getIndexById(id: string): Promise<MarketIndex | undefined> {
  return MARKET_INDICES.find((i) => i.id === id);
}

export async function getMovers(kind: MoverKind, limit = 6): Promise<Stock[]> {
  const pool = [...STOCKS];
  switch (kind) {
    case "gainers":
      return pool.sort((a, b) => b.changePercent - a.changePercent).slice(0, limit);
    case "losers":
      return pool.sort((a, b) => a.changePercent - b.changePercent).slice(0, limit);
    case "active":
      return pool.sort((a, b) => b.volume - a.volume).slice(0, limit);
    case "trending":
    default:
      return pool
        .filter((s) => s.tags.includes("trending"))
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, limit);
  }
}

export async function getAllMovers(limit = 6): Promise<Record<MoverKind, Stock[]>> {
  const [trending, gainers, losers, active] = await Promise.all([
    getMovers("trending", limit),
    getMovers("gainers", limit),
    getMovers("losers", limit),
    getMovers("active", limit),
  ]);
  return { trending, gainers, losers, active };
}

export async function getSectors(): Promise<Sector[]> {
  return [...SECTORS].sort((a, b) => b.changePercent - a.changePercent);
}

export async function getSentiment(): Promise<MarketSentiment> {
  return MARKET_SENTIMENT;
}

export async function getHighlights(): Promise<MarketHighlight[]> {
  return MARKET_HIGHLIGHTS;
}

export async function getMarketStatus() {
  return MARKET_STATUS;
}
