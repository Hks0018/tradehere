import type { NextRequest } from "next/server";
import { marketData } from "@/server/market-data";
import { fail, ok } from "@/server/api/respond";

export const dynamic = "force-dynamic";

/** GET /api/market/search?q=reli&limit=10 — instruments only. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q") ?? "";
  const limit = Math.min(Math.max(Number.parseInt(params.get("limit") ?? "12", 10) || 12, 1), 50);

  try {
    return ok(await marketData.searchInstruments(query, limit), 600);
  } catch (error) {
    return fail(error);
  }
}
