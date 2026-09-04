import type { NextRequest } from "next/server";
import { fail } from "@/server/api/respond";
import { NextResponse } from "next/server";
import { getSearchSuggestions, search } from "@/services/searchService";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=... — global search across instruments and content.
 *
 * With no query it returns the suggestion set the dialog opens with.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim();
  const limit = Math.min(Math.max(Number.parseInt(params.get("limit") ?? "12", 10) || 12, 1), 30);

  try {
    const results = query ? await search(query, limit) : await getSearchSuggestions();
    return NextResponse.json(
      { data: results },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    return fail(error);
  }
}
