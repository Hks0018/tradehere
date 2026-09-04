import "server-only";

import { MARKET_HIGHLIGHTS } from "@/data/markets";
import { marketData } from "@/server/market-data";
import type {
  FlowChain,
  MarketHighlight,
  MarketIndex,
  MarketNarrative,
  MarketPulseData,
  MarketSentiment,
  Sector,
  SectorPulse,
  Stock,
} from "@/types";
import { candlesToPricePoints, toMarketIndex, toSector } from "./marketDataMapper";
import { getStocks } from "./stockService";

/**
 * Market view and intelligence layer.
 *
 * Two jobs: map normalized engine output onto the interface's domain types, and
 * derive the readings the product is actually about — pulse, narrative and
 * rotation. Nothing here knows which provider supplied a number.
 */

export type MoverKind = "gainers" | "losers" | "active" | "trending";

/** Indices are drawn with an intraday line, so each one is paired with 1D candles. */
async function indexSeries(symbol: string) {
  try {
    const history = await marketData.getHistoricalData(symbol, "1D");
    return candlesToPricePoints(history.data, "1D");
  } catch {
    return [];
  }
}

export async function getIndices(region?: MarketIndex["region"]): Promise<MarketIndex[]> {
  const indices = await marketData.getIndices();

  const mapped = await Promise.all(
    indices.data.map(async (index) => toMarketIndex(index, await indexSeries(index.symbol))),
  );

  return region ? mapped.filter((index) => index.region === region) : mapped;
}

/** The four indices highlighted on the homepage snapshot. */
const SNAPSHOT_INDEX_IDS = ["nifty-50", "sensex", "nifty-bank", "sp-500"];

export async function getSnapshotIndices(): Promise<MarketIndex[]> {
  const indices = await getIndices();
  return SNAPSHOT_INDEX_IDS.map((id) => indices.find((index) => index.id === id)).filter(
    (index): index is MarketIndex => Boolean(index),
  );
}

export async function getIndexById(id: string): Promise<MarketIndex | undefined> {
  const indices = await getIndices();
  return indices.find((index) => index.id === id.toLowerCase());
}

export async function getMovers(kind: MoverKind, limit = 6): Promise<Stock[]> {
  const pool = await getStocks();
  switch (kind) {
    case "gainers":
      return [...pool].sort((a, b) => b.changePercent - a.changePercent).slice(0, limit);
    case "losers":
      return [...pool].sort((a, b) => a.changePercent - b.changePercent).slice(0, limit);
    case "active":
      return [...pool].sort((a, b) => b.volume - a.volume).slice(0, limit);
    case "trending":
    default:
      return [...pool]
        .filter((stock) => stock.tags.includes("trending"))
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, limit);
  }
}

export async function getAllMovers(limit = 6): Promise<Record<MoverKind, Stock[]>> {
  // One universe load, reused for all four rankings.
  const pool = await getStocks();
  const by = (compare: (a: Stock, b: Stock) => number) => [...pool].sort(compare).slice(0, limit);

  return {
    trending: pool
      .filter((stock) => stock.tags.includes("trending"))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, limit),
    gainers: by((a, b) => b.changePercent - a.changePercent),
    losers: by((a, b) => a.changePercent - b.changePercent),
    active: by((a, b) => b.volume - a.volume),
  };
}

export async function getSectors(): Promise<Sector[]> {
  const sectors = await marketData.getSectorData();
  return sectors.data.map(toSector).sort((a, b) => b.changePercent - a.changePercent);
}

export async function getSentiment(): Promise<MarketSentiment> {
  const breadth = await marketData.getMarketBreadth();
  return {
    score: breadth.data.sentimentScore,
    label: breadth.data.sentimentLabel,
    advancers: breadth.data.advancers,
    decliners: breadth.data.decliners,
    unchanged: breadth.data.unchanged,
    updatedLabel: breadth.data.sessionLabel,
  };
}

