import type { ProviderId } from "./types";

/**
 * Error taxonomy. The UI reacts to `code`; `publicMessage` is the only text
 * ever shown to a user, so upstream messages, URLs and keys cannot leak.
 */
export type MarketDataErrorCode =
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "INVALID_SYMBOL"
  | "NO_DATA"
  | "VALIDATION_FAILED"
  | "CAPABILITY_UNSUPPORTED"
  | "PREMIUM_REQUIRED"
  | "ALL_PROVIDERS_FAILED";

const PUBLIC_MESSAGES: Record<MarketDataErrorCode, string> = {
  PROVIDER_UNAVAILABLE: "This market data source is temporarily unavailable.",
  PROVIDER_NOT_CONFIGURED: "This market data source is not configured.",
  RATE_LIMITED: "Market data is rate limited right now. Please try again shortly.",
  NETWORK_ERROR: "Could not reach the market data service.",
  INVALID_SYMBOL: "That symbol was not found.",
  NO_DATA: "No data is available for this request.",
  VALIDATION_FAILED: "The market data received did not pass validation.",
  CAPABILITY_UNSUPPORTED: "This kind of market data is not available.",
  PREMIUM_REQUIRED: "This market data is not included in the current data plan.",
  ALL_PROVIDERS_FAILED: "Market data is temporarily unavailable. Please try again shortly.",
};

/** HTTP status used when an error surfaces through an internal API route. */
const HTTP_STATUS: Record<MarketDataErrorCode, number> = {
  PROVIDER_UNAVAILABLE: 503,
  PROVIDER_NOT_CONFIGURED: 503,
  RATE_LIMITED: 429,
  NETWORK_ERROR: 502,
  INVALID_SYMBOL: 404,
  NO_DATA: 404,
  VALIDATION_FAILED: 502,
  CAPABILITY_UNSUPPORTED: 501,
  PREMIUM_REQUIRED: 501,
  ALL_PROVIDERS_FAILED: 503,
};

export class MarketDataError extends Error {
  /**
   * Structural brand.
   *
   * `instanceof` is not reliable here: the engine is reached both through its
   * barrel and by direct path, and a bundler may give those separate module
   * instances — which would make an identical class fail an identity check and
   * turn a 404 into a 500. Detection goes through `isMarketDataError` instead.
   */
  readonly isMarketDataError = true as const;

  readonly code: MarketDataErrorCode;
  readonly providerId?: ProviderId;
  /** Whether trying a different provider (or retrying later) could succeed. */
  readonly retryable: boolean;
  /**
   * Whether this counts against the provider's health and circuit breaker.
   *
   * A provider that correctly reports "I don't cover that symbol" or "that
   * endpoint needs a paid plan" is working exactly as intended. Counting those
   * as outages would open its circuit and lose the capabilities it *does*
   * serve, so they fail over without leaving a mark.
   */
  readonly affectsHealth: boolean;

  constructor(
    code: MarketDataErrorCode,
    message: string,
    options: {
      providerId?: ProviderId;
      retryable?: boolean;
      affectsHealth?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "MarketDataError";
    this.code = code;
    this.providerId = options.providerId;
    this.retryable = options.retryable ?? code !== "INVALID_SYMBOL";
    this.affectsHealth =
      options.affectsHealth ??
      // Capability gaps and coverage gaps are not faults.
      !(code === "PREMIUM_REQUIRED" || code === "CAPABILITY_UNSUPPORTED" || code === "NO_DATA");
  }

  /** Safe for a browser response body. */
  get publicMessage(): string {
    return PUBLIC_MESSAGES[this.code];
  }

  get httpStatus(): number {
    return HTTP_STATUS[this.code];
  }
}

/**
 * Structural type guard. Use this rather than `instanceof` anywhere an error
 * may have crossed a module or bundle boundary.
 */
export function isMarketDataError(value: unknown): value is MarketDataError {
  if (value instanceof MarketDataError) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { isMarketDataError?: unknown }).isMarketDataError === true &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

/**
 * Normalises anything thrown by a provider into a `MarketDataError`, preserving
 * the original code. Getting this wrong would be costly: an unrecognised
 * INVALID_SYMBOL would be treated as a retryable provider fault and pointlessly
 * fail over to every other provider.
 */
export function toMarketDataError(error: unknown, providerId?: ProviderId): MarketDataError {
  if (isMarketDataError(error)) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new MarketDataError("PROVIDER_UNAVAILABLE", message, { providerId, cause: error });
}
