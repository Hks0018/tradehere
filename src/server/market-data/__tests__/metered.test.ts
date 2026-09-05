import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryCacheStore } from "../cache";
import { MarketDataError } from "../errors";
import { MarketDataOrchestrator } from "../market-data-orchestrator";
import { ProviderHealthRegistry } from "../provider-health";
import { ProviderRegistry } from "../provider.registry";
import { SingleFlight } from "../single-flight";
import { ALL_CAPABILITIES, FakeProvider, makeClock, makeQuote } from "./fakes";
import type { MarketDataProvider } from "../provider.interface";
import type { NormalizedQuote, ProviderResult } from "../types";

vi.mock("../config", async () => {
  const order = ["metered", "mock"];
  return {
    marketDataConfig: {
      priority: {
        quotes: order, historical: order, indices: order, search: order,
        sectors: order, breadth: order, fundamentals: order, news: order, websocket: order,
      },
      cacheTtlMs: {
        quote: 10_000, indices: 10_000, historical: 10_000, search: 10_000,
        sectors: 10_000, breadth: 10_000, profile: 10_000, instruments: 10_000, news: 10_000,
      },
      lastKnownTtlMs: 3_600_000,
      circuitBreaker: { failureThreshold: 3, cooldownMs: 30_000, successThreshold: 1 },
      debug: false,
      alphaVantage: { apiKey: undefined, baseUrl: "", timeoutMs: 1000, dailyLimit: 25, reserve: 4 },
    },
  };
});

/** A metered provider whose calls are counted, standing in for Alpha Vantage. */
class MeteredProvider implements MarketDataProvider {
  readonly id = "metered";
  readonly label = "Metered";
  readonly metered = true;
  readonly capabilities = ALL_CAPABILITIES;
  calls = 0;
  mode: "ok" | "premium" | "rate-limited" = "ok";

  isConfigured() {
    return true;
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    this.calls += 1;
    if (this.mode === "premium") {
      throw new MarketDataError("PREMIUM_REQUIRED", "premium endpoint", {
        providerId: this.id,
        retryable: true,
        affectsHealth: false,
      });
    }
    if (this.mode === "rate-limited") {
      throw new MarketDataError("RATE_LIMITED", "quota spent", { providerId: this.id });
    }
    return {
      data: makeQuote(symbol, 1322, this.id),
      status: "DELAYED",
      timestamp: "2026-09-04T00:00:00+05:30",
    };
  }
}

function harness() {
  const clock = makeClock();
  const metered = new MeteredProvider();
  const mock = new FakeProvider("mock", 300);
  // Stand in for the sample provider, which reports MOCK rather than LIVE.
  mock.status = "MOCK";
  const registry = new ProviderRegistry().register(metered).register(mock);

  return {
    metered,
    mock,
    clock,
    orchestrator: new MarketDataOrchestrator({
      registry,
      cache: new InMemoryCacheStore(clock.now),
      health: new ProviderHealthRegistry(clock.now),
      now: clock.now,
    }),
  };
}

