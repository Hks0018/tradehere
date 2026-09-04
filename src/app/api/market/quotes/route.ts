import type { NextRequest } from "next/server";
import { marketData } from "@/server/market-data";
import { badRequest, fail, ok } from "@/server/api/respond";

const MAX_SYMBOLS = 50;

/** GET /api/market/quotes?symbols=RELIND,TCSIT */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols");
  if (!raw) return badRequest("A `symbols` parameter is required.");

  const symbols = raw.split(",").map((symbol) => symbol.trim()).filter(Boolean);
  if (symbols.length === 0) return badRequest("At least one symbol is required.");
  if (symbols.length > MAX_SYMBOLS) {
    return badRequest(`At most ${MAX_SYMBOLS} symbols may be requested at once.`);
  }

  try {
    return ok(await marketData.getQuotes(symbols), 10);
  } catch (error) {
    return fail(error);
  }
}
