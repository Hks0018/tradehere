import { describe, expect, it } from "vitest";
import { MockMarketDataProvider } from "../providers/mock.provider";
import { MarketDataError } from "../errors";

/**
 * Normalization coverage for the provider that currently serves the platform.
 *
 * The point is that the sample dataset arrives in the same shape a live vendor
 * would produce — including the honesty fields — so nothing above the provider
 * boundary can tell them apart, and nothing can mistake sample data for live.
 */
describe("MockMarketDataProvider normalization", () => {
  const provider = new MockMarketDataProvider();

  it("is always configured and reports itself healthy", async () => {
    expect(provider.isConfigured()).toBe(true);
    await expect(provider.healthCheck()).resolves.toBeUndefined();
  });

  it("produces a complete, internally consistent quote", async () => {
    const { data, status } = await provider.getQuote("RELIND");

    for (const field of [
      "symbol",
      "exchange",
      "instrumentId",
      "name",
      "currentPrice",
      "previousClose",
      "open",
      "high",
      "low",
      "change",
      "changePercent",
      "volume",
      "timestamp",
      "source",
      "dataStatus",
    ] as const) {
      expect(data[field], `missing ${field}`).toBeDefined();
    }

    // The session legs must bracket the traded price.
    expect(data.high).toBeGreaterThanOrEqual(data.currentPrice);
    expect(data.low).toBeLessThanOrEqual(data.currentPrice);
    // change is the difference from the previous close.
    expect(data.currentPrice - data.previousClose).toBeCloseTo(data.change, 2);

    // Sample data must never claim to be live.
    expect(status).toBe("MOCK");
    expect(data.dataStatus).toBe("MOCK");
    expect(data.source).toBe("mock");
  });

  it("is deterministic, so server and client renders agree", async () => {
    const first = await provider.getQuote("TCSIT");
    const second = await provider.getQuote("TCSIT");
    expect(first.data).toEqual(second.data);
  });

  it("rejects an unknown symbol with INVALID_SYMBOL", async () => {
    const error = await provider.getQuote("NOT_A_SYMBOL").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MarketDataError);
    expect((error as MarketDataError).code).toBe("INVALID_SYMBOL");
    // Not retryable: another provider would give the same answer.
    expect((error as MarketDataError).retryable).toBe(false);
  });

  it("skips unknown symbols in a batch rather than failing the whole call", async () => {
    const { data } = await provider.getQuotes(["RELIND", "NOT_A_SYMBOL", "TCSIT"]);
    expect(data.map((quote) => quote.symbol)).toEqual(["RELIND", "TCSIT"]);
  });

  it("returns OHLC candles whose highs and lows bound the body", async () => {
    const { data } = await provider.getHistoricalData("RELIND", "1M");

    expect(data.length).toBeGreaterThan(1);
    for (const candle of data) {
      expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
      expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
      expect(candle.volume).toBeGreaterThan(0);
    }
  });

  it("stamps intraday candles with a timezone-stable timestamp", async () => {
    const { data } = await provider.getHistoricalData("RELIND", "1D");
    // Explicit +05:30 offset, so slicing the label cannot drift with the host TZ.
    expect(data[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
  });

  it("normalizes indices with a derived change and change percent", async () => {
    const { data } = await provider.getIndices();
    expect(data.length).toBeGreaterThan(0);

    for (const index of data) {
      expect(index.currentValue - index.previousClose).toBeCloseTo(index.change, 1);
      expect(index.source).toBe("mock");
    }
  });

  it("returns sectors with breadth counts and a stable id", async () => {
    const { data } = await provider.getSectorData();
    for (const sector of data) {
      expect(sector.sectorId).toBeTruthy();
      expect(sector.advancingCount).toBeGreaterThanOrEqual(0);
      expect(sector.decliningCount).toBeGreaterThanOrEqual(0);
      expect(sector.changePercent).toBe(sector.performance);
    }
  });

  it("only claims capabilities it actually implements", async () => {
    const capabilityToMethod = {
      quotes: "getQuote",
      historical: "getHistoricalData",
      indices: "getIndices",
      search: "searchInstruments",
      sectors: "getSectorData",
      breadth: "getMarketBreadth",
      fundamentals: "getCompanyProfile",
    } as const;

    for (const [capability, method] of Object.entries(capabilityToMethod)) {
      if (provider.capabilities[capability as keyof typeof provider.capabilities]) {
        expect(typeof (provider as unknown as Record<string, unknown>)[method]).toBe("function");
      }
    }
  });

  it("returns an empty list for an empty search rather than everything", async () => {
    const { data } = await provider.searchInstruments("   ", 10);
    expect(data).toEqual([]);
  });
});
