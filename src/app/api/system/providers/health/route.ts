import { marketData } from "@/server/market-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/system/providers/health
 *
 * Operational visibility for development and a future admin view: which
 * providers exist, whether they are configured, how they are behaving and the
 * state of each circuit breaker.
 *
 * Deliberately says *whether* a provider is configured, never *how* — no base
 * URLs, no keys, and only error codes rather than upstream messages.
 */
export async function GET() {
  const providers = marketData.providerHealth();

  // Remaining daily quota for the metered provider. Counts only — no key, no
  // base URL, nothing that could identify the credential.
  //
  // Detected structurally rather than with `instanceof`: the engine is reached
  // both through its barrel and by direct path, and a bundler may give those
  // separate module instances, which would silently fail an identity check.
  const metered = marketData.provider("alphavantage") as
    | { budgetSnapshot?: () => unknown }
    | undefined;
  const budget = typeof metered?.budgetSnapshot === "function" ? metered.budgetSnapshot() : null;

  const overall = providers.some((provider) => provider.status === "HEALTHY")
    ? "OPERATIONAL"
    : "DEGRADED";

  return NextResponse.json(
    {
      data: {
        overall,
        providers,
        budget: budget ? { alphavantage: budget } : undefined,
        routing: {
          quotes: marketData.priorityFor("quotes", "getQuote"),
          historical: marketData.priorityFor("historical", "getHistoricalData"),
          indices: marketData.priorityFor("indices", "getIndices"),
          search: marketData.priorityFor("search", "searchInstruments"),
          sectors: marketData.priorityFor("sectors", "getSectorData"),
          breadth: marketData.priorityFor("breadth", "getMarketBreadth"),
          fundamentals: marketData.priorityFor("fundamentals", "getCompanyProfile"),
          news: marketData.priorityFor("news", "getMarketNews"),
        },
        checkedAt: new Date().toISOString(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
