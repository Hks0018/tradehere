import type { NextRequest } from "next/server";
import { fail, ok } from "@/server/api/respond";
import {
  getStocks,
  type SortDirection,
  type StockCategory,
  type StockSortKey,
} from "@/services/stockService";

export const dynamic = "force-dynamic";

const CATEGORIES: StockCategory[] = ["all", "popular", "trending", "large", "mid", "small"];
const SORT_KEYS: StockSortKey[] = ["name", "price", "changePercent", "marketCap", "volume"];

/**
 * GET /api/market/stocks — the screener endpoint.
 *
 * Filtering and ranking happen on the server so the browser never receives the
 * full universe, and never learns which provider produced it.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const category = params.get("category") as StockCategory | null;
  const sortKey = params.get("sortKey") as StockSortKey | null;
  const sortDirection = params.get("sortDirection") === "asc" ? "asc" : "desc";
  const sectors = (params.get("sectors") ?? "")
    .split(",")
    .map((sector) => sector.trim())
    .filter(Boolean);

  try {
    const stocks = await getStocks({
      search: params.get("search") ?? "",
      category: category && CATEGORIES.includes(category) ? category : "all",
      sectors,
      sortKey: sortKey && SORT_KEYS.includes(sortKey) ? sortKey : "marketCap",
      sortDirection: sortDirection as SortDirection,
    });

    return ok(
      {
        data: stocks,
        meta: {
          source: null,
          status: "CACHED",
          timestamp: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
          fromCache: false,
          failoverUsed: false,
          attempted: [],
        },
      },
      10,
    );
  } catch (error) {
    return fail(error);
  }
}
