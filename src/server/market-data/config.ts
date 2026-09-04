import type { Capability, ProviderId } from "./types";

/**
 * Engine configuration.
 *
 * Provider names appear here and nowhere else, so changing the pecking order is
 * a config edit rather than a code change. Everything is overridable by
 * environment variable; the defaults are what runs with no `.env` at all.
 */

function envList(name: string, fallback: ProviderId[]): ProviderId[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
}

/**
 * Default order of preference. `primary` and `secondary` sit ahead of `mock`
 * so that the moment either is configured with credentials it takes over,
 * without any code change.
 */
const DEFAULT_ORDER: ProviderId[] = ["primary", "secondary", "mock"];

export interface MarketDataConfig {
  /** Per-capability provider preference, highest priority first. */
  priority: Record<Capability, ProviderId[]>;
  /** How long a fresh value may be served from cache, per data kind. */
  cacheTtlMs: Record<CacheKind, number>;
  /**
   * How long an expired value is retained so it can still answer as
   * LAST_KNOWN when every provider is down.
   */
  lastKnownTtlMs: number;
  circuitBreaker: {
    failureThreshold: number;
    cooldownMs: number;
    /** Successes needed while HALF_OPEN before the circuit closes again. */
    successThreshold: number;
  };
  /** Verbose provider/cache/failover logging. On by default outside production. */
  debug: boolean;
}

export type CacheKind =
  | "quote"
  | "indices"
  | "historical"
  | "search"
  | "sectors"
  | "breadth"
  | "profile"
  | "instruments";

export const marketDataConfig: MarketDataConfig = {
  priority: {
    quotes: envList("MARKET_PRIORITY_QUOTES", DEFAULT_ORDER),
    historical: envList("MARKET_PRIORITY_HISTORICAL", DEFAULT_ORDER),
    indices: envList("MARKET_PRIORITY_INDICES", DEFAULT_ORDER),
    search: envList("MARKET_PRIORITY_SEARCH", DEFAULT_ORDER),
    sectors: envList("MARKET_PRIORITY_SECTORS", DEFAULT_ORDER),
    breadth: envList("MARKET_PRIORITY_BREADTH", DEFAULT_ORDER),
    fundamentals: envList("MARKET_PRIORITY_FUNDAMENTALS", DEFAULT_ORDER),
    news: envList("MARKET_PRIORITY_NEWS", DEFAULT_ORDER),
    websocket: envList("MARKET_PRIORITY_WEBSOCKET", DEFAULT_ORDER),
  },

  // Short for anything that moves tick to tick, long for reference data.
  cacheTtlMs: {
    quote: envInt("MARKET_TTL_QUOTE_MS", 10_000),
    indices: envInt("MARKET_TTL_INDICES_MS", 15_000),
    breadth: envInt("MARKET_TTL_BREADTH_MS", 30_000),
    sectors: envInt("MARKET_TTL_SECTORS_MS", 60_000),
    historical: envInt("MARKET_TTL_HISTORICAL_MS", 5 * 60_000),
    search: envInt("MARKET_TTL_SEARCH_MS", 10 * 60_000),
    profile: envInt("MARKET_TTL_PROFILE_MS", 30 * 60_000),
    instruments: envInt("MARKET_TTL_INSTRUMENTS_MS", 60 * 60_000),
  },

  lastKnownTtlMs: envInt("MARKET_LAST_KNOWN_TTL_MS", 24 * 60 * 60_000),

  circuitBreaker: {
    failureThreshold: envInt("MARKET_BREAKER_FAILURE_THRESHOLD", 3),
    cooldownMs: envInt("MARKET_BREAKER_COOLDOWN_MS", 30_000),
    successThreshold: envInt("MARKET_BREAKER_SUCCESS_THRESHOLD", 1),
  },

  debug: envBool("MARKET_DATA_DEBUG", process.env.NODE_ENV !== "production"),
};
