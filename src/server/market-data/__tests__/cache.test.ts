import { describe, expect, it } from "vitest";
import { InMemoryCacheStore, cacheKey } from "../cache";
import { makeClock } from "./fakes";

/**
 * The cache carries two horizons, and the difference between them is what makes
 * a genuine last-known-value fallback possible: `expiresAt` ends freshness,
 * `purgeAt` ends existence.
 */
describe("InMemoryCacheStore", () => {
  function entry(clockNow: number, ttl: number, retention: number) {
    return {
      value: { price: 100 },
      status: "LIVE" as const,
      source: "primary",
      timestamp: "2026-09-04T10:00:00.000Z",
      storedAt: clockNow,
      expiresAt: clockNow + ttl,
      purgeAt: clockNow + retention,
    };
  }

  it("returns a fresh entry from get()", async () => {
    const clock = makeClock();
    const cache = new InMemoryCacheStore(clock.now);
    await cache.set("k", entry(clock.now(), 1000, 10_000));

    expect(await cache.get("k")).toBeDefined();
  });

  it("hides an expired entry from get() but keeps it for getStale()", async () => {
    const clock = makeClock();
    const cache = new InMemoryCacheStore(clock.now);
    await cache.set("k", entry(clock.now(), 1000, 10_000));

    clock.advance(1001);

    expect(await cache.get("k")).toBeUndefined();
    expect(await cache.getStale("k")).toBeDefined();
  });

  it("drops the entry entirely once past its retention horizon", async () => {
    const clock = makeClock();
    const cache = new InMemoryCacheStore(clock.now);
    await cache.set("k", entry(clock.now(), 1000, 10_000));

    clock.advance(10_001);

    expect(await cache.getStale("k")).toBeUndefined();
    expect(await cache.size()).toBe(0);
  });

  it("builds stable keys and skips empty segments", () => {
    expect(cacheKey(["quote", "RELIND"])).toBe("quote:RELIND");
    expect(cacheKey(["search", "", 12])).toBe("search:12");
    expect(cacheKey(["history", "RELIND", "1M"])).toBe("history:RELIND:1M");
  });
});