describe("free-tier protection", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(() => {
    h = harness();
  });

  it("uses the metered provider for an explicit single request", async () => {
    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("metered");
    expect(result.meta.status).toBe("DELAYED");
    expect(h.metered.calls).toBe(1);
  });

  it("skips metered providers entirely for bulk requests", async () => {
    const result = await h.orchestrator.getQuote("RELIND", { allowMetered: false });

    // A list render must never spend quota.
    expect(h.metered.calls).toBe(0);
    expect(result.meta.source).toBe("mock");
    expect(result.meta.status).toBe("MOCK");
  });

  it("does not let a bulk-cached sample value block a real one", async () => {
    // A list render populates the cache from the free provider...
    const bulk = await h.orchestrator.getQuote("RELIND", { allowMetered: false });
    expect(bulk.meta.source).toBe("mock");

    // ...and an explicit request must still reach the metered provider.
    const explicit = await h.orchestrator.getQuote("RELIND");
    expect(explicit.meta.source).toBe("metered");
    expect(explicit.data.currentPrice).toBe(1322);

    // Each population caches independently.
    expect((await h.orchestrator.getQuote("RELIND")).meta.source).toBe("metered");
    expect(
      (await h.orchestrator.getQuote("RELIND", { allowMetered: false })).meta.source,
    ).toBe("mock");
    expect(h.metered.calls).toBe(1);
  });

  it("collapses concurrent identical requests into one provider call", async () => {
    const [a, b, c] = await Promise.all([
      h.orchestrator.getQuote("RELIND"),
      h.orchestrator.getQuote("RELIND"),
      h.orchestrator.getQuote("RELIND"),
    ]);

    // Three callers, one paid call.
    expect(h.metered.calls).toBe(1);
    expect(a.data.currentPrice).toBe(b.data.currentPrice);
    expect(b.data.currentPrice).toBe(c.data.currentPrice);
  });

  it("serves repeat requests from cache without spending quota", async () => {
    await h.orchestrator.getQuote("RELIND");
    const second = await h.orchestrator.getQuote("RELIND");

    expect(h.metered.calls).toBe(1);
    expect(second.meta.fromCache).toBe(true);
    expect(second.meta.status).toBe("CACHED");
    // The provider that produced the value is still attributed.
    expect(second.meta.source).toBe("metered");
  });

  it("falls back to sample data when the quota is spent, labelled MOCK", async () => {
    h.metered.mode = "rate-limited";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.source).toBe("mock");
    // Crucially: the fallback is never dressed up as real provider data.
    expect(result.meta.status).toBe("MOCK");
  });

  it("reports a rate-limited provider distinctly from a broken one", async () => {
    h.metered.mode = "rate-limited";
    await h.orchestrator.getQuote("A");

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "metered");
    expect(health?.status).toBe("RATE_LIMITED");
    expect(health?.lastErrorCode).toBe("RATE_LIMITED");
  });

  it("opens the circuit after repeated rate limiting instead of retrying", async () => {
    h.metered.mode = "rate-limited";

    for (let i = 0; i < 3; i += 1) await h.orchestrator.getQuote(`SYM${i}`);
    expect(h.metered.calls).toBe(3);

    // Fourth request must not produce another doomed call.
    await h.orchestrator.getQuote("SYM_AFTER");
    expect(h.metered.calls).toBe(3);
  });

  it("does not penalise the provider for a premium-only endpoint", async () => {
    h.metered.mode = "premium";

    for (let i = 0; i < 5; i += 1) await h.orchestrator.getQuote(`SYM${i}`);

    const health = h.orchestrator.providerHealth().find((p) => p.providerId === "metered");
    // The plan not covering an endpoint is not an outage; the circuit must stay
    // closed so the capabilities the key *does* cover keep working.
    expect(health?.status).toBe("HEALTHY");
    expect(health?.circuit.state).toBe("CLOSED");

    h.metered.mode = "ok";
    const result = await h.orchestrator.getQuote("RELIND");
    expect(result.meta.source).toBe("metered");
  });

  it("returns the last known real value when the provider later fails", async () => {
    await h.orchestrator.getQuote("RELIND");
    h.clock.advance(11_000);
    h.metered.mode = "rate-limited";
    h.mock.mode = "fail";

    const result = await h.orchestrator.getQuote("RELIND");

    expect(result.meta.status).toBe("LAST_KNOWN");
    expect(result.meta.source).toBe("metered");
    expect(result.data.currentPrice).toBe(1322);
  });
});

describe("SingleFlight", () => {
  it("shares one execution and releases the key afterwards", async () => {
    const flight = new SingleFlight();
    let runs = 0;

    const task = () =>
      new Promise<number>((resolve) => {
        runs += 1;
        setTimeout(() => resolve(runs), 5);
      });

    await Promise.all([flight.run("k", task), flight.run("k", task), flight.run("k", task)]);
    expect(runs).toBe(1);

    // The key must not stay wedged once the work completes.
    await flight.run("k", task);
    expect(runs).toBe(2);
    expect(flight.size).toBe(0);
  });

  it("releases the key when the shared task fails", async () => {
    const flight = new SingleFlight();
    await expect(flight.run("k", async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(flight.size).toBe(0);
    await expect(flight.run("k", async () => "ok")).resolves.toBe("ok");
  });
});
