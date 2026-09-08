import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketDataError, isMarketDataError } from "../../../errors";
import { IndianApiClient } from "../client";
import {
  normalizeHistorical,
  normalizeNews,
  normalizeProfile,
  normalizeQuote,
  normalizeSearch,
} from "../normalize";
import { toProviderName, toTradehereSymbol } from "../symbol-map";

/**
 * These run entirely on recorded response shapes — no API key and no
 * network. The shapes are trimmed down from real responses captured against
 * the live API during integration.
 */

const STOCK_BODY = {
  companyName: "Reliance Industries",
  industry: "Oil & Gas Operations",
  companyProfile: {
    companyDescription: "Reliance Industries Limited is engaged in hydrocarbon exploration...",
    exchangeCodeBse: "500325",
    exchangeCodeNse: "RELIANCE",
  },
  currentPrice: { BSE: "1309.50", NSE: "1309.50" },
  percentChange: -0.95,
  yearHigh: 1611.2,
  yearLow: 1250.55,
  stockDetailsReusableData: {
    close: "1322.00",
    date: "07 Sep 2026",
    time: "10:27:51",
    price: "1309.50",
    percentChange: "-0.95",
    marketCap: "1772085.95",
    yhigh: "1611.20",
    ylow: "1250.55",
    high: "1324.00",
    low: "1302.50",
    pPerEBasicExcludingExtraordinaryItemsTTM: "24.5",
    currentDividendYieldCommonStockPrimaryIssueLTM: "0.35",
    totalDebtPerTotalEquityMostRecentQuarter: "0.42",
  },
  keyMetrics: {
    mgmtEffectiveness: [
      { key: "returnOnAverageEquity5YearAverage", value: "8.78" },
      { key: "returnOnInvestmentTrailing12Month", value: null },
    ],
  },
  shareholding: [
    {
      displayName: "Promoter",
      categories: [
        { holdingDate: "2025-09-30", percentage: "50.01" },
        { holdingDate: "2026-06-30", percentage: "50.48" },
      ],
    },
  ],
  recentNews: [
    {
      id: 11788765036049,
      headline: "Bhupendra Patel meets Mukesh, Anant Ambani ahead of summit",
      date: "2026-09-07T07:20:59+0000",
      url: "/news/india/some-article.html",
      summary: "Gujarat CM met RIL Chairman Mukesh Ambani in Mumbai.",
    },
  ],
};

const HISTORICAL_BODY = {
  datasets: [
    {
      metric: "Price",
      label: "Price on NSE",
      values: [
        ["2026-09-07", "2270.00"],
        ["2026-09-08", "2264.20"],
      ],
    },
    {
      metric: "Volume",
      label: "Volume",
      values: [
        ["2026-09-07", 1800000, { delivery: null }],
        ["2026-09-08", 2029850, { delivery: null }],
      ],
    },
  ],
};

describe("symbol mapping", () => {
  it("maps Tradehere symbols to IndianAPI search names and back", () => {
    expect(toProviderName("RELIND")).toBe("Reliance");
    expect(toProviderName("relind")).toBe("Reliance");
    expect(toTradehereSymbol("RELIANCE")).toBe("RELIND");
  });

  it("passes through symbols it does not map, so a discovered ticker still works", () => {
    expect(toProviderName("SOMENEWCO")).toBe("SOMENEWCO");
    expect(toTradehereSymbol("SOMENEWCO")).toBe("SOMENEWCO");
  });
});

