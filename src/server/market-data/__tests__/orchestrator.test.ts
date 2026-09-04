import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryCacheStore } from "../cache";
import { MarketDataError } from "../errors";
import { MarketDataOrchestrator } from "../market-data-orchestrator";
import { ProviderHealthRegistry } from "../provider-health";
import { ProviderRegistry } from "../provider.registry";
import { FakeProvider, makeClock } from "./fakes";

/**
 * The failover chain is the part of this system that only matters when things
 * are already going wrong, so it is tested against real behaviour rather than
 * mocks of itself: providers actually throw, the cache actually expires, and
 * the clock actually advances.
 */

// Priority config is read from the environment at module load, so the fake
// provider ids have to be in place before `config` is first imported.
vi.mock("../config", async () => {
  const order = ["primary", "secondary", "mock"];
  return {
    marketDataConfig: {
      priority: {
        quotes: order,
        historical: order,
        indices: order,
        search: order,
        sectors: order,
        breadth: order,
        fundamentals: order,
        news: order,
        websocket: order,
      },
      cacheTtlMs: {
        quote: 10_000,
        indices: 10_000,
        historical: 10_000,
        search: 10_000,
        sectors: 10_000,
        breadth: 10_000,
        profile: 10_000,
        instruments: 10_000,
      },
      lastKnownTtlMs: 3_600_000,
      circuitBreaker: { failureThreshold: 3, cooldownMs: 30_000, successThreshold: 1 },
      debug: false,
    },
  };
});

interface Harness {
  orchestrator: MarketDataOrchestrator;
  primary: FakeProvider;
  secondary: FakeProvider;
  mock: FakeProvider;
  clock: ReturnType<typeof makeClock>;
  cache: InMemoryCacheStore;
}

function harness(): Harness {
  const clock = makeClock();
  const primary = new FakeProvider("primary", 100);
  const secondary = new FakeProvider("secondary", 200);
  const mock = new FakeProvider("mock", 300);

  const registry = new ProviderRegistry()
    .register(primary)
    .register(secondary)
    .register(mock);

  const cache = new InMemoryCacheStore(clock.now);

  return {
    orchestrator: new MarketDataOrchestrator({
      registry,
      cache,
      health: new ProviderHealthRegistry(clock.now),
      now: clock.now,
    }),
    primary,
    secondary,
    mock,
    clock,
    cache,
  };
}

describe("provider selection", () => {
  let h: Harness;
  beforeEach(() => {
    h = harness();
  });

  it("serves from the highest-priority provider when it is healthy", async () => {
    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.data.currentPrice).toBe(100);
    expect(result.meta.source).toBe("primary");
    expect(result.meta.failoverUsed).toBe(false);
    expect(result.meta.status).toBe("LIVE");
    // Lower-priority providers must not be called at all.
    expect(h.secondary.calls).toBe(0);
    expect(h.mock.calls).toBe(0);
  });

  it("fails over to the secondary provider when the primary throws", async () => {
    h.primary.mode = "fail";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("secondary");
    expect(result.data.currentPrice).toBe(200);
    expect(result.meta.failoverUsed).toBe(true);
    expect(result.meta.attempted).toEqual(["primary", "secondary"]);
    expect(h.mock.calls).toBe(0);
  });

  it("continues down the chain to the last provider", async () => {
    h.primary.mode = "fail";
    h.secondary.mode = "rate-limited";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("mock");
    expect(result.meta.attempted).toEqual(["primary", "secondary", "mock"]);
  });

  it("never blends values from two providers", async () => {
    h.primary.mode = "fail";

    const result = await h.orchestrator.getQuote("RELIND");

    // 200 exactly — not an average of the 200 and 300 that were available.
    expect(result.data.currentPrice).toBe(200);
    expect(result.data.source).toBe("secondary");
  });

  it("rejects a structurally invalid payload and fails over", async () => {
    h.primary.mode = "garbage";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("secondary");
  });

  it("does not fail over for an unknown symbol", async () => {
    h.primary.mode = "invalid-symbol";

    await expect(h.orchestrator.getQuote("NOPE")).rejects.toMatchObject({
      code: "INVALID_SYMBOL",
    });
    // Asking a second provider would only repeat the same answer.
    expect(h.secondary.calls).toBe(0);
  });

  it("does not penalise a provider's health for an unknown symbol", async () => {
    const h = harness();
    h.primary.mode = "invalid-symbol";

    // A caller hammering bad symbols must not be able to take a healthy
    // provider out of service.
    for (let i = 0; i < 5; i += 1) {
      await h.orchestrator.getQuote(`BAD${i}`).catch(() => undefined);
    }

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "primary");
    expect(health?.status).toBe("HEALTHY");
    expect(health?.consecutiveFailures).toBe(0);
    expect(health?.circuit.state).toBe("CLOSED");

    // And the provider still serves good requests normally.
    h.primary.mode = "ok";
    const result = await h.orchestrator.getQuote("RELIND");
    expect(result.meta.source).toBe("primary");
  });

  it("skips providers that are not configured, without penalising them", async () => {
    h.primary.configured = false;

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("secondary");
    expect(h.primary.calls).toBe(0);
    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "primary");
    expect(health?.status).toBe("UNAVAILABLE");
    expect(health?.consecutiveFailures).toBe(0);
  });
});

