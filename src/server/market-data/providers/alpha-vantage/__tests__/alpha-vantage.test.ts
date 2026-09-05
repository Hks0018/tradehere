import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyCallBudget } from "../../../budget";
import { MarketDataError, isMarketDataError } from "../../../errors";
import { AlphaVantageClient, redactKey } from "../client";
import {
  normalizeDailyCandles,
  normalizeNews,
  normalizeProfile,
  normalizeQuote,
  normalizeSearch,
} from "../normalize";
import { supportsFundamentals, toProviderSymbol, toTradehereSymbol } from "../symbol-map";

/**
 * These run entirely on recorded response shapes — no API key and no network.
 * The shapes are taken from real responses captured during integration,
 * including the ones Alpha Vantage returns with HTTP 200 while actually
 * refusing to serve.
 */

const QUOTE_BODY = {
  "Global Quote": {
    "01. symbol": "RELIANCE.BSE",
    "02. open": "1302.5500",
    "03. high": "1332.9000",
    "04. low": "1302.5500",
    "05. price": "1322.0000",
    "06. volume": "459976",
    "07. latest trading day": "2026-09-04",
    "08. previous close": "1301.0500",
    "09. change": "20.9500",
    "10. change percent": "1.6102%",
  },
};

const DAILY_BODY = {
  "Meta Data": { "2. Symbol": "RELIANCE.BSE" },
  "Time Series (Daily)": {
    // Deliberately newest-first, as the API returns it.
    "2026-09-04": { "1. open": "1302.55", "2. high": "1332.90", "3. low": "1302.55", "4. close": "1322.00", "5. volume": "459976" },
    "2026-09-03": { "1. open": "1290.00", "2. high": "1305.00", "3. low": "1288.10", "4. close": "1301.05", "5. volume": "512340" },
    "2026-09-02": { "1. open": "1284.20", "2. high": "1296.40", "3. low": "1280.00", "4. close": "1290.15", "5. volume": "448210" },
  },
};

describe("symbol mapping", () => {
  it("maps Tradehere symbols to provider tickers and back", () => {
    expect(toProviderSymbol("RELIND")).toBe("RELIANCE.BSE");
    expect(toProviderSymbol("relind")).toBe("RELIANCE.BSE");
    expect(toTradehereSymbol("RELIANCE.BSE")).toBe("RELIND");
  });

  it("passes through symbols it does not map, so discovered tickers work", () => {
    expect(toProviderSymbol("IBM")).toBe("IBM");
    expect(toTradehereSymbol("IBM")).toBe("IBM");
  });

  it("knows fundamentals are unavailable for BSE listings", () => {
    // Verified against the live API: OVERVIEW returns {} for .BSE symbols.
    expect(supportsFundamentals("RELIANCE.BSE")).toBe(false);
    expect(supportsFundamentals("IBM")).toBe(true);
  });
});

describe("quote normalization", () => {
  it("parses the ordinal string fields into a normalized quote", () => {
    const quote = normalizeQuote(QUOTE_BODY, "RELIND", "Reliance Industries", "BSE");

    expect(quote.symbol).toBe("RELIND");
    expect(quote.currentPrice).toBe(1322);
    expect(quote.previousClose).toBe(1301.05);
    expect(quote.open).toBe(1302.55);
    expect(quote.high).toBe(1332.9);
    expect(quote.low).toBe(1302.55);
    expect(quote.change).toBe(20.95);
    expect(quote.volume).toBe(459976);
    // "1.6102%" must lose the sign character, not the value.
    expect(quote.changePercent).toBeCloseTo(1.6102, 4);
  });

  it("labels the quote DELAYED, never LIVE", () => {
    // A free key returns an end-of-day close. Calling it live would be a lie.
    const quote = normalizeQuote(QUOTE_BODY, "RELIND", "Reliance", "BSE");
    expect(quote.dataStatus).toBe("DELAYED");
    expect(quote.source).toBe("alphavantage");
  });

  it("stamps the trading day with a stable offset", () => {
    const quote = normalizeQuote(QUOTE_BODY, "RELIND", "Reliance", "BSE");
    expect(quote.timestamp).toBe("2026-09-04T00:00:00+05:30");
  });

  it("treats an empty Global Quote as coverage absence, not an outage", () => {
    const error = (() => {
      try {
        normalizeQuote({ "Global Quote": {} }, "XX", "XX", "BSE");
      } catch (e) {
        return e;
      }
    })();

    expect(isMarketDataError(error)).toBe(true);
    expect((error as MarketDataError).code).toBe("NO_DATA");
    // Must fail over to the next provider...
    expect((error as MarketDataError).retryable).toBe(true);
    // ...without marking Alpha Vantage unhealthy.
    expect((error as MarketDataError).affectsHealth).toBe(false);
  });
});

