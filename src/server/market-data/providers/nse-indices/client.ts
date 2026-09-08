import { MarketDataError } from "../../errors";
import { nseDate } from "./dates";

export const NSE_ID = "nse";

/**
 * NSE's interactive site and `/api/*` endpoints sit behind Akamai bot
 * detection that refuses a plain server-side request outright — verified
 * directly: even a GET of the homepage returns HTTP 403 with no cookies ever
 * issued. The archive host serving published reports (the daily indices
 * close file) is a separate, unprotected static file server, so that is the
 * surface this provider reads from. A conventional browser User-Agent is
 * sent out of caution, but no cookie handshake is needed or attempted.
 */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface NseClientConfig {
  archiveBaseUrl: string;
  timeoutMs: number;
  /** How many calendar days to walk back looking for the last published session. */
  lookbackDays: number;
}

async function fetchArchiveFile(url: string, timeoutMs: number): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/csv,*/*" },
    });

    // Not published for this date — a normal, expected outcome on weekends,
    // holidays, and for "today" before the session has closed.
    if (response.status === 404) return null;

    if (!response.ok) {
      throw new MarketDataError("PROVIDER_UNAVAILABLE", `Upstream responded ${response.status}`, {
        providerId: NSE_ID,
      });
    }

    return await response.text();
  } catch (error) {
    if (error instanceof MarketDataError) throw error;
    const aborted = error instanceof Error && error.name === "AbortError";
    throw new MarketDataError(
      aborted ? "PROVIDER_UNAVAILABLE" : "NETWORK_ERROR",
      aborted ? "Upstream request timed out" : "Upstream request failed",
      { providerId: NSE_ID, cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Walks backward from today (IST calendar date) for the most recently
 * published file. A miss on any given day is not itself a fault — NSE
 * publishes on trading days only, after the session closes.
 */
export async function fetchIndicesClose(
  config: NseClientConfig,
  now: () => number,
): Promise<{ tradingDate: string; text: string }> {
  let lastError: MarketDataError | undefined;

  for (let daysAgo = 0; daysAgo < config.lookbackDays; daysAgo += 1) {
    const date = nseDate(now(), daysAgo);
    try {
      const url = `${config.archiveBaseUrl}/content/indices/ind_close_all_${date.ddmmyyyy}.csv`;
      const text = await fetchArchiveFile(url, config.timeoutMs);
      if (text) return { tradingDate: date.iso, text };
    } catch (error) {
      lastError = error instanceof MarketDataError ? error : undefined;
    }
  }

  throw (
    lastError ??
    new MarketDataError("NO_DATA", `No NSE indices report published in the last ${config.lookbackDays} days`, {
      providerId: NSE_ID,
    })
  );
}
