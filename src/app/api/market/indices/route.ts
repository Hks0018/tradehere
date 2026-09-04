import { marketData } from "@/server/market-data";
import { fail, ok } from "@/server/api/respond";

export const dynamic = "force-dynamic";

/** GET /api/market/indices */
export async function GET() {
  try {
    return ok(await marketData.getIndices(), 15);
  } catch (error) {
    return fail(error);
  }
}
