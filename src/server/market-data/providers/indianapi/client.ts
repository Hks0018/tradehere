import { MarketDataError } from "../../errors";

export const INDIANAPI_ID = "indianapi";

export interface IndianApiClientConfig {
  apiKey: string | undefined;
  baseUrl: string;
  timeoutMs: number;
}

export type IndianApiBody = Record<string, unknown> | unknown[];

/**
 * HTTP transport for IndianAPI (indianapi.in).
 *
 * Auth is a plain `x-api-key` header — no query-string key, so it never ends
 * up in a logged URL. Unlike Alpha Vantage, an unknown instrument comes back
 * as HTTP 200 with `{"error": "..."}` rather than a 404, so every response
 * body is inspected before being handed on, the same discipline applied to
 * Alpha Vantage's own 200-that-means-refusal responses.
 */
export class IndianApiClient {
  constructor(private readonly config: IndianApiClientConfig) {}

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async request(path: string, params: Record<string, string> = {}): Promise<IndianApiBody> {
    if (!this.config.apiKey) {
      throw new MarketDataError("PROVIDER_NOT_CONFIGURED", "IndianAPI key is not set", {
        providerId: INDIANAPI_ID,
        affectsHealth: false,
      });
    }

    const url = new URL(path.replace(/^\//, ""), `${this.config.baseUrl.replace(/\/$/, "")}/`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    let body: IndianApiBody;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json", "x-api-key": this.config.apiKey },
      });

      if (response.status === 429) {
        throw new MarketDataError("RATE_LIMITED", "Upstream rate limit reached", {
          providerId: INDIANAPI_ID,
        });
      }
      if (!response.ok) {
        // Covers a rejected key (401) too — a broken credential is a fault,
        // not a coverage gap, so it counts against health like any outage.
        throw new MarketDataError("PROVIDER_UNAVAILABLE", `Upstream responded ${response.status}`, {
          providerId: INDIANAPI_ID,
        });
      }

      body = (await response.json()) as IndianApiBody;
    } catch (error) {
      if (error instanceof MarketDataError) throw error;
      const aborted = error instanceof Error && error.name === "AbortError";
      // Deliberately does not include the URL or headers, which carry the key.
      throw new MarketDataError(
        aborted ? "PROVIDER_UNAVAILABLE" : "NETWORK_ERROR",
        aborted ? "Upstream request timed out" : "Upstream request failed",
        { providerId: INDIANAPI_ID, cause: undefined },
      );
    } finally {
      clearTimeout(timeout);
    }

    this.assertUsable(body);
    return body;
  }

  /**
   * Verified by real request: an unrecognised company name answers with HTTP
   * 200 and `{"error": "Stock not found"}`. Left unfiltered, that string would
   * be cached and rendered as if it were a quote.
   */
  private assertUsable(body: IndianApiBody): void {
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).error === "string"
    ) {
      throw new MarketDataError("NO_DATA", "Upstream reported no data for this request", {
        providerId: INDIANAPI_ID,
        retryable: true,
        affectsHealth: false,
      });
    }
  }
}
