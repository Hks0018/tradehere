import type { NextRequest } from "next/server";
import { marketData } from "@/server/market-data";
import { badRequest, fail, ok } from "@/server/api/respond";

export const dynamic = "force-dynamic";

/** GET /api/market/quote?symbol=RELIND */
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) return badRequest("A `symbol` parameter is required.");

  try {
    return ok(await marketData.getQuote(symbol), 10);
  } catch (error) {
    return fail(error);
  }
}
