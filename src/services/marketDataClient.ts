import type { SearchResult, Stock } from "@/types";
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

export async function fetchSearch(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const body = await getJson<{ data: SearchResult[] }>(`/api/search?${params}`, signal);
  return body.data;
}