describe("historical candle normalization", () => {
  it("returns candles oldest-first with parsed OHLCV", () => {
    const candles = normalizeDailyCandles(DAILY_BODY);

    expect(candles).toHaveLength(3);
    expect(candles[0].timestamp).toBe("2026-09-02T00:00:00+05:30");
    expect(candles[2].timestamp).toBe("2026-09-04T00:00:00+05:30");
    expect(candles[2].close).toBe(1322);
    expect(candles[2].high).toBe(1332.9);
    expect(candles[2].volume).toBe(459976);
  });

  it("rejects an empty series as NO_DATA", () => {
    expect(() => normalizeDailyCandles({})).toThrow(MarketDataError);
  });
});

describe("search normalization", () => {
  it("maps results and prefers Tradehere's own symbol when covered", () => {
    const results = normalizeSearch({
      bestMatches: [
        { "1. symbol": "RELIANCE.BSE", "2. name": "Reliance Industries Limited", "3. type": "Equity", "4. region": "India/Bombay" },
        { "1. symbol": "NIFTYBEES.BSE", "2. name": "Nippon India ETF Nifty 50 BeES", "3. type": "ETF", "4. region": "India/Bombay" },
      ],
    });

    // Links must point at a page that exists.
    expect(results[0].symbol).toBe("RELIND");
    expect(results[0].instrumentType).toBe("EQUITY");
    expect(results[1].instrumentType).toBe("ETF");
    expect(results[1].symbol).toBe("NIFTYBEES.BSE");
  });

  it("returns an empty list rather than throwing when there are no matches", () => {
    expect(normalizeSearch({})).toEqual([]);
  });
});

describe("fundamentals normalization", () => {
  it("parses an overview and title-cases the sector", () => {
    const profile = normalizeProfile(
      {
        Symbol: "IBM",
        Name: "International Business Machines",
        Exchange: "NYSE",
        Sector: "TECHNOLOGY",
        Industry: "COMPUTER & OFFICE EQUIPMENT",
        Description: "IBM is a technology company.",
        MarketCapitalization: "217000000000",
        PERatio: "38.5",
        EPS: "6.1",
        BookValue: "29.4",
        DividendYield: "0.0283",
        "52WeekHigh": "240.1",
        "52WeekLow": "160.5",
      },
      "IBM",
      "NYSE",
    );

    expect(profile.marketCap).toBe(217_000_000_000);
    expect(profile.peRatio).toBe(38.5);
    expect(profile.sector).toBe("Technology");
    // Yield arrives as a fraction and is shown as a percentage.
    expect(profile.dividendYield).toBeCloseTo(2.83, 2);
    // Not part of this endpoint — left empty rather than invented.
    expect(profile.financials).toEqual([]);
    expect(profile.shareholding).toEqual([]);
  });

  it("treats the empty object BSE listings return as NO_DATA", () => {
    expect(() => normalizeProfile({}, "RELIND", "BSE")).toThrow(MarketDataError);
  });
});

describe("news normalization", () => {
  it("parses the compact timestamp format and keeps the source link", () => {
    const items = normalizeNews(
      {
        feed: [
          {
            title: "Reliance posts quarterly results",
            summary: "Summary text.",
            url: "https://example.com/article",
            source: "Example Wire",
            time_published: "20260904T131500",
            overall_sentiment_label: "Somewhat-Bullish",
            ticker_sentiment: [{ ticker: "RELIANCE.BSE" }],
          },
        ],
      },
      5,
    );

    expect(items[0].publishedAt).toBe("2026-09-04T13:15:00Z");
    expect(items[0].url).toBe("https://example.com/article");
    expect(items[0].sentiment).toBe("Somewhat-Bullish");
    expect(items[0].tickers).toEqual(["RELIND"]);
  });
});

