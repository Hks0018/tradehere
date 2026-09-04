import "server-only";

import { NextResponse } from "next/server";
import { isMarketDataError } from "@/server/market-data";
import type { DataEnvelope } from "@/server/market-data";

/**
 * Response helpers for the internal API.
 *
 * Success bodies keep the orchestrator's `{ data, meta }` envelope so callers
 * always receive the provenance alongside the payload. Failures are reduced to
 * a code and a vetted public message — upstream text, URLs and keys never
 * cross this boundary.
 */

export function ok<T>(envelope: DataEnvelope<T>, cacheSeconds: number): NextResponse {
  return NextResponse.json(envelope, {
    headers: {
      // Data is only as cacheable as it is fresh; stale-while-revalidate keeps
      // a shared cache useful without ever serving something as live.
      "Cache-Control": `private, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 4}`,
    },
  });
}

export function fail(error: unknown): NextResponse {
  if (isMarketDataError(error)) {
    return NextResponse.json(
      { error: { code: error.code, message: error.publicMessage } },
      { status: error.httpStatus },
    );
  }

  // Anything unexpected is reported without detail.
  console.error("[api] unhandled error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
    { status: 500 },
  );
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: { code: "BAD_REQUEST", message } }, { status: 400 });
}
