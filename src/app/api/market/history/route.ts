import type { NextRequest } from "next/server";
import { marketData, type CandleInterval } from "@/server/market-data";
import { badRequest, fail, ok } from "@/server/api/respond";

const INTERVALS: CandleInterval[] = ["1D", "1W", "1M", "1Y", "5Y"];

export const dynamic = "force-dynamic";

/** GET /api/market/history?symbol=RELIND&interval=1M */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const interval = (params.get("interval") ?? "1M") as CandleInterval;

  if (!symbol) return badRequest("A `symbol` parameter is required.");
  if (!INTERVALS.includes(interval)) {
    return badRequest(`\`interval\` must be one of ${INTERVALS.join(", ")}.`);
  }

  try {
    return ok(await marketData.getHistoricalData(symbol, interval), 300);
  } catch (error) {
    return fail(error);
  }
}
