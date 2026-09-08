import { afterEach, describe, expect, it, vi } from "vitest";
import { isMarketDataError, MarketDataError } from "../../../errors";
import { fetchIndicesClose } from "../client";
import { nseDate } from "../dates";
import { parseIndicesClose } from "../normalize";

/** A trimmed real capture from NSE's own `ind_close_all` archive file. */
const INDICES_CSV = [
  "Index Name,Index Date,Open Index Value,High Index Value,Low Index Value,Closing Index Value,Points Change,Change(%),Volume,Turnover (Rs. Cr.),P/E,P/B,Div Yield",
  "Nifty 50,07-09-2026,23883.15,23890,23737.9,23779.15,-118.55,-.5,205864370,17371.86,20.1,2.88,1.19",
  "Nifty Next 50,07-09-2026,72884.4,72962.55,72512.2,72575.75,-305.15,-.42,147128508,7734.22,19.19,3.23,1",
  "NIFTY Midcap 100,07-09-2026,63084.5,63166.6,62667.15,62786.15,-292.9,-.46,1024016604,15880.32,30.26,4.32,.55",
  "Nifty Bank,07-09-2026,57343.3,57426.85,57002.95,57088.3,-281.35,-.49,130217147,4759.92,13.51,1.71,.69",
  "Nifty IT,07-09-2026,30343.2,30377.1,29847.25,29995.2,-699.9,-2.28,27245871,3043.8,19.14,5.28,2.68",
].join("\n");

describe("indices close normalization", () => {
  it("parses the four NSE-published indices Tradehere tracks", () => {
    const indices = parseIndicesClose(INDICES_CSV, "2026-09-07");

    expect(indices.size).toBe(4);
    const nifty = indices.get("NIFTY-50");
    expect(nifty?.currentValue).toBe(23779.15);
    expect(nifty?.change).toBe(-118.55);
    expect(nifty?.previousClose).toBeCloseTo(23897.7, 2);
    expect(nifty?.region).toBe("India");
    expect(nifty?.timestamp).toBe("2026-09-07T00:00:00+05:30");
    expect(nifty?.source).toBe("nse");
  });

  it("has no entry for an index NSE does not publish", () => {
    const indices = parseIndicesClose(INDICES_CSV, "2026-09-07");
    expect(indices.has("SENSEX")).toBe(false);
  });

  it("rejects a report missing expected columns", () => {
    expect(() => parseIndicesClose("A,B,C\n1,2,3", "2026-09-07")).toThrow(MarketDataError);
  });
});

describe("NSE client: day walk-back", () => {
  const originalFetch = globalThis.fetch;
  const clientConfig = { archiveBaseUrl: "https://archive.example.invalid", timeoutMs: 1000, lookbackDays: 5 };
  const now = () => Date.parse("2026-09-08T08:00:00.000Z"); // Tuesday, session in progress

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("walks back over unpublished days to the last session", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("07092026")) return new Response(INDICES_CSV, { status: 200 });
      return new Response(null, { status: 404 });
    }) as unknown as typeof fetch;

    const result = await fetchIndicesClose(clientConfig, now);
    expect(result.tradingDate).toBe("2026-09-07");
    expect(result.text).toContain("Nifty 50");
  });

  it("gives up after the lookback window with a retryable NO_DATA", async () => {
    globalThis.fetch = vi.fn(async () => new Response(null, { status: 404 })) as unknown as typeof fetch;

    const error = await fetchIndicesClose(clientConfig, now).catch((e: unknown) => e);
    expect(isMarketDataError(error)).toBe(true);
    expect((error as MarketDataError).code).toBe("NO_DATA");
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(clientConfig.lookbackDays);
  });

  it("surfaces a genuine upstream failure rather than masking it as no data", async () => {
    globalThis.fetch = vi.fn(async () => new Response("", { status: 503 })) as unknown as typeof fetch;

    const error = await fetchIndicesClose(clientConfig, now).catch((e: unknown) => e);
    expect((error as MarketDataError).code).toBe("PROVIDER_UNAVAILABLE");
    expect((error as MarketDataError).affectsHealth).toBe(true);
  });
});

describe("nseDate", () => {
  it("computes the IST calendar date, independent of the runtime timezone", () => {
    const today = nseDate(Date.parse("2026-09-08T08:00:00.000Z"), 0);
    expect(today.iso).toBe("2026-09-08");
    expect(today.ddmmyyyy).toBe("08092026");

    // Just after midnight UTC is already the next IST calendar day.
    const rollover = nseDate(Date.parse("2026-09-07T19:00:00.000Z"), 0);
    expect(rollover.iso).toBe("2026-09-08");
  });

  it("walks backward by whole calendar days, crossing a month boundary", () => {
    const date = nseDate(Date.parse("2026-10-01T08:00:00.000Z"), 1);
    expect(date.iso).toBe("2026-09-30");
  });
});

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

describe("NseIndicesProvider", () => {
  const originalFetch = globalThis.fetch;
  const originalEnabled = process.env.NSE_ENABLED;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.NSE_ENABLED = originalEnabled;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  function respondIndices() {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("07092026")
        ? new Response(INDICES_CSV, { status: 200 })
        : new Response(null, { status: 404 });
    }) as unknown as typeof fetch;
  }

  async function loadProvider(now: () => number) {
    vi.resetModules();
    const { NseIndicesProvider } = await import("../index");
    return new NseIndicesProvider(now);
  }

  it("answers getIndex for an NSE-published index and rejects one it does not cover", async () => {
    respondIndices();
    const provider = await loadProvider(() => Date.parse("2026-09-08T08:00:00.000Z"));

    const nifty = await provider.getIndex!("NIFTY-50");
    expect(nifty.data.currentValue).toBe(23779.15);
    expect(nifty.status).toBe("DELAYED");

    const error = await provider.getIndex!("SENSEX").catch((e: unknown) => e);
    expect(isMarketDataError(error)).toBe(true);
    expect((error as MarketDataError).affectsHealth).toBe(false);
  });

  it("caches the resolved day: a second read makes no new request", async () => {
    respondIndices();
    const provider = await loadProvider(() => Date.parse("2026-09-08T08:00:00.000Z"));

    await provider.getIndex!("NIFTY-50");
    const callsAfterFirst = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await provider.getIndex!("NIFTY-BANK");
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst);
  });

  it("declares no bulk getIndices, so it can never displace the full sample list", async () => {
    const provider = await loadProvider(Date.now);
    expect((provider as unknown as { getIndices?: unknown }).getIndices).toBeUndefined();
    expect(provider.capabilities.indices).toBe(true);
    expect(provider.metered).toBe(false);
  });

  it("is configured by default with no credentials, and honours NSE_ENABLED=false", async () => {
    delete process.env.NSE_ENABLED;
    const enabled = await loadProvider(Date.now);
    expect(enabled.isConfigured()).toBe(true);

    process.env.NSE_ENABLED = "false";
    const disabled = await loadProvider(Date.now);
    expect(disabled.isConfigured()).toBe(false);
  });
});
