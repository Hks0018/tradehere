import { MarketDataError } from "../../errors";
import type {
  CompanyProfile,
  HistoricalCandle,
  InstrumentSearchResult,
  MarketNewsItem,
  NormalizedQuote,
} from "../../types";
import { INDIANAPI_ID } from "./client";
import { toTradehereSymbol } from "./symbol-map";

/**
 * IndianAPI responses -> Tradehere's normalized shapes.
 *
 * Built directly against real captured responses (not the published docs
 * alone, which truncate several fields as `// ...`). Anything the response
 * does not contain is left at a documented fallback rather than invented.
 */

function num(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * IndianAPI reports market cap in ₹ crore (e.g. `1772085.95` for Reliance,
 * i.e. ₹17.72 lakh crore), but `CompanyProfile.marketCap` is absolute rupees
 * throughout the rest of the platform — the mock dataset multiplies its own
 * crore figures by this same factor. Left unconverted, every IndianAPI-sourced
 * company was undervalued ten-millionfold and misclassified as Small Cap.
 */
const CRORE = 1e7;

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/**
 * IndianAPI stamps a quote as `"07 Sep 2026"` + `"10:27:51"`, exchange-local
 * time with no offset. Parsed by hand rather than through `Date`, whose
 * "Mon DD YYYY" parsing is locale-dependent, and stamped +05:30 to match the
 * rest of the platform.
 */
function toTimestamp(date: unknown, time: unknown): string {
  const match = typeof date === "string" ? date.match(/^(\d{2}) (\w{3}) (\d{4})$/) : null;
  if (!match) return new Date().toISOString();
  const month = MONTHS[match[2]];
  if (!month) return new Date().toISOString();
  const clock = typeof time === "string" && /^\d{2}:\d{2}:\d{2}$/.test(time) ? time : "00:00:00";
  return `${match[3]}-${month}-${match[1]}T${clock}+05:30`;
}

interface StockResponse {
  companyName?: string;
  industry?: string;
  error?: string;
  companyProfile?: {
    companyDescription?: string;
    exchangeCodeBse?: string | number;
    exchangeCodeNse?: string;
  };
  currentPrice?: { BSE?: string; NSE?: string };
  percentChange?: number;
  yearHigh?: number;
  yearLow?: number;
  stockDetailsReusableData?: Record<string, unknown>;
  keyMetrics?: Record<string, { key: string; value: string | null }[]>;
  shareholding?: { displayName: string; categories: { holdingDate: string; percentage: string }[] }[];
  recentNews?: { id: number | string; headline: string; date: string; url: string; summary: string }[];
}

function assertStock(body: StockResponse): asserts body is StockResponse & { companyName: string } {
  // Verified by real request: an unrecognised name comes back `{"error": "Stock not found"}`.
  if (body.error || !body.companyName) {
    throw new MarketDataError("NO_DATA", "No data available for this symbol", {
      providerId: INDIANAPI_ID,
      retryable: true,
      affectsHealth: false,
    });
  }
}

export function normalizeQuote(raw: unknown, tradehereSymbol: string): NormalizedQuote {
  const body = (raw ?? {}) as StockResponse;
  assertStock(body);

  const reusable = body.stockDetailsReusableData ?? {};
  const price = num(reusable.price) ?? num(body.currentPrice?.NSE) ?? num(body.currentPrice?.BSE);
  if (price === undefined) {
    throw new MarketDataError("NO_DATA", "Quote payload has no usable price", {
      providerId: INDIANAPI_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  const previousClose = num(reusable.close) ?? price;
  const change = Number((price - previousClose).toFixed(4));
  const changePercent =
    num(reusable.percentChange) ??
    num(body.percentChange) ??
    (previousClose === 0 ? 0 : Number(((change / previousClose) * 100).toFixed(4)));

  const exchangeId = body.companyProfile?.exchangeCodeNse ?? body.companyProfile?.exchangeCodeBse;

  return {
    symbol: tradehereSymbol,
    exchange: body.currentPrice?.NSE ? "NSE" : "BSE",
    instrumentId: `${INDIANAPI_ID}-${exchangeId ?? tradehereSymbol}`,
    name: body.companyName,
    currentPrice: price,
    previousClose,
    // Not part of this endpoint's payload — the previous close is the closest
    // honest stand-in rather than a fabricated intraday open.
    open: previousClose,
    high: num(reusable.high) ?? Math.max(price, previousClose),
    low: num(reusable.low) ?? Math.min(price, previousClose),
    change,
    changePercent: Number(changePercent.toFixed(4)),
    // Not part of this endpoint's payload.
    volume: 0,
    timestamp: toTimestamp(reusable.date, reusable.time),
    source: INDIANAPI_ID,
    // No real-time SLA is asserted anywhere in this vendor's terms.
    dataStatus: "DELAYED",
  };
}

interface HistoricalResponse {
  datasets?: { metric: string; values: [string, string | number, ...unknown[]][] }[];
  error?: string;
}

/**
 * IndianAPI's historical feed is a daily closing-price series, not true OHLC.
 * Open/high/low collapse to the close for each day — the same fallback the
 * engine already applies to a vendor with no intraday range (see
 * `RestMarketDataProvider.normalizeQuote`) — rather than invented.
 */
export function normalizeHistorical(raw: unknown): HistoricalCandle[] {
  const body = (raw ?? {}) as HistoricalResponse;
  if (body.error) {
    throw new MarketDataError("NO_DATA", "No historical data available for this symbol", {
      providerId: INDIANAPI_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  const priceSeries = body.datasets?.find((d) => d.metric === "Price");
  if (!priceSeries || priceSeries.values.length === 0) {
    throw new MarketDataError("NO_DATA", "No price series in the historical response", {
      providerId: INDIANAPI_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  const volumeSeries = body.datasets?.find((d) => d.metric === "Volume");
  const volumeByDate = new Map<string, number>();
  for (const [day, value] of volumeSeries?.values ?? []) {
    const volume = num(value);
    if (volume !== undefined) volumeByDate.set(day, volume);
  }

  return priceSeries.values
    .map(([day, value]): HistoricalCandle | null => {
      const close = num(value);
      if (close === undefined) return null;
      return {
        timestamp: `${day}T00:00:00+05:30`,
        open: close,
        high: close,
        low: close,
        close,
        volume: volumeByDate.get(day) ?? 0,
      };
    })
    .filter((candle): candle is HistoricalCandle => candle !== null)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

interface SearchResultRaw {
  id: string;
  commonName: string;
  mgSector?: string | null;
  exchangeCodeNsi?: string;
  exchangeCodeBse?: string;
}

export function normalizeSearch(body: unknown): InstrumentSearchResult[] {
  if (!Array.isArray(body)) return [];

  return (body as SearchResultRaw[])
    .filter((entry) => entry && entry.commonName)
    .map((entry) => ({
      symbol: entry.exchangeCodeNsi ? toTradehereSymbol(entry.exchangeCodeNsi) : entry.commonName,
      name: entry.commonName,
      exchange: entry.exchangeCodeNsi ? "NSE" : entry.exchangeCodeBse ? "BSE" : "",
      instrumentType: "EQUITY" as const,
      instrumentId: `${INDIANAPI_ID}-${entry.id}`,
      sector: entry.mgSector ?? undefined,
    }));
}

/** Finds a metric by its stable key across IndianAPI's grouped keyMetrics sections. */
function findMetric(
  keyMetrics: Record<string, { key: string; value: string | null }[]> | undefined,
  key: string,
): number | undefined {
  if (!keyMetrics) return undefined;
  for (const group of Object.values(keyMetrics)) {
    const entry = group.find((item) => item.key === key);
    if (entry) return num(entry.value ?? undefined);
  }
  return undefined;
}

export function normalizeProfile(raw: unknown, tradehereSymbol: string): CompanyProfile {
  const body = (raw ?? {}) as StockResponse;
  assertStock(body);

  const reusable = body.stockDetailsReusableData ?? {};
  const industry = body.industry ?? "";

  const shareholding = (body.shareholding ?? []).map((entry) => {
    const latest = entry.categories[entry.categories.length - 1];
    return { label: entry.displayName, value: num(latest?.percentage) ?? 0 };
  });

  return {
    symbol: tradehereSymbol,
    name: body.companyName,
    exchange: body.companyProfile?.exchangeCodeNse ? "NSE" : "BSE",
    // IndianAPI does not distinguish a broader sector from the specific
    // industry the way the interface does — both get the one string it
    // provides rather than one being invented.
    sector: industry,
    industry,
    description: body.companyProfile?.companyDescription ?? "",
    marketCap: (num(reusable.marketCap) ?? 0) * CRORE,
    peRatio: num(reusable.pPerEBasicExcludingExtraordinaryItemsTTM) ?? 0,
    eps: 0,
    bookValue: 0,
    dividendYield: num(reusable.currentDividendYieldCommonStockPrimaryIssueLTM) ?? 0,
    high52: body.yearHigh ?? num(reusable.yhigh) ?? 0,
    low52: body.yearLow ?? num(reusable.ylow) ?? 0,
    roe: findMetric(body.keyMetrics, "returnOnAverageEquity5YearAverage") ?? 0,
    debtToEquity: num(reusable.totalDebtPerTotalEquityMostRecentQuarter) ?? 0,
    revenueGrowth: 0,
    profitGrowth: 0,
    founded: 0,
    headquarters: "",
    employees: 0,
    website: "",
    // The financial-statement history is nested under provider-specific keys
    // that do not map cleanly onto CompanyFinancialYear; left empty rather
    // than guessed, the same choice the Alpha Vantage profile makes.
    financials: [],
    shareholding,
    timestamp: new Date().toISOString(),
  };
}

export function normalizeNews(
  raw: unknown,
  tradehereSymbol: string,
  limit: number,
): MarketNewsItem[] {
  const body = (raw ?? {}) as StockResponse;
  const items = body.recentNews;
  if (!Array.isArray(items) || items.length === 0) {
    throw new MarketDataError("NO_DATA", "No news available for this symbol", {
      providerId: INDIANAPI_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  return items.slice(0, limit).map((item) => ({
    id: `${INDIANAPI_ID}-${item.id}`,
    title: item.headline,
    summary: item.summary,
    url: item.url?.startsWith("http") ? item.url : `https://www.livemint.com${item.url ?? ""}`,
    source: "LiveMint",
    publishedAt: item.date ?? new Date().toISOString(),
    tickers: [tradehereSymbol],
  }));
}