describe("quote normalization", () => {
  it("parses the stock payload into a normalized quote", () => {
    const quote = normalizeQuote(STOCK_BODY, "RELIND");

    expect(quote.symbol).toBe("RELIND");
    expect(quote.currentPrice).toBe(1309.5);
    // "close" in stockDetailsReusableData is the previous day's close.
    expect(quote.previousClose).toBe(1322);
    expect(quote.high).toBe(1324);
    expect(quote.low).toBe(1302.5);
    expect(quote.changePercent).toBeCloseTo(-0.95, 4);
    expect(quote.exchange).toBe("NSE");
  });

  it("labels the quote DELAYED, never LIVE", () => {
    // No real-time SLA is asserted anywhere in this vendor's terms.
    const quote = normalizeQuote(STOCK_BODY, "RELIND");
    expect(quote.dataStatus).toBe("DELAYED");
    expect(quote.source).toBe("indianapi");
  });

  it("stamps the exchange-local time with a stable offset", () => {
    const quote = normalizeQuote(STOCK_BODY, "RELIND");
    expect(quote.timestamp).toBe("2026-09-07T10:27:51+05:30");
  });

  it("treats an unrecognised company as coverage absence, not an outage", () => {
    const error = (() => {
      try {
        normalizeQuote({ error: "Stock not found" }, "XX");
      } catch (e) {
        return e;
      }
    })();

    expect(isMarketDataError(error)).toBe(true);
    expect((error as MarketDataError).code).toBe("NO_DATA");
    expect((error as MarketDataError).retryable).toBe(true);
    expect((error as MarketDataError).affectsHealth).toBe(false);
  });
});

describe("historical candle normalization", () => {
  it("collapses the close-only series into flat OHLC, oldest first", () => {
    const candles = normalizeHistorical(HISTORICAL_BODY);

    expect(candles).toHaveLength(2);
    expect(candles[0].timestamp).toBe("2026-09-07T00:00:00+05:30");
    expect(candles[1].close).toBe(2264.2);
    // No true intraday range in this feed — open/high/low all equal close.
    expect(candles[1].open).toBe(candles[1].close);
    expect(candles[1].high).toBe(candles[1].close);
    expect(candles[1].low).toBe(candles[1].close);
    expect(candles[1].volume).toBe(2029850);
  });

  it("rejects a response with no Price dataset as NO_DATA", () => {
    expect(() => normalizeHistorical({ datasets: [] })).toThrow(MarketDataError);
  });
});

describe("search normalization", () => {
  it("maps results and prefers Tradehere's own symbol when covered", () => {
    const results = normalizeSearch([
      {
        id: "S0003051",
        commonName: "Tata Consultancy Services",
        mgSector: "Technology",
        exchangeCodeNsi: "TCS",
        exchangeCodeBse: "532540",
      },
      {
        id: "S0006597",
        commonName: "Some Unmapped Co",
        exchangeCodeNsi: "UNMAPPEDCO",
        exchangeCodeBse: "999999",
      },
    ]);

    expect(results[0].symbol).toBe("TCSIT");
    expect(results[0].exchange).toBe("NSE");
    expect(results[0].sector).toBe("Technology");
    expect(results[1].symbol).toBe("UNMAPPEDCO");
  });

  it("returns an empty list rather than throwing on an unexpected shape", () => {
    expect(normalizeSearch({})).toEqual([]);
  });
});

describe("fundamentals normalization", () => {
  it("parses market cap, ratios and the latest shareholding snapshot", () => {
    const profile = normalizeProfile(STOCK_BODY, "RELIND");

    expect(profile.marketCap).toBe(1772085.95);
    expect(profile.peRatio).toBe(24.5);
    expect(profile.dividendYield).toBe(0.35);
    expect(profile.high52).toBe(1611.2);
    expect(profile.roe).toBe(8.78);
    expect(profile.debtToEquity).toBe(0.42);
    // Latest holding date only, not the whole history.
    expect(profile.shareholding).toEqual([{ label: "Promoter", value: 50.48 }]);
    // Not part of this endpoint's payload — left empty rather than invented.
    expect(profile.financials).toEqual([]);
  });

  it("treats an unrecognised company as NO_DATA", () => {
    expect(() => normalizeProfile({ error: "Stock not found" }, "XX")).toThrow(MarketDataError);
  });
});

describe("news normalization", () => {
  it("resolves relative article URLs and attributes the requested symbol", () => {
    const items = normalizeNews(STOCK_BODY, "RELIND", 5);

    expect(items[0].title).toContain("Bhupendra Patel");
    expect(items[0].url).toBe("https://www.livemint.com/news/india/some-article.html");
    expect(items[0].source).toBe("LiveMint");
    expect(items[0].tickers).toEqual(["RELIND"]);
  });

  it("treats an empty news list as NO_DATA", () => {
    expect(() => normalizeNews({ recentNews: [] }, "RELIND", 5)).toThrow(MarketDataError);
  });
});

