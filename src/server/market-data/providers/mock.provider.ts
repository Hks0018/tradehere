import { MARKET_INDICES, MARKET_SENTIMENT, MARKET_STATUS, SECTORS } from "@/data/markets";
import { STOCKS } from "@/data/stocks";
import { DATA_REFERENCE_DATE, seedFromString, seededRandom, seriesForTimeframe } from "@/utils/series";
import { MarketDataError } from "../errors";
import type { MarketDataProvider } from "../provider.interface";
import type {
  CandleInterval,
  CompanyProfile,
  HistoricalCandle,
  InstrumentSearchResult,
  MarketBreadth,
  NormalizedIndex,
  NormalizedQuote,
  NormalizedSector,
  ProviderCapabilities,
  ProviderResult,
} from "../types";

const PROVIDER_ID = "mock";

/**
 * The sample dataset, expressed as a real provider.
 *
 * This is the only module in the application still permitted to read from
 * `src/data`. Everything above it sees normalized types, which is what makes
 * swapping in a live vendor a configuration change rather than a rewrite.
 *
 * Every response is stamped `MOCK`, so no layer above can mistake it for a
 * real quote.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  readonly id = PROVIDER_ID;
  readonly label = "Tradehere Sample Data";

  readonly capabilities: ProviderCapabilities = {
    quotes: true,
    historical: true,
    indices: true,
    search: true,
    sectors: true,
    breadth: true,
    fundamentals: true,
    // No streaming and no news feed from the sample set.
    websocket: false,
    news: false,
  };

  /** Always available — it is bundled data with no credentials to miss. */
  isConfigured(): boolean {
    return true;
  }

  async healthCheck(): Promise<void> {
    if (STOCKS.length === 0) {
      throw new MarketDataError("NO_DATA", "Sample dataset is empty", { providerId: PROVIDER_ID });
    }
  }

  async getQuote(symbol: string): Promise<ProviderResult<NormalizedQuote>> {
    const stock = findStock(symbol);
    if (!stock) {
      throw new MarketDataError("INVALID_SYMBOL", `Unknown symbol ${symbol}`, {
        providerId: PROVIDER_ID,
      });
    }
    return result(toQuote(stock));
  }

  async getQuotes(symbols: string[]): Promise<ProviderResult<NormalizedQuote[]>> {
    // Unknown symbols are skipped rather than failing the whole batch.
    const quotes = symbols
      .map((symbol) => findStock(symbol))
      .filter((stock): stock is (typeof STOCKS)[number] => Boolean(stock))
      .map(toQuote);
    return result(quotes);
  }

  async getHistoricalData(
    symbol: string,
    interval: CandleInterval,
  ): Promise<ProviderResult<HistoricalCandle[]>> {
    const stock = findStock(symbol);
    const index = stock ? undefined : MARKET_INDICES.find((i) => matchesIndex(i.id, i.shortName, symbol));

    if (!stock && !index) {
      throw new MarketDataError("INVALID_SYMBOL", `Unknown symbol ${symbol}`, {
        providerId: PROVIDER_ID,
      });
    }

    const seedKey = stock ? `history:${stock.symbol}` : `index-history:${index!.id}`;
    const endValue = stock ? stock.price : index!.value;
    const series = seriesForTimeframe(seedKey, endValue, interval);

    return result(toCandles(series, seedKey, interval));
  }

  async getIndices(): Promise<ProviderResult<NormalizedIndex[]>> {
    return result(
      MARKET_INDICES.map<NormalizedIndex>((index) => ({
        symbol: index.id.toUpperCase(),
        name: index.name,
        currentValue: index.value,
        previousClose: index.previousClose,
        change: index.change,
        changePercent: index.changePercent,
        open: index.previousClose,
        high: index.dayHigh,
        low: index.dayLow,
        timestamp: DATA_REFERENCE_DATE,
        source: PROVIDER_ID,
        region: index.region,
        shortName: index.shortName,
      })),
    );
  }

  async listInstruments(): Promise<ProviderResult<InstrumentSearchResult[]>> {
    return result(STOCKS.map(toInstrument));
  }

  async searchInstruments(
    query: string,
    limit: number,
  ): Promise<ProviderResult<InstrumentSearchResult[]>> {
    const term = query.trim().toLowerCase();
    if (!term) return result([]);

    const matches = STOCKS.filter(
      (stock) =>
        stock.name.toLowerCase().includes(term) ||
        stock.symbol.toLowerCase().includes(term) ||
        stock.sector.toLowerCase().includes(term),
    )
      .slice(0, limit)
      .map(toInstrument);

    return result(matches);
  }

  async getSectorData(): Promise<ProviderResult<NormalizedSector[]>> {
    return result(
      SECTORS.map<NormalizedSector>((sector) => ({
        sector: sector.name,
        sectorId: sector.id,
        performance: sector.changePercent,
        changePercent: sector.changePercent,
        advancingCount: sector.advancers,
        decliningCount: sector.decliners,
        marketCapShare: sector.marketCapShare,
        timestamp: DATA_REFERENCE_DATE,
      })),
    );
  }

  async getMarketBreadth(): Promise<ProviderResult<MarketBreadth>> {
    return result<MarketBreadth>({
      advancers: MARKET_SENTIMENT.advancers,
      decliners: MARKET_SENTIMENT.decliners,
      unchanged: MARKET_SENTIMENT.unchanged,
      sentimentScore: MARKET_SENTIMENT.score,
      sentimentLabel: MARKET_SENTIMENT.label,
      isOpen: MARKET_STATUS.isOpen,
      sessionLabel: MARKET_STATUS.label,
      timestamp: DATA_REFERENCE_DATE,
    });
  }

  async getCompanyProfile(symbol: string): Promise<ProviderResult<CompanyProfile>> {
    const stock = findStock(symbol);
    if (!stock) {
      throw new MarketDataError("INVALID_SYMBOL", `Unknown symbol ${symbol}`, {
        providerId: PROVIDER_ID,
      });
    }

    return result<CompanyProfile>({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      industry: stock.industry,
      description: stock.description,
      marketCap: stock.marketCap,
      peRatio: stock.pe,
      eps: stock.eps,
      bookValue: stock.bookValue,
      dividendYield: stock.dividendYield,
      high52: stock.high52,
      low52: stock.low52,
      roe: stock.roe,
      debtToEquity: stock.debtToEquity,
      revenueGrowth: stock.revenueGrowth,
      profitGrowth: stock.profitGrowth,
      founded: stock.founded,
      headquarters: stock.headquarters,
      employees: stock.employees,
      website: stock.website,
      financials: stock.financials,
      shareholding: stock.shareholding,
      timestamp: DATA_REFERENCE_DATE,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Normalisation helpers                                                      */
/* -------------------------------------------------------------------------- */

function result<T>(data: T): ProviderResult<T> {
  return { data, status: "MOCK", timestamp: DATA_REFERENCE_DATE };
}

function findStock(symbol: string) {
  const target = symbol.trim().toUpperCase();
  return STOCKS.find((stock) => stock.symbol.toUpperCase() === target);
}

function matchesIndex(id: string, shortName: string, symbol: string): boolean {
  const target = symbol.trim().toUpperCase();
  return id.toUpperCase() === target || shortName.toUpperCase() === target;
}

function toInstrument(stock: (typeof STOCKS)[number]): InstrumentSearchResult {
  return {
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
    instrumentType: "EQUITY",
    instrumentId: `${PROVIDER_ID}-${stock.symbol}`,
    sector: stock.sector,
  };
}

/**
 * The sample dataset holds a close and a day change but no session OHLC, so the
 * missing legs are derived from a seed keyed on the symbol. Deterministic by
 * construction: the same symbol always yields the same session, which keeps
 * server and client renders identical.
 */
function toQuote(stock: (typeof STOCKS)[number]): NormalizedQuote {
  const rand = seededRandom(seedFromString(`session:${stock.symbol}`));
  const previousClose = Number((stock.price - stock.change).toFixed(2));
  const open = Number((previousClose * (1 + (rand() - 0.5) * 0.006)).toFixed(2));
  const high = Number((Math.max(stock.price, open) * (1 + rand() * 0.008)).toFixed(2));
  const low = Number((Math.min(stock.price, open) * (1 - rand() * 0.008)).toFixed(2));

  return {
    symbol: stock.symbol,
    exchange: stock.exchange,
    instrumentId: `${PROVIDER_ID}-${stock.symbol}`,
    name: stock.name,
    currentPrice: stock.price,
    previousClose,
    open,
    high,
    low,
    change: stock.change,
    changePercent: stock.changePercent,
    volume: stock.volume,
    timestamp: DATA_REFERENCE_DATE,
    source: PROVIDER_ID,
    dataStatus: "MOCK",
  };
}

/** Session date used to stamp generated candles, as `YYYY-MM-DD`. */
const REFERENCE_DAY = DATA_REFERENCE_DATE.slice(0, 10);

/**
 * Expands a close-only series into OHLC candles.
 *
 * Timestamps are written with an explicit +05:30 offset and are read back by
 * string slicing rather than `Date` parsing, so axis labels cannot shift with
 * the runtime timezone.
 */
function toCandles(
  series: { t: string; v: number }[],
  seedKey: string,
  interval: CandleInterval,
): HistoricalCandle[] {
  const rand = seededRandom(seedFromString(`candles:${seedKey}:${interval}`));

  return series.map((point, index) => {
    const close = point.v;
    const open = index === 0 ? close : series[index - 1].v;
    const spread = Math.abs(close - open) + close * 0.002 * rand();

    return {
      timestamp: interval === "1D"
        ? `${REFERENCE_DAY}T${point.t}:00+05:30`
        : `${point.t}T00:00:00+05:30`,
      open: Number(open.toFixed(2)),
      high: Number((Math.max(open, close) + spread * 0.5).toFixed(2)),
      low: Number((Math.min(open, close) - spread * 0.5).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(120_000 + rand() * 4_800_000),
    };
  });
}