export async function getMarketStatus() {
  const breadth = await marketData.getMarketBreadth();
  return {
    isOpen: breadth.data.isOpen,
    label: breadth.data.sessionLabel,
    nextEvent: "Demo data refreshes on page load",
  };
}

/** Editorial commentary, not vendor data — it stays in the content layer. */
export async function getHighlights(): Promise<MarketHighlight[]> {
  return MARKET_HIGHLIGHTS;
}

/* -------------------------------------------------------------------------- */
/* Intelligence layer                                                         */
/* -------------------------------------------------------------------------- */

function toPulseSectors(sectors: Sector[]): SectorPulse[] {
  const ranked = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  const strongest = Math.max(...ranked.map((sector) => Math.abs(sector.changePercent)), 0.01);

  return ranked.map((sector, index) => ({
    ...sector,
    momentum: Math.abs(sector.changePercent) / strongest,
    direction: sector.changePercent > 0 ? "up" : sector.changePercent < 0 ? "down" : "flat",
    rank: index + 1,
  }));
}

/** Everything the Market Pulse visualisation needs, in one shape. */
export async function getMarketPulse(): Promise<MarketPulseData> {
  const [sectors, sentiment] = await Promise.all([getSectors(), getSentiment()]);
  const pulse = toPulseSectors(sectors);
  const total = sentiment.advancers + sentiment.decliners + sentiment.unchanged;

  return {
    score: sentiment.score,
    label: sentiment.label,
    breadth: {
      advancers: sentiment.advancers,
      decliners: sentiment.decliners,
      unchanged: sentiment.unchanged,
      advancePercent: Number(((sentiment.advancers / total) * 100).toFixed(1)),
    },
    sectors: pulse,
    leaders: pulse.filter((sector) => sector.direction === "up").slice(0, 3),
    laggards: pulse.filter((sector) => sector.direction === "down").slice(-3).reverse(),
    updatedLabel: sentiment.updatedLabel,
  };
}

/**
 * A plain-language reading of the session, composed from the same figures the
 * charts use — so the words can never drift away from the data.
 */
export async function getMarketNarrative(): Promise<MarketNarrative> {
  const pulse = await getMarketPulse();
  const lead = pulse.sectors[0];
  const lag = pulse.sectors[pulse.sectors.length - 1];
  const second = pulse.sectors[1];

  const headline =
    pulse.score >= 60
      ? ["The market is", "cautiously optimistic."]
      : pulse.score >= 40
        ? ["The market is", "holding its ground."]
        : ["The market is", "under pressure."];

  const sentence =
    `${lead.name} and ${second.name.toLowerCase()} are leading the session, ` +
    `while ${lag.name.toLowerCase()} remains under pressure. ` +
    `${pulse.breadth.advancers.toLocaleString("en-IN")} counters advanced against ` +
    `${pulse.breadth.decliners.toLocaleString("en-IN")} that declined.`;

  return { mood: pulse.label, headline, sentence, leadSector: lead, lagSector: lag };
}

/**
 * Where momentum is rotating, derived from ranked sector performance. Phase 2B
 * can replace the body with a real rotation model without touching the UI.
 */
export async function getMarketFlow(): Promise<FlowChain[]> {
  const pulse = await getMarketPulse();
  const rising = pulse.sectors.filter((sector) => sector.direction === "up").slice(0, 3);
  const falling = pulse.sectors.filter((sector) => sector.direction === "down").slice(-3).reverse();

  return [
    {
      id: "into",
      tone: "strong",
      label: "Money is flowing in",
      detail: "Sectors absorbing the strongest buying interest this session, in order of momentum.",
      nodes: rising.map((sector) => ({ name: sector.name, changePercent: sector.changePercent })),
    },
    {
      id: "out-of",
      tone: "weak",
      label: "Money is flowing out",
      detail: "Sectors seeing the heaviest distribution, ranked by the size of the decline.",
      nodes: falling.map((sector) => ({ name: sector.name, changePercent: sector.changePercent })),
    },
  ];
}
