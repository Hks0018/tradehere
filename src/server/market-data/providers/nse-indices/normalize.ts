import { MarketDataError } from "../../errors";
import type { NormalizedIndex } from "../../types";
import { NSE_ID } from "./client";

/** Minimal CSV parsing: NSE's indices close file has no embedded commas or quoted fields. */
function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new MarketDataError("NO_DATA", "Empty NSE indices report", { providerId: NSE_ID });
  }
  return {
    header: lines[0].split(",").map((cell) => cell.trim()),
    rows: lines.slice(1).map((line) => line.split(",")),
  };
}

function num(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function requireColumns(header: string[], names: string[]): Record<string, number> {
  const index: Record<string, number> = {};
  for (const name of names) index[name] = header.indexOf(name);
  const missing = names.filter((name) => index[name] === -1);
  if (missing.length > 0) {
    throw new MarketDataError(
      "VALIDATION_FAILED",
      `NSE indices report is missing expected column(s): ${missing.join(", ")}`,
      { providerId: NSE_ID },
    );
  }
  return index;
}

/** Indices close dates carry no offset; stamped +05:30 to match the rest of the platform. */
function toTimestamp(isoDate: string): string {
  return `${isoDate}T00:00:00+05:30`;
}

/**
 * The NSE indices Tradehere tracks, matched against `ind_close_all`'s
 * "Index Name" column. Keyed by the uppercased id form used throughout the
 * app (`MarketIndex.id.toUpperCase()`), so lookups need no fuzzy matching.
 *
 * Only four of Tradehere's eight indices are NSE-published: SENSEX is a BSE
 * index, and the three global benchmarks are outside NSE entirely. Those stay
 * on the sample provider — see `NseIndicesProvider`'s class comment for why
 * this is exposed one index at a time rather than as a bulk replacement.
 */
const INDEX_MATCHES: { id: string; csvName: string; name: string; shortName: string }[] = [
  { id: "NIFTY-50", csvName: "Nifty 50", name: "NIFTY 50", shortName: "NIFTY" },
  { id: "NIFTY-BANK", csvName: "Nifty Bank", name: "NIFTY BANK", shortName: "BANKNIFTY" },
  { id: "NIFTY-MIDCAP", csvName: "NIFTY Midcap 100", name: "NIFTY MIDCAP 100", shortName: "MIDCAP" },
  { id: "NIFTY-IT", csvName: "Nifty IT", name: "NIFTY IT", shortName: "NIFTY IT" },
];

export function parseIndicesClose(text: string, tradingDate: string): Map<string, NormalizedIndex> {
  const { header, rows } = parseCsv(text);
  const col = requireColumns(header, [
    "Index Name",
    "Open Index Value",
    "High Index Value",
    "Low Index Value",
    "Closing Index Value",
    "Points Change",
    "Change(%)",
  ]);

  const byName = new Map(rows.map((row) => [row[col["Index Name"]]?.trim().toLowerCase(), row]));
  const indices = new Map<string, NormalizedIndex>();

  for (const match of INDEX_MATCHES) {
    const row = byName.get(match.csvName.toLowerCase());
    if (!row) continue;

    const currentValue = num(row[col["Closing Index Value"]]);
    const change = num(row[col["Points Change"]]);
    const changePercent = num(row[col["Change(%)"]]);

    indices.set(match.id, {
      symbol: match.id,
      name: match.name,
      shortName: match.shortName,
      region: "India",
      currentValue,
      previousClose: Number((currentValue - change).toFixed(4)),
      change,
      changePercent,
      open: num(row[col["Open Index Value"]]),
      high: num(row[col["High Index Value"]]),
      low: num(row[col["Low Index Value"]]),
      timestamp: toTimestamp(tradingDate),
      source: NSE_ID,
    });
  }

  if (indices.size === 0) {
    throw new MarketDataError("NO_DATA", "Indices close file matched none of the tracked indices", {
      providerId: NSE_ID,
    });
  }

  return indices;
}
