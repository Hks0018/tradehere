import { MarketDataError } from "../../errors";
import type { DailyCallBudget } from "../../budget";

export const ALPHA_VANTAGE_ID = "alphavantage";

export interface AlphaVantageClientConfig {
  apiKey: string | undefined;
  baseUrl: string;
  timeoutMs: number;
  budget: DailyCallBudget;
}

/** Alpha Vantage answers with HTTP 200 even when refusing; the body decides. */
type AlphaVantageBody = Record<string, unknown>;

/**
 * Alpha Vantage's own rate-limit advisory quotes the caller's API key back in
 * plain text ("We have detected your API key as ..."). No upstream text is ever
 * put into an error message or a log line for that reason; this helper exists
 * so that if any ever is, the credential is stripped first.
 */
export function redactKey(text: string, apiKey: string | undefined): string {
  if (!apiKey) return text;
  return text.split(apiKey).join("[redacted]");
}

/**
 * HTTP transport for Alpha Vantage.
 *
 * Two responsibilities beyond fetching. First, the key: it is attached here and
 * only here, is never logged, and never appears in an error message — thrown
 * errors carry a code and a short description, never the request URL.
 *
 * Second, refusals. Alpha Vantage signals rate limits, premium gating and bad
 * symbols with HTTP 200 and an explanatory string, so a naive client would
 * treat "you are out of quota" as valid data. Every response is inspected
 * before it is handed on.
 */
export class AlphaVantageClient {
  constructor(private readonly config: AlphaVantageClientConfig) {}

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  /**
   * Performs one call, spending a unit of the daily budget.
   *
   * `reserve` keeps a few calls back for interactive requests, so bulk work
   * cannot consume the entire day's allowance.
   */
  async request(params: Record<string, string>, reserve = 0): Promise<AlphaVantageBody> {
    if (!this.config.apiKey) {
      throw new MarketDataError("PROVIDER_NOT_CONFIGURED", "Alpha Vantage key is not set", {
        providerId: ALPHA_VANTAGE_ID,
        affectsHealth: false,
      });
    }

    if (!this.config.budget.canSpend(reserve)) {
      // Stop locally rather than spending a round trip to be refused.
      throw new MarketDataError("RATE_LIMITED", "Daily call budget exhausted", {
        providerId: ALPHA_VANTAGE_ID,
      });
    }

    const url = new URL(this.config.baseUrl);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    url.searchParams.set("apikey", this.config.apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    let body: AlphaVantageBody;
    try {
      this.config.budget.spend();
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (response.status === 429) {
        this.config.budget.markExhausted();
        throw new MarketDataError("RATE_LIMITED", "Upstream rate limit reached", {
          providerId: ALPHA_VANTAGE_ID,
        });
      }
      if (!response.ok) {
        throw new MarketDataError("PROVIDER_UNAVAILABLE", `Upstream responded ${response.status}`, {
          providerId: ALPHA_VANTAGE_ID,
        });
      }

      body = (await response.json()) as AlphaVantageBody;
    } catch (error) {
      if (error instanceof MarketDataError) throw error;
      const aborted = error instanceof Error && error.name === "AbortError";
      // Deliberately does not include the URL, which carries the key.
      throw new MarketDataError(
        aborted ? "PROVIDER_UNAVAILABLE" : "NETWORK_ERROR",
        aborted ? "Upstream request timed out" : "Upstream request failed",
        { providerId: ALPHA_VANTAGE_ID, cause: undefined },
      );
    } finally {
      clearTimeout(timeout);
    }

    this.assertUsable(body);
    return body;
  }

  /**
   * Classifies a 200 response that is actually a refusal.
   *
   * Getting this wrong is expensive in both directions: treating a rate-limit
   * notice as data would show an error string as a price, and treating a
   * premium notice as an outage would open the circuit and lose the endpoints
   * that do work.
   */
  private assertUsable(body: AlphaVantageBody): void {
    const note = typeof body.Note === "string" ? body.Note : undefined;
    const info = typeof body.Information === "string" ? body.Information : undefined;
    const errorMessage = typeof body["Error Message"] === "string" ? body["Error Message"] : undefined;
    const text = `${note ?? ""} ${info ?? ""}`.toLowerCase();

    // Rate limiting is tested BEFORE premium gating, and the order matters.
    // The real quota message reads "our standard API rate limit is 25 requests
    // per day. Please subscribe to any of the premium plans...", so matching
    // "premium" first would file a temporary quota exhaustion as a permanent
    // capability gap — caching it as unsupported and reporting the provider
    // healthy while it served nothing.
    if (
      text.includes("rate limit") ||
      text.includes("call frequency") ||
      text.includes("requests per day") ||
      text.includes("higher api call volume")
    ) {
      this.config.budget.markExhausted();
      throw new MarketDataError("RATE_LIMITED", "Upstream call limit reached", {
        providerId: ALPHA_VANTAGE_ID,
      });
    }

    if (text.includes("premium")) {
      // A capability this plan does not include. Permanent, and not a fault.
      throw new MarketDataError("PREMIUM_REQUIRED", "Endpoint requires a premium plan", {
        providerId: ALPHA_VANTAGE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }

    if (errorMessage) {
      // Alpha Vantage uses this for malformed calls and unknown symbols alike.
      throw new MarketDataError("NO_DATA", "Upstream rejected the request", {
        providerId: ALPHA_VANTAGE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }

    if (info) {
      // Any other advisory: unusable, but not an outage.
      throw new MarketDataError("NO_DATA", "Upstream returned no usable data", {
        providerId: ALPHA_VANTAGE_ID,
        retryable: true,
        affectsHealth: false,
      });
    }
  }

  budgetSnapshot() {
    return this.config.budget.snapshot();
  }
}