/* -------------------------------------------------------------------------- */
/* Client: refusals arrive as HTTP 200                                        */
/* -------------------------------------------------------------------------- */

describe("IndianApiClient", () => {
  const originalFetch = globalThis.fetch;

  function client(apiKey: string | undefined) {
    return new IndianApiClient({ apiKey, baseUrl: "https://example.invalid", timeoutMs: 1000 });
  }

  function respond(body: unknown, status = 200) {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;
  }

  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("reports itself unconfigured with no key, and never calls out", async () => {
    const c = client(undefined);
    expect(c.isConfigured()).toBe(false);
    await expect(c.request("/stock", { name: "Reliance" })).rejects.toMatchObject({
      code: "PROVIDER_NOT_CONFIGURED",
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("sends the key as an x-api-key header, never a query param", async () => {
    respond(STOCK_BODY);
    await client("secret-key").request("/stock", { name: "Reliance" });

    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).not.toContain("secret-key");
    expect((init as RequestInit).headers).toMatchObject({ "x-api-key": "secret-key" });
  });

  it("classifies a 200-with-error-body refusal as NO_DATA, not an outage", async () => {
    // Verified by real request: an unrecognised company answers this way.
    respond({ error: "Stock not found" });

    const error = await client("k")
      .request("/stock", { name: "Nonexistent" })
      .catch((e: unknown) => e as MarketDataError);

    expect((error as MarketDataError).code).toBe("NO_DATA");
    expect((error as MarketDataError).retryable).toBe(true);
    expect((error as MarketDataError).affectsHealth).toBe(false);
  });

  it("classifies HTTP 429 as RATE_LIMITED", async () => {
    respond({}, 429);
    const error = await client("k")
      .request("/stock", { name: "Reliance" })
      .catch((e: unknown) => e as MarketDataError);
    expect((error as MarketDataError).code).toBe("RATE_LIMITED");
  });

  it("treats a rejected key (401) as a fault, not a coverage gap", async () => {
    respond("Invalid API key", 401);
    const error = await client("bad-key")
      .request("/stock", { name: "Reliance" })
      .catch((e: unknown) => e as MarketDataError);

    expect((error as MarketDataError).code).toBe("PROVIDER_UNAVAILABLE");
    // A broken credential should count against health and open the circuit.
    expect((error as MarketDataError).affectsHealth).toBe(true);
  });

  it("never puts the API key in a thrown error", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("connect ECONNREFUSED");
    }) as unknown as typeof fetch;

    const error = await client("SUPERSECRETKEY123")
      .request("/stock", { name: "Reliance" })
      .catch((e: unknown) => e as MarketDataError);

    const serialized = `${(error as Error).message} ${(error as Error).stack ?? ""}`;
    expect(serialized).not.toContain("SUPERSECRETKEY123");
    expect((error as MarketDataError).code).toBe("NETWORK_ERROR");
  });
});

/* -------------------------------------------------------------------------- */
/* Provider: configuration and capability boundaries                         */
/* -------------------------------------------------------------------------- */

describe("IndianApiMarketDataProvider", () => {
  const originalKey = process.env.INDIANAPI_API_KEY;

  afterEach(() => {
    process.env.INDIANAPI_API_KEY = originalKey;
    vi.resetModules();
  });

  it("is unconfigured when no key is present", async () => {
    delete process.env.INDIANAPI_API_KEY;
    vi.resetModules();
    const { IndianApiMarketDataProvider } = await import("../index");
    expect(new IndianApiMarketDataProvider().isConfigured()).toBe(false);
  });

  it("does not claim indices, sectors or breadth — no such endpoint exists", async () => {
    process.env.INDIANAPI_API_KEY = "test-key";
    vi.resetModules();
    const { IndianApiMarketDataProvider } = await import("../index");
    const provider = new IndianApiMarketDataProvider();

    expect(provider.capabilities.indices).toBe(false);
    expect(provider.capabilities.sectors).toBe(false);
    expect(provider.capabilities.breadth).toBe(false);
    expect(provider.metered).toBe(true);
  });
});
