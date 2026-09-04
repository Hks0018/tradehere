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

  const overall = providers.some((provider) => provider.status === "HEALTHY")
    ? "OPERATIONAL"
    : "DEGRADED";

  return NextResponse.json(
    {
      data: {
        overall,
        providers,
        routing: {
          quotes: marketData.priorityFor("quotes", "getQuote"),
          historical: marketData.priorityFor("historical", "getHistoricalData"),
          indices: marketData.priorityFor("indices", "getIndices"),
          search: marketData.priorityFor("search", "searchInstruments"),
          sectors: marketData.priorityFor("sectors", "getSectorData"),
          breadth: marketData.priorityFor("breadth", "getMarketBreadth"),
          fundamentals: marketData.priorityFor("fundamentals", "getCompanyProfile"),
        },
        checkedAt: new Date().toISOString(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
