import type { PricePoint, SearchResult, Stock, Timeframe } from "@/types";
import type { StockCategory, StockSortKey, SortDirection } from "./stockService.types";

/**
 * Browser-side access to Tradehere's own API.
 *
 * This is the only route by which client components obtain market data. They
 * never import the orchestrator, never see a provider name, and never carry a
 * credential — the server answers with data that is already normalized.
 *
 * Every call takes an `AbortSignal` so superseded requests are cancelled rather
 * than racing to overwrite fresher results.
 */

interface ApiError {
  error: { code: string; message: string };
}

export class MarketDataRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MarketDataRequestError";
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });

  if (!response.ok) {
    let code = "REQUEST_FAILED";
    let message = "Market data is temporarily unavailable.";
    try {
      const body = (await response.json()) as ApiError;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // Non-JSON error body; the defaults above are already safe to show.
    }
    throw new MarketDataRequestError(code, message);
  }

  return (await response.json()) as T;
}

export interface StockQueryParams {
  search?: string;
  category?: StockCategory;
  sectors?: string[];
  sortKey?: StockSortKey;
  sortDirection?: SortDirection;
}

export async function fetchStocks(
  query: StockQueryParams,
  signal?: AbortSignal,
): Promise<Stock[]> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.sectors?.length) params.set("sectors", query.sectors.join(","));
  if (query.sortKey) params.set("sortKey", query.sortKey);
  if (query.sortDirection) params.set("sortDirection", query.sortDirection);

  const body = await getJson<{ data: Stock[] }>(`/api/market/stocks?${params}`, signal);
  return body.data;
}

export interface HistoryResponse {
  points: PricePoint[];
  source: string | null;
  status: string;
  timestamp: string;
}

/**
 * Price history for one instrument.
 *
 * Returns the provenance alongside the series so the chart can state where the
 * data came from instead of assuming.
 */
export async function fetchHistory(
  symbol: string,
  interval: Timeframe,
  signal?: AbortSignal,
): Promise<HistoryResponse> {
  const body = await getJson<{
    data: { timestamp: string; close: number }[];
    meta: { source: string | null; status: string; timestamp: string };
  }>(`/api/market/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}`, signal);

  return {
    // Intraday timestamps carry a time; daily ones do not. Slicing rather than
    // parsing keeps labels stable regardless of the viewer's timezone.
    points: body.data.map((candle) => ({
      t: interval === "1D" && candle.timestamp.length > 10
        ? candle.timestamp.slice(11, 16)
        : candle.timestamp.slice(0, 10),
      v: candle.close,
    })),
    source: body.meta.source,
    status: body.meta.status,
    timestamp: body.meta.timestamp,
  };
}

export async function fetchSearch(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const body = await getJson<{ data: SearchResult[] }>(`/api/search?${params}`, signal);
  return body.data;
}
