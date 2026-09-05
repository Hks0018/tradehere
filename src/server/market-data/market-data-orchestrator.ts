import { InMemoryCacheStore, cacheKey, type CacheStore } from "./cache";
import { marketDataConfig, type CacheKind } from "./config";
import { MarketDataError, toMarketDataError } from "./errors";
import { marketDataLogger } from "./logger";
import { ProviderHealthRegistry, type ProviderHealthSnapshot } from "./provider-health";
import type { MarketDataProvider } from "./provider.interface";
import { ProviderRegistry } from "./provider.registry";
import { SingleFlight } from "./single-flight";
import type {
  CandleInterval,
  Capability,
  CompanyProfile,
  DataEnvelope,
  HistoricalCandle,
  InstrumentSearchResult,
  MarketBreadth,
  MarketNewsItem,
  NormalizedIndex,
  NormalizedQuote,
  NormalizedSector,
  ProviderId,
  ProviderResult,
} from "./types";

interface ResolveOptions<T> {
  capability: Capability;
  /** Provider method used both to route and to invoke. */
  method: keyof MarketDataProvider;
  cacheKind: CacheKind;
  key: string;
  call: (provider: MarketDataProvider) => Promise<ProviderResult<T>>;
  /** Rejects payloads that are structurally wrong or empty. */
  validate: (value: T) => boolean;
  /**
   * Whether providers that cost quota may serve this request. Bulk callers
   * pass false so list rendering falls straight through to free sources.
   */
  allowMetered?: boolean;
}

/** Per-request options exposed to callers of the public methods. */
export interface RequestOptions {
  /** Set false for list/bulk work so metered providers are skipped. */
  allowMetered?: boolean;
}

export interface OrchestratorOptions {
  registry: ProviderRegistry;
  cache?: CacheStore;
  health?: ProviderHealthRegistry;
  now?: () => number;
}

/**
 * MARKET DATA ORCHESTRATOR
 *
 * One request path for all market data:
 *
 *   fresh cache -> healthy providers in priority order -> stale cache
 *   (LAST_KNOWN) -> controlled UNAVAILABLE
 *
 * Two rules matter most. Exactly one provider answers a given request — values
 * from different sources are never blended, because averaging two quotes
 * produces a price that never traded. And the response always states which
 * provider answered and how fresh the data is, so nothing can be mistaken for
 * live when it is not.
 */
export class MarketDataOrchestrator {
  private readonly registry: ProviderRegistry;
  private readonly cache: CacheStore;
  private readonly health: ProviderHealthRegistry;
  private readonly now: () => number;
  /** Collapses concurrent identical requests into one provider call. */
  private readonly inFlight = new SingleFlight();

  constructor(options: OrchestratorOptions) {
    this.now = options.now ?? Date.now;
    this.registry = options.registry;
    this.cache = options.cache ?? new InMemoryCacheStore(this.now);
    this.health = options.health ?? new ProviderHealthRegistry(this.now);
  }

  /* ---------------------------------------------------------------------- */
  /* Public API                                                             */
  /* ---------------------------------------------------------------------- */

  getQuote(
    symbol: string,
    options: RequestOptions = {},
  ): Promise<DataEnvelope<NormalizedQuote>> {
    const normalized = symbol.trim().toUpperCase();
    return this.resolve<NormalizedQuote>({
      capability: "quotes",
      method: "getQuote",
      cacheKind: "quote",
      key: cacheKey(["quote", normalized]),
      call: (provider) => provider.getQuote!(normalized),
      validate: (quote) => Boolean(quote?.symbol) && Number.isFinite(quote.currentPrice),
      allowMetered: options.allowMetered,
    });
  }

  getQuotes(symbols: string[]): Promise<DataEnvelope<NormalizedQuote[]>> {
    const normalized = [...new Set(symbols.map((s) => s.trim().toUpperCase()))].filter(Boolean);
    return this.resolve<NormalizedQuote[]>({
      capability: "quotes",
      method: "getQuotes",
      cacheKind: "quote",
      key: cacheKey(["quotes", normalized.join(",")]),
      call: (provider) => provider.getQuotes!(normalized),
      validate: (quotes) => Array.isArray(quotes) && quotes.length > 0,
    });
  }

  getHistoricalData(
    symbol: string,
    interval: CandleInterval,
    options: RequestOptions = {},
  ): Promise<DataEnvelope<HistoricalCandle[]>> {
    const normalized = symbol.trim().toUpperCase();
    return this.resolve<HistoricalCandle[]>({
      capability: "historical",
      method: "getHistoricalData",
      cacheKind: "historical",
      key: cacheKey(["history", normalized, interval]),
      call: (provider) => provider.getHistoricalData!(normalized, interval),
      validate: (candles) => Array.isArray(candles) && candles.length > 1,
      allowMetered: options.allowMetered,
    });
  }

