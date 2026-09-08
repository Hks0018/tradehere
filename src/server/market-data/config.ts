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
const DEFAULT_ORDER: ProviderId[] = ["alphavantage", "indianapi", "primary", "secondary", "mock"];

/**
 * Capabilities Alpha Vantage cannot serve on a free key, verified by real
 * requests: it publishes no NIFTY/SENSEX index symbols, and has no sector or
 * market-breadth endpoints. Listing it for these would spend quota on calls
 * that can only fail, so those capabilities never route to it.
 */
const WITHOUT_ALPHA_VANTAGE: ProviderId[] = ["primary", "secondary", "mock"];

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
  alphaVantage: {
    apiKey: string | undefined;
    baseUrl: string;
    timeoutMs: number;
    dailyLimit: number;
    reserve: number;
  };
  indianApi: {
    apiKey: string | undefined;
    baseUrl: string;
    timeoutMs: number;
  };
}

export type CacheKind =
  | "quote"
  | "indices"
  | "historical"
  | "search"
  | "sectors"
  | "breadth"
  | "profile"
  | "instruments"
  | "news";

export const marketDataConfig: MarketDataConfig = {
  priority: {
    quotes: envList("MARKET_PRIORITY_QUOTES", DEFAULT_ORDER),
    historical: envList("MARKET_PRIORITY_HISTORICAL", DEFAULT_ORDER),
    indices: envList("MARKET_PRIORITY_INDICES", WITHOUT_ALPHA_VANTAGE),
    search: envList("MARKET_PRIORITY_SEARCH", DEFAULT_ORDER),
    sectors: envList("MARKET_PRIORITY_SECTORS", WITHOUT_ALPHA_VANTAGE),
    breadth: envList("MARKET_PRIORITY_BREADTH", WITHOUT_ALPHA_VANTAGE),
    fundamentals: envList("MARKET_PRIORITY_FUNDAMENTALS", DEFAULT_ORDER),
    news: envList("MARKET_PRIORITY_NEWS", DEFAULT_ORDER),
    websocket: envList("MARKET_PRIORITY_WEBSOCKET", DEFAULT_ORDER),
  },

  /**
   * Cache lifetimes, tuned for a metered end-of-day provider rather than a
   * streaming feed.
   *
   * A ten-second quote TTL is right for a real-time source and ruinous for a
   * 25-calls-a-day key: it would empty the allowance in a few minutes of
   * browsing. Alpha Vantage's free quotes are an end-of-day close that does
   * not change intraday, so caching them for a quarter of an hour costs no
   * accuracy. Raise these back down when a real-time provider is configured.
   */
  cacheTtlMs: {
    quote: envInt("MARKET_TTL_QUOTE_MS", 15 * 60_000),
    indices: envInt("MARKET_TTL_INDICES_MS", 15 * 60_000),
    breadth: envInt("MARKET_TTL_BREADTH_MS", 15 * 60_000),
    sectors: envInt("MARKET_TTL_SECTORS_MS", 30 * 60_000),
    historical: envInt("MARKET_TTL_HISTORICAL_MS", 6 * 60 * 60_000),
    search: envInt("MARKET_TTL_SEARCH_MS", 24 * 60 * 60_000),
    profile: envInt("MARKET_TTL_PROFILE_MS", 24 * 60 * 60_000),
    instruments: envInt("MARKET_TTL_INSTRUMENTS_MS", 24 * 60 * 60_000),
    news: envInt("MARKET_TTL_NEWS_MS", 6 * 60 * 60_000),
  },

  lastKnownTtlMs: envInt("MARKET_LAST_KNOWN_TTL_MS", 24 * 60 * 60_000),

  circuitBreaker: {
    failureThreshold: envInt("MARKET_BREAKER_FAILURE_THRESHOLD", 3),
    cooldownMs: envInt("MARKET_BREAKER_COOLDOWN_MS", 30_000),
    successThreshold: envInt("MARKET_BREAKER_SUCCESS_THRESHOLD", 1),
  },

  debug: envBool("MARKET_DATA_DEBUG", process.env.NODE_ENV !== "production"),

  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    baseUrl: process.env.ALPHA_VANTAGE_BASE_URL ?? "https://www.alphavantage.co/query",
    timeoutMs: envInt("ALPHA_VANTAGE_TIMEOUT_MS", 8000),
    /**
     * Local ceiling on calls per UTC day. Free keys are commonly 25/day; the
     * engine stops at this number rather than discovering the limit by being
     * refused.
     */
    dailyLimit: envInt("ALPHA_VANTAGE_DAILY_LIMIT", 25),
    /**
     * Calls held back from bulk work so an interactive page view still gets
     * real data late in the day.
     */
    reserve: envInt("ALPHA_VANTAGE_RESERVE", 4),
  },

  /**
   * IndianAPI (indianapi.in) — a third-party API marketplace reselling
   * NSE/BSE data, not an exchange-authorized vendor. See
   * providers/indianapi/index.ts for the capability notes and the caveat on
   * its licensing terms.
   */
  indianApi: {
    apiKey: process.env.INDIANAPI_API_KEY,
    baseUrl: process.env.INDIANAPI_BASE_URL ?? "https://stock.indianapi.in",
    timeoutMs: envInt("INDIANAPI_TIMEOUT_MS", 8000),
  },
};
