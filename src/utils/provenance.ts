// Imported from the types module rather than the barrel: the barrel is
// guarded by `server-only`, and this helper is used in client components.
import type { DataStatus } from "@/server/market-data/types";

export interface Provenance {
  source: string | null;
  status: DataStatus;
  timestamp: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  alphavantage: "Alpha Vantage",
  indianapi: "IndianAPI",
  nse: "NSE India",
  mock: "Sample data",
  primary: "Primary vendor",
  secondary: "Secondary vendor",
};

export function providerLabel(source: string | null): string {
  if (!source) return "Sample data";
  return PROVIDER_LABELS[source] ?? source;
}

/**
 * One honest sentence about where a number came from.
 *
 * The rule this enforces: nothing is described as live unless the provider
 * actually guarantees it. Alpha Vantage on a free key returns an end-of-day
 * close, so it is called exactly that — never "live". Sample data always says
 * so, whether it arrived fresh or from cache.
 */
export function describeQuote(meta: Provenance): string {
  const label = providerLabel(meta.source);
  const day = meta.timestamp?.slice(0, 10);

  switch (meta.status) {
    case "LIVE":
      return `Live price · ${label}`;
    case "DELAYED":
      return `End-of-day close · ${label}${day ? ` · ${day}` : ""}`;
    case "CACHED":
      return meta.source === "mock"
        ? "Sample close · not a live quote"
        : `End-of-day close · ${label} · cached`;
    case "LAST_KNOWN":
      return `Last known close · ${label}${day ? ` · ${day}` : ""} · provider unavailable`;
    case "MOCK":
      return "Sample close · not a live quote";
    default:
      return "Price unavailable";
  }
}

/** Short marker for a section fed by a different source than the headline. */
export function describeSection(meta: Provenance | null, subject: string): string {
  if (!meta) return `${subject} unavailable`;
  if (meta.status === "MOCK" || meta.source === "mock") return `${subject} · sample data`;
  if (meta.status === "LAST_KNOWN") return `${subject} · last known, provider unavailable`;
  return `${subject} · ${providerLabel(meta.source)}`;
}

/** True when the figure is genuinely from an external market-data provider. */
export function isRealMarketData(meta: Provenance | null): boolean {
  if (!meta) return false;
  if (meta.source === "mock" || meta.status === "MOCK") return false;
  return meta.status !== "UNAVAILABLE";
}