  getIndices(): Promise<DataEnvelope<NormalizedIndex[]>> {
    return this.resolve<NormalizedIndex[]>({
      capability: "indices",
      method: "getIndices",
      cacheKind: "indices",
      key: cacheKey(["indices"]),
      call: (provider) => provider.getIndices!(),
      validate: (indices) => Array.isArray(indices) && indices.length > 0,
    });
  }

  searchInstruments(
    query: string,
    limit = 12,
    options: RequestOptions = {},
  ): Promise<DataEnvelope<InstrumentSearchResult[]>> {
    const term = query.trim();
    return this.resolve<InstrumentSearchResult[]>({
      capability: "search",
      method: "searchInstruments",
      cacheKind: "search",
      key: cacheKey(["search", term.toLowerCase(), limit]),
      call: (provider) => provider.searchInstruments!(term, limit),
      // An empty result set is a legitimate answer to a search.
      validate: (results) => Array.isArray(results),
      allowMetered: options.allowMetered,
    });
  }

  listInstruments(): Promise<DataEnvelope<InstrumentSearchResult[]>> {
    return this.resolve<InstrumentSearchResult[]>({
      capability: "search",
      method: "listInstruments",
      cacheKind: "instruments",
      key: cacheKey(["instruments"]),
      call: (provider) => provider.listInstruments!(),
      validate: (results) => Array.isArray(results) && results.length > 0,
    });
  }

  getSectorData(): Promise<DataEnvelope<NormalizedSector[]>> {
    return this.resolve<NormalizedSector[]>({
      capability: "sectors",
      method: "getSectorData",
      cacheKind: "sectors",
      key: cacheKey(["sectors"]),
      call: (provider) => provider.getSectorData!(),
      validate: (sectors) => Array.isArray(sectors) && sectors.length > 0,
    });
  }

  getMarketBreadth(): Promise<DataEnvelope<MarketBreadth>> {
    return this.resolve<MarketBreadth>({
      capability: "breadth",
      method: "getMarketBreadth",
      cacheKind: "breadth",
      key: cacheKey(["breadth"]),
      call: (provider) => provider.getMarketBreadth!(),
      validate: (breadth) => Boolean(breadth) && Number.isFinite(breadth.advancers),
    });
  }

  getCompanyProfile(
    symbol: string,
    options: RequestOptions = {},
  ): Promise<DataEnvelope<CompanyProfile>> {
    const normalized = symbol.trim().toUpperCase();
    return this.resolve<CompanyProfile>({
      capability: "fundamentals",
      method: "getCompanyProfile",
      cacheKind: "profile",
      key: cacheKey(["profile", normalized]),
      call: (provider) => provider.getCompanyProfile!(normalized),
      validate: (profile) => Boolean(profile?.symbol),
      allowMetered: options.allowMetered,
    });
  }

