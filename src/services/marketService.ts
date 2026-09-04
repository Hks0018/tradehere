import { MARKET_HIGHLIGHTS, MARKET_INDICES, MARKET_SENTIMENT, MARKET_STATUS, SECTORS, SNAPSHOT_INDEX_IDS } from "@/data/markets";
import { STOCKS } from "@/data/stocks";
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

/* ---------------------------------------------------------------------------
 * Derived market views
 * ------------------------------------------------------------------------ */

function toPulseSectors(sectors: Sector[]): SectorPulse[] {
  const ranked = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  const strongest = Math.max(...ranked.map((s) => Math.abs(s.changePercent)), 0.01);

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
    leaders: pulse.filter((s) => s.direction === "up").slice(0, 3),
    laggards: pulse.filter((s) => s.direction === "down").slice(-3).reverse(),
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

  const mood = pulse.label;
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

  return { mood, headline, sentence, leadSector: lead, lagSector: lag };
}

/**
 * Where momentum is rotating. Phase 1 derives the chains from ranked sector
 * performance; Phase 2 can replace the body with a real rotation model.
 */
export async function getMarketFlow(): Promise<FlowChain[]> {
  const pulse = await getMarketPulse();
  const rising = pulse.sectors.filter((s) => s.direction === "up").slice(0, 3);
  const falling = pulse.sectors.filter((s) => s.direction === "down").slice(-3).reverse();

  return [
    {
      id: "into",
      tone: "strong",
      label: "Money is flowing in",
      detail: "Sectors absorbing the strongest buying interest this session, in order of momentum.",
      nodes: rising.map((s) => ({ name: s.name, changePercent: s.changePercent })),
    },
    {
      id: "out-of",
      tone: "weak",
      label: "Money is flowing out",
      detail: "Sectors seeing the heaviest distribution, ranked by the size of the decline.",
      nodes: falling.map((s) => ({ name: s.name, changePercent: s.changePercent })),
    },
  ];
}