describe("caching", () => {
  it("serves a repeat request from cache without touching a provider", async () => {
    const h = harness();

    await h.orchestrator.getQuote("RELIND");
    const second = await h.orchestrator.getQuote("RELIND");

    expect(h.primary.calls).toBe(1);
    expect(second.meta.fromCache).toBe(true);
    expect(second.meta.status).toBe("CACHED");
  });

  it("goes back to the provider once the TTL expires", async () => {
    const h = harness();

    await h.orchestrator.getQuote("RELIND");
    h.clock.advance(11_000);
    const second = await h.orchestrator.getQuote("RELIND");

    expect(h.primary.calls).toBe(2);
    expect(second.meta.fromCache).toBe(false);
  });
});

describe("last known value fallback", () => {
  it("returns stale cached data as LAST_KNOWN when every provider fails", async () => {
    const h = harness();

    // Prime the cache with a good value.
    await h.orchestrator.getQuote("RELIND");

    // Expire it, then take every provider down.
    h.clock.advance(11_000);
    h.primary.mode = "fail";
    h.secondary.mode = "fail";
    h.mock.mode = "fail";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.status).toBe("LAST_KNOWN");
    expect(result.data.currentPrice).toBe(100);
    expect(result.meta.source).toBe("primary");
    // The timestamp stays the original one, so the UI can show the real age.
    expect(result.meta.timestamp).toBe("2026-09-04T10:00:00.000Z");
    expect(result.meta.fromCache).toBe(true);
  });

  it("throws a controlled ALL_PROVIDERS_FAILED when there is nothing cached", async () => {
    const h = harness();
    h.primary.mode = "fail";
    h.secondary.mode = "fail";
    h.mock.mode = "fail";

    const error = await h.orchestrator.getQuote("RELIND").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(MarketDataError);
    expect((error as MarketDataError).code).toBe("ALL_PROVIDERS_FAILED");
    // Nothing internal leaks into what a user would be shown.
    expect((error as MarketDataError).publicMessage).not.toMatch(/upstream|primary|secondary/i);
  });

  it("discards last-known data once it is older than the retention window", async () => {
    const h = harness();
    await h.orchestrator.getQuote("RELIND");

    h.clock.advance(3_600_001);
    h.primary.mode = "fail";
    h.secondary.mode = "fail";
    h.mock.mode = "fail";

    await expect(h.orchestrator.getQuote("RELIND")).rejects.toMatchObject({
      code: "ALL_PROVIDERS_FAILED",
    });
  });
});

describe("circuit breaker", () => {
  it("opens after the failure threshold and then skips the provider entirely", async () => {
    const h = harness();
    h.primary.mode = "fail";

    for (let i = 0; i < 3; i += 1) {
      await h.orchestrator.getQuote(`SYM${i}`);
    }
    expect(h.primary.calls).toBe(3);

    // Fourth request: the circuit is open, so the primary is not called again.
    await h.orchestrator.getQuote("SYM_AFTER");
    expect(h.primary.calls).toBe(3);

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "primary");
    expect(health?.circuit.state).toBe("OPEN");
    expect(health?.status).toBe("UNAVAILABLE");
  });

  it("half-opens after the cooldown and closes again on success", async () => {
    const h = harness();
    h.primary.mode = "fail";

    for (let i = 0; i < 3; i += 1) await h.orchestrator.getQuote(`SYM${i}`);
    expect(h.primary.calls).toBe(3);

    // Provider recovers, but the circuit is still cooling down.
    h.primary.mode = "ok";
    await h.orchestrator.getQuote("STILL_OPEN");
    expect(h.primary.calls).toBe(3);

    h.clock.advance(30_001);
    const recovered = await h.orchestrator.getQuote("AFTER_COOLDOWN");

    expect(h.primary.calls).toBe(4);
    expect(recovered.meta.source).toBe("primary");

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "primary");
    expect(health?.circuit.state).toBe("CLOSED");
    expect(health?.status).toBe("HEALTHY");
  });

  it("re-opens if the trial request during HALF_OPEN also fails", async () => {
    const h = harness();
    h.primary.mode = "fail";

    for (let i = 0; i < 3; i += 1) await h.orchestrator.getQuote(`SYM${i}`);
    h.clock.advance(30_001);

    // Still broken: the half-open trial fails and the circuit trips again.
    await h.orchestrator.getQuote("TRIAL");
    expect(h.primary.calls).toBe(4);

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "primary");
    expect(health?.circuit.state).toBe("OPEN");

    // And it is skipped once more.
    await h.orchestrator.getQuote("AFTER_RETRIP");
    expect(h.primary.calls).toBe(4);
  });
});

describe("health reporting", () => {
  it("records successes, failures and the last error code", async () => {
    const h = harness();
    h.primary.mode = "fail";
    await h.orchestrator.getQuote("A");

    const [primary, secondary] = h.orchestrator.providerHealth();

    expect(primary.providerId).toBe("primary");
    expect(primary.status).toBe("DEGRADED");
    expect(primary.consecutiveFailures).toBe(1);
    expect(primary.lastErrorCode).toBe("PROVIDER_UNAVAILABLE");
    expect(primary.lastFailureAt).not.toBeNull();

    expect(secondary.status).toBe("HEALTHY");
    expect(secondary.lastSuccessAt).not.toBeNull();
  });
});