  getMarketNews(symbol: string, limit = 6): Promise<DataEnvelope<MarketNewsItem[]>> {
    const normalized = symbol.trim().toUpperCase();
    return this.resolve<MarketNewsItem[]>({
      capability: "news",
      method: "getMarketNews",
      cacheKind: "news",
      key: cacheKey(["news", normalized, limit]),
      call: (provider) => provider.getMarketNews!(normalized, limit),
      validate: (items) => Array.isArray(items) && items.length > 0,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Health                                                                 */
  /* ---------------------------------------------------------------------- */

  /** Registered provider by id, for diagnostics surfaces. */
  provider(id: ProviderId): MarketDataProvider | undefined {
    return this.registry.get(id);
  }

  providerHealth(): ProviderHealthSnapshot[] {
    return this.registry
      .all()
      .map((provider) => this.health.snapshot(provider.id, provider.isConfigured()));
  }

  /** Provider ids in configured priority order for a capability. */
  priorityFor(capability: Capability, method: keyof MarketDataProvider): ProviderId[] {
    return this.registry.forCapability(capability, method).map((provider) => provider.id);
  }

  /* ---------------------------------------------------------------------- */
  /* The resolution pipeline                                                */
  /* ---------------------------------------------------------------------- */

  private resolve<T>(options: ResolveOptions<T>): Promise<DataEnvelope<T>> {
    // Two callers asking for the same thing at the same instant share one
    // provider call — decisive on a metered free tier.
    const scope = options.allowMetered === false ? "bulk" : "std";
    return this.inFlight.run(`${scope}:${options.capability}:${options.key}`, () =>
      this.resolveUncoalesced(options),
    );
  }

  private async resolveUncoalesced<T>(options: ResolveOptions<T>): Promise<DataEnvelope<T>> {
    const { capability, method, cacheKind, call, validate } = options;
    const retrievedAt = new Date(this.now()).toISOString();
    const allowMetered = options.allowMetered ?? true;

    /**
     * Cache entries are scoped by whether metered providers were permitted.
     *
     * Without this, a list render — which deliberately avoids paid providers —
     * would cache a sample value under the same key an explicit request uses,
     * and the detail page would be served sample data even though real data
     * was available. The two populations are kept apart.
     */
    const key = allowMetered ? options.key : `bulk:${options.key}`;

    // 1. Fresh cache short-circuits everything.
    const cached = await this.cache.get<T>(key);
    if (cached) {
      marketDataLogger.cacheHit(capability, key, cached.source);
      return {
        data: cached.value,
        meta: {
          source: cached.source,
          status: "CACHED",
          timestamp: cached.timestamp,
          retrievedAt,
          fromCache: true,
          failoverUsed: false,
          attempted: [],
        },
      };
    }

    // 2. Walk providers in priority order, dropping metered ones when the
    //    caller has declared this is bulk work.
    const candidates = this.registry
      .forCapability(capability, method)
      .filter((provider) => {
        if (allowMetered || !provider.metered) return true;
        marketDataLogger.providerSkipped(capability, provider.id, "metered_bulk_request");
        return false;
      });
    const attempted: ProviderId[] = [];
    let lastError: MarketDataError | null = null;

    for (const provider of candidates) {
      if (!this.health.canAttempt(provider.id)) {
        marketDataLogger.providerSkipped(capability, provider.id, "circuit_open");
        continue;
      }

      attempted.push(provider.id);
      marketDataLogger.providerAttempt(capability, provider.id);

      try {
        const result = await call(provider);

        if (!validate(result.data)) {
          throw new MarketDataError("VALIDATION_FAILED", "Provider returned unusable data", {
            providerId: provider.id,
          });
        }

        this.health.recordSuccess(provider.id);

        // Failover means the first *eligible* provider was not the one that answered.
        const failoverUsed = attempted.length > 1 || provider.id !== candidates[0]?.id;
        marketDataLogger.providerSuccess(capability, provider.id, result.status, failoverUsed);

        const ttl = marketDataConfig.cacheTtlMs[cacheKind];
        const storedAt = this.now();
        await this.cache.set<T>(key, {
          value: result.data,
          status: result.status,
          source: provider.id,
          timestamp: result.timestamp,
          storedAt,
          expiresAt: storedAt + ttl,
          purgeAt: storedAt + Math.max(ttl, marketDataConfig.lastKnownTtlMs),
        });

        return {
          data: result.data,
          meta: {
            source: provider.id,
            status: result.status,
            timestamp: result.timestamp,
            retrievedAt,
            fromCache: false,
            failoverUsed,
            attempted,
          },
        };
      } catch (error) {
        const marketError = toMarketDataError(error, provider.id);
        lastError = marketError;

        // A bad symbol is the caller's problem, not the provider's. Trying
        // another provider would only repeat the same answer, so this stops
        // here without marking anyone unhealthy.
        if (!marketError.retryable) throw marketError;

        // Coverage and entitlement gaps are correct behaviour, not outages.
        // Counting them would open the circuit and cost us the capabilities
        // this provider does serve.
        if (marketError.affectsHealth) {
          this.health.recordFailure(provider.id, marketError.code);
          marketDataLogger.providerFailure(capability, provider.id, marketError.code);
        } else {
          marketDataLogger.providerSkipped(capability, provider.id, marketError.code);
        }
      }
    }

    // 3. Every provider failed. Serve the last good value rather than nothing.
    const stale = await this.cache.getStale<T>(key);
    if (stale) {
      marketDataLogger.lastKnown(capability, key, stale.source, this.now() - stale.storedAt);
      return {
        data: stale.value,
        meta: {
          source: stale.source,
          status: "LAST_KNOWN",
          // Deliberately the original data time, so age is visible to the UI.
          timestamp: stale.timestamp,
          retrievedAt,
          fromCache: true,
          failoverUsed: true,
          attempted,
        },
      };
    }

    // 4. Nothing to serve. Fail in a way the UI can render deliberately.
    marketDataLogger.unavailable(capability, key, attempted.length);
    throw new MarketDataError(
      "ALL_PROVIDERS_FAILED",
      candidates.length === 0
        ? `No configured provider supports ${capability}`
        : attempted.length === 0
          ? `Every provider for ${capability} is in cooldown`
          : `All providers failed for ${capability}`,
      { cause: lastError ?? undefined },
    );
  }
}
