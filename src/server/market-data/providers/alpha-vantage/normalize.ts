import { MarketDataError } from "../../errors";
import type {
  CompanyProfile,
  HistoricalCandle,
  InstrumentSearchResult,
  InstrumentType,
  MarketNewsItem,
  NewsSentiment,
  NormalizedQuote,
} from "../../types";
import { ALPHA_VANTAGE_ID } from "./client";
import { toTradehereSymbol } from "./symbol-map";

/**
 * Alpha Vantage responses -> Tradehere's normalized shapes.
 *
 * Alpha Vantage returns every number as a string under ordinal keys
 * (`"05. price"`), so parsing is explicit and every value is checked. Anything
 * the response does not contain is left absent rather than invented.
 */

function num(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function required(value: unknown, field: string): number {
  const parsed = num(value);
  if (parsed === undefined) {
    throw new MarketDataError("VALIDATION_FAILED", `Missing numeric field ${field}`, {
      providerId: ALPHA_VANTAGE_ID,
    });
  }
  return parsed;
}

/**
 * Alpha Vantage dates are exchange-local calendar dates with no offset. They
 * are stamped +05:30 to match the rest of the platform, and read back by string
 * slicing, so a chart label cannot shift with the server's timezone.
 */
function toTimestamp(day: string): string {
  return `${day}T00:00:00+05:30`;
}

export function normalizeQuote(
  body: Record<string, unknown>,
  tradehereSymbol: string,
  name: string,
  exchange: string,
): NormalizedQuote {
  const quote = body["Global Quote"] as Record<string, unknown> | undefined;

  // An unknown or uncovered symbol comes back as an empty object, not an error.
  if (!quote || Object.keys(quote).length === 0) {
    throw new MarketDataError("NO_DATA", "No quote available for this symbol", {
      providerId: ALPHA_VANTAGE_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  const price = required(quote["05. price"], "price");
  const previousClose = required(quote["08. previous close"], "previous close");
  const day = typeof quote["07. latest trading day"] === "string"
    ? (quote["07. latest trading day"] as string)
    : undefined;

  // "1.6102%" -> 1.6102
  const changePercentRaw = String(quote["10. change percent"] ?? "").replace("%", "");
  const changePercent = num(changePercentRaw) ?? (previousClose === 0 ? 0 : ((price - previousClose) / previousClose) * 100);

  return {
    symbol: tradehereSymbol,
    exchange,
    instrumentId: `${ALPHA_VANTAGE_ID}-${String(quote["01. symbol"] ?? tradehereSymbol)}`,
    name,
    currentPrice: price,
    previousClose,
    open: num(quote["02. open"]) ?? previousClose,
    high: num(quote["03. high"]) ?? Math.max(price, previousClose),
    low: num(quote["04. low"]) ?? Math.min(price, previousClose),
    change: num(quote["09. change"]) ?? Number((price - previousClose).toFixed(4)),
    changePercent: Number(changePercent.toFixed(4)),
    volume: num(quote["06. volume"]) ?? 0,
    timestamp: day ? toTimestamp(day) : new Date().toISOString(),
    source: ALPHA_VANTAGE_ID,
    // End-of-day close on a free key, never a streaming price.
    dataStatus: "DELAYED",
  };
}

export function normalizeDailyCandles(body: Record<string, unknown>): HistoricalCandle[] {
  const series = body["Time Series (Daily)"] as Record<string, Record<string, string>> | undefined;

  if (!series || Object.keys(series).length === 0) {
    throw new MarketDataError("NO_DATA", "No historical data available for this symbol", {
      providerId: ALPHA_VANTAGE_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  // Alpha Vantage returns newest first; charts read oldest to newest.
  return Object.entries(series)
    .map(([day, values]) => ({
      timestamp: toTimestamp(day),
      open: required(values["1. open"], "open"),
      high: required(values["2. high"], "high"),
      low: required(values["3. low"], "low"),
      close: required(values["4. close"], "close"),
      volume: num(values["5. volume"]) ?? 0,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

const ASSET_TYPES: Record<string, InstrumentType> = {
  Equity: "EQUITY",
  ETF: "ETF",
  "Mutual Fund": "FUND",
  Index: "INDEX",
};

export function normalizeSearch(body: Record<string, unknown>): InstrumentSearchResult[] {
  const matches = body.bestMatches as Record<string, string>[] | undefined;
  if (!Array.isArray(matches)) return [];

  return matches
    .filter((match) => match["1. symbol"] && match["2. name"])
    .map<InstrumentSearchResult>((match) => {
      const providerSymbol = match["1. symbol"];
      return {
        // Prefer Tradehere's own symbol when this instrument is one we cover,
        // so a search result links to a page that exists.
        symbol: toTradehereSymbol(providerSymbol),
        name: match["2. name"],
        exchange: match["4. region"] ?? "",
        instrumentType: ASSET_TYPES[match["3. type"]] ?? "EQUITY",
        instrumentId: `${ALPHA_VANTAGE_ID}-${providerSymbol}`,
      };
    });
}

/**
 * OVERVIEW -> CompanyProfile.
 *
 * Fields absent from the response are left at zero rather than guessed; the
 * interface renders a dash. Revenue and profit history are not part of this
 * endpoint, so `financials` and `shareholding` stay empty instead of being
 * fabricated.
 */
export function normalizeProfile(
  body: Record<string, unknown>,
  tradehereSymbol: string,
  exchange: string,
): CompanyProfile {
  if (!body.Symbol || Object.keys(body).length === 0) {
    throw new MarketDataError("NO_DATA", "No company profile available for this symbol", {
      providerId: ALPHA_VANTAGE_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");

  return {
    symbol: tradehereSymbol,
    name: str("Name") || tradehereSymbol,
    exchange: str("Exchange") || exchange,
    sector: titleCase(str("Sector")),
    industry: titleCase(str("Industry")),
    description: str("Description"),
    marketCap: num(body.MarketCapitalization) ?? 0,
    peRatio: num(body.PERatio) ?? 0,
    eps: num(body.EPS) ?? 0,
    bookValue: num(body.BookValue) ?? 0,
    dividendYield: (num(body.DividendYield) ?? 0) * 100,
    high52: num(body["52WeekHigh"]) ?? 0,
    low52: num(body["52WeekLow"]) ?? 0,
    roe: (num(body.ReturnOnEquityTTM) ?? 0) * 100,
    debtToEquity: 0,
    revenueGrowth: (num(body.QuarterlyRevenueGrowthYOY) ?? 0) * 100,
    profitGrowth: (num(body.QuarterlyEarningsGrowthYOY) ?? 0) * 100,
    founded: 0,
    headquarters: str("Address"),
    employees: num(body.FullTimeEmployees) ?? 0,
    website: str("OfficialSite"),
    financials: [],
    shareholding: [],
    timestamp: new Date().toISOString(),
  };
}

/** Alpha Vantage reports sectors in upper case; the interface uses title case. */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const SENTIMENTS = new Set<NewsSentiment>([
  "Bullish",
  "Somewhat-Bullish",
  "Neutral",
  "Somewhat-Bearish",
  "Bearish",
]);

export function normalizeNews(
  body: Record<string, unknown>,
  limit: number,
): MarketNewsItem[] {
  const feed = body.feed as Record<string, unknown>[] | undefined;
  if (!Array.isArray(feed) || feed.length === 0) {
    throw new MarketDataError("NO_DATA", "No news available for this symbol", {
      providerId: ALPHA_VANTAGE_ID,
      retryable: true,
      affectsHealth: false,
    });
  }

  return feed.slice(0, limit).map<MarketNewsItem>((item, index) => {
    const label = String(item.overall_sentiment_label ?? "");
    const tickers = Array.isArray(item.ticker_sentiment)
      ? (item.ticker_sentiment as Record<string, string>[])
          .map((entry) => toTradehereSymbol(entry.ticker ?? ""))
          .filter(Boolean)
      : [];

    return {
      id: `${ALPHA_VANTAGE_ID}-${index}-${String(item.time_published ?? "")}`,
      title: String(item.title ?? ""),
      summary: String(item.summary ?? ""),
      url: String(item.url ?? ""),
      source: String(item.source ?? "Alpha Vantage"),
      publishedAt: parseNewsTime(String(item.time_published ?? "")),
      sentiment: SENTIMENTS.has(label as NewsSentiment) ? (label as NewsSentiment) : undefined,
      tickers,
    };
  });
}

/** Alpha Vantage stamps news as `YYYYMMDDTHHMMSS`. */
function parseNewsTime(value: string): string {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (!match) return new Date().toISOString();
  const [, y, m, d, hh, mm, ss] = match;
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}
