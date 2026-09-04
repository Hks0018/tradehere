import type { PricePoint, Timeframe } from "@/types";

/**
 * Deterministic PRNG (mulberry32). Every generated series is a pure function of
 * its seed, so the server render and the client hydration produce identical
 * markup — critical for charts rendered during SSR.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Reference "now" for the whole mock dataset. Keeps dates stable. */
export const DATA_REFERENCE_DATE = "2026-09-04T15:30:00+05:30";

function isoDaysAgo(days: number): string {
  const base = new Date(DATA_REFERENCE_DATE);
  base.setDate(base.getDate() - days);
  return base.toISOString().slice(0, 10);
}

interface SeriesOptions {
  points?: number;
  volatility?: number;
  drift?: number;
  intraday?: boolean;
}

/**
 * Generates a realistic-looking random-walk price series that *ends* at
 * `endValue`, so charts always agree with the quoted last price.
 */
export function generateSeries(
  seedKey: string,
  endValue: number,
  { points = 60, volatility = 0.012, drift = 0.0006, intraday = false }: SeriesOptions = {},
): PricePoint[] {
  const rand = seededRandom(seedFromString(seedKey));
  const raw: number[] = [];
  let value = 1;
  for (let i = 0; i < points; i += 1) {
    const shock = (rand() - 0.5) * 2 * volatility;
    value = value * (1 + drift + shock);
    raw.push(value);
  }
  const last = raw[raw.length - 1] || 1;
  const scale = endValue / last;

  return raw.map((v, i) => ({
    t: intraday ? intradayLabel(i, points) : isoDaysAgo(points - 1 - i),
    v: Number((v * scale).toFixed(2)),
  }));
}

function intradayLabel(index: number, total: number): string {
  // NSE session: 09:15 -> 15:30 == 375 minutes.
  const minutes = Math.round((index / Math.max(total - 1, 1)) * 375);
  const h = Math.floor((555 + minutes) / 60);
  const m = (555 + minutes) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TIMEFRAME_CONFIG: Record<Timeframe, { points: number; volatility: number; drift: number; intraday: boolean }> = {
  "1D": { points: 78, volatility: 0.0035, drift: 0.0001, intraday: true },
  "1W": { points: 42, volatility: 0.006, drift: 0.0003, intraday: false },
  "1M": { points: 30, volatility: 0.011, drift: 0.0007, intraday: false },
  "1Y": { points: 120, volatility: 0.017, drift: 0.0012, intraday: false },
  "5Y": { points: 160, volatility: 0.025, drift: 0.0034, intraday: false },
};

export function seriesForTimeframe(
  seedKey: string,
  endValue: number,
  timeframe: Timeframe,
): PricePoint[] {
  const config = TIMEFRAME_CONFIG[timeframe];
  return generateSeries(`${seedKey}:${timeframe}`, endValue, config);
}