/* -------------------------------------------------------------------------- */
/* Client: refusals arrive as HTTP 200                                        */
/* -------------------------------------------------------------------------- */

describe("AlphaVantageClient", () => {
  const originalFetch = globalThis.fetch;

  function client(apiKey: string | undefined, limit = 25) {
    return new AlphaVantageClient({
      apiKey,
      baseUrl: "https://example.invalid/query",
      timeoutMs: 1000,
      budget: new DailyCallBudget("alphavantage", limit),
    });
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
    await expect(c.request({ function: "GLOBAL_QUOTE", symbol: "IBM" })).rejects.toMatchObject({
      code: "PROVIDER_NOT_CONFIGURED",
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("classifies a premium-endpoint notice without blaming the provider", async () => {
    // Real body returned for TIME_SERIES_INTRADAY on a free key, with HTTP 200.
    respond({
      Information:
        "Thank you for using Alpha Vantage! This is a premium endpoint. You may subscribe to any of the premium plans...",
    });

    const error = await client("k")
      .request({ function: "TIME_SERIES_INTRADAY", symbol: "IBM" })
      .catch((e: unknown) => e);

    expect((error as MarketDataError).code).toBe("PREMIUM_REQUIRED");
    // Fails over to another provider, but must not open the circuit — the
    // endpoints this key *does* cover have to keep working.
    expect((error as MarketDataError).retryable).toBe(true);
    expect((error as MarketDataError).affectsHealth).toBe(false);
  });

  it("detects a rate-limit notice and closes the budget for the day", async () => {
    respond({
      Note: "Thank you for using Alpha Vantage! Our standard API call frequency is 25 requests per day.",
    });

    const c = client("k");
    await expect(c.request({ function: "GLOBAL_QUOTE", symbol: "IBM" })).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });

    // Subsequent calls stop locally rather than making more doomed requests.
    expect(c.budgetSnapshot().exhausted).toBe(true);
    const callsBefore = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await expect(c.request({ function: "GLOBAL_QUOTE", symbol: "IBM" })).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });

  it("classifies an invalid-key / bad-call error message as NO_DATA", async () => {
    respond({ "Error Message": "the parameter apikey is invalid or missing." });

    const error = await client("bad")
      .request({ function: "GLOBAL_QUOTE", symbol: "IBM" })
      .catch((e: unknown) => e);

    expect((error as MarketDataError).code).toBe("NO_DATA");
    expect((error as MarketDataError).retryable).toBe(true);
  });

  it("never puts the API key in a thrown error", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("connect ECONNREFUSED");
    }) as unknown as typeof fetch;

    const error = await client("SUPERSECRETKEY123")
      .request({ function: "GLOBAL_QUOTE", symbol: "IBM" })
      .catch((e: unknown) => e as MarketDataError);

    const serialized = `${(error as Error).message} ${(error as Error).stack ?? ""}`;
    expect(serialized).not.toContain("SUPERSECRETKEY123");
    expect((error as MarketDataError).code).toBe("NETWORK_ERROR");
  });

  it("stops before exceeding the local daily budget", async () => {
    respond(QUOTE_BODY);
    const c = client("k", 2);

    await c.request({ function: "GLOBAL_QUOTE", symbol: "A" });
    await c.request({ function: "GLOBAL_QUOTE", symbol: "B" });
    await expect(c.request({ function: "GLOBAL_QUOTE", symbol: "C" })).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });

    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });

  it("honours a reserve so interactive calls survive bulk work", async () => {
    respond(QUOTE_BODY);
    const c = client("k", 3);

    // Bulk work holding back 2 calls may only use the first.
    await c.request({ function: "GLOBAL_QUOTE", symbol: "A" }, 2);
    await expect(
      c.request({ function: "GLOBAL_QUOTE", symbol: "B" }, 2),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" });

    // An interactive call with no reserve still gets through.
    await expect(c.request({ function: "GLOBAL_QUOTE", symbol: "C" })).resolves.toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Provider: coverage gaps must cost one call, not one per page view          */
/* -------------------------------------------------------------------------- */

describe("AlphaVantageMarketDataProvider quota discipline", () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.ALPHA_VANTAGE_API_KEY;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.ALPHA_VANTAGE_API_KEY = originalKey;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  async function loadProvider() {
    process.env.ALPHA_VANTAGE_API_KEY = "test-key";
    vi.resetModules();
    const { AlphaVantageMarketDataProvider } = await import("../index");
    return new AlphaVantageMarketDataProvider();
  }

  it("asks once for an uncovered symbol, then answers locally", async () => {
    // The empty Global Quote Alpha Vantage returns for symbols it does not cover.
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ "Global Quote": {} }), { status: 200 }),
    ) as unknown as typeof fetch;

    const provider = await loadProvider();

    for (let i = 0; i < 5; i += 1) {
      await provider.getQuote("UNCOVERED").catch(() => undefined);
    }

    // Without the negative cache this would be five calls from a 25/day budget.
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    expect(provider.budgetSnapshot().used).toBe(1);
  });

  it("never spends a call on fundamentals for a BSE listing", async () => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
    const provider = await loadProvider();

    await expect(provider.getCompanyProfile("RELIND")).rejects.toMatchObject({ code: "NO_DATA" });

    // Verified by real request that OVERVIEW returns {} for .BSE, so asking is
    // a guaranteed waste of quota.
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(provider.budgetSnapshot().used).toBe(0);
  });

  it("does not offer batch quotes, so lists cannot fan out into many calls", async () => {
    const provider = await loadProvider();
    // Absence is deliberate: the registry then routes batch requests elsewhere.
    expect((provider as unknown as { getQuotes?: unknown }).getQuotes).toBeUndefined();
    expect(provider.capabilities.indices).toBe(false);
    expect(provider.capabilities.sectors).toBe(false);
    expect(provider.capabilities.breadth).toBe(false);
    expect(provider.metered).toBe(true);
  });

  it("is unconfigured when no key is present", async () => {
    delete process.env.ALPHA_VANTAGE_API_KEY;
    vi.resetModules();
    const { AlphaVantageMarketDataProvider } = await import("../index");
    expect(new AlphaVantageMarketDataProvider().isConfigured()).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* The real quota message, verbatim                                           */
/* -------------------------------------------------------------------------- */

describe("daily quota exhaustion", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // Captured from the live API when the free daily allowance ran out.
  const REAL_LIMIT_BODY = {
    Information:
      "We have detected your API key as DEMOKEY123 and our standard API rate limit is 25 requests per day. Please subscribe to any of the premium plans at https://www.alphavantage.co/premium/ to instantly remove all daily rate limits.",
  };

  it("files the real quota message as RATE_LIMITED, not PREMIUM_REQUIRED", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(REAL_LIMIT_BODY), { status: 200 }),
    ) as unknown as typeof fetch;

    const client = new AlphaVantageClient({
      apiKey: "DEMOKEY123",
      baseUrl: "https://example.invalid/query",
      timeoutMs: 1000,
      budget: new DailyCallBudget("alphavantage", 25),
    });

    const error = await client
      .request({ function: "GLOBAL_QUOTE", symbol: "IBM" })
      .catch((e: unknown) => e as MarketDataError);

    // The message mentions premium plans too; classifying on that would record
    // a temporary quota problem as a permanent capability gap.
    expect(error.code).toBe("RATE_LIMITED");
    // Rate limiting must count against health so the circuit can open.
    expect(error.affectsHealth).toBe(true);
    // And the budget closes for the day rather than retrying.
    expect(client.budgetSnapshot().exhausted).toBe(true);
  });

  it("keeps the key out of the error even though upstream echoes it back", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(REAL_LIMIT_BODY), { status: 200 }),
    ) as unknown as typeof fetch;

    const client = new AlphaVantageClient({
      apiKey: "DEMOKEY123",
      baseUrl: "https://example.invalid/query",
      timeoutMs: 1000,
      budget: new DailyCallBudget("alphavantage", 25),
    });

    const error = await client
      .request({ function: "GLOBAL_QUOTE", symbol: "IBM" })
      .catch((e: unknown) => e as MarketDataError);

    const serialized = `${error.message} ${error.stack ?? ""} ${JSON.stringify(error)}`;
    expect(serialized).not.toContain("DEMOKEY123");
  });

  it("redacts the key if upstream text is ever surfaced", () => {
    expect(redactKey(REAL_LIMIT_BODY.Information, "DEMOKEY123")).not.toContain("DEMOKEY123");
    expect(redactKey(REAL_LIMIT_BODY.Information, "DEMOKEY123")).toContain("[redacted]");
  });
});
