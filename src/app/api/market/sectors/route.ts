import { marketData } from "@/server/market-data";
import { fail, ok } from "@/server/api/respond";

export const dynamic = "force-dynamic";

/** GET /api/market/sectors */
export async function GET() {
  try {
    return ok(await marketData.getSectorData(), 60);
  } catch (error) {
    return fail(error);
  }
}
