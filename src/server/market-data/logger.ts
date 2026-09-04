import { marketDataConfig } from "./config";

/**
 * Development logging for the data path.
 *
 * Deliberately structured and deliberately dull: provider ids, capability,
 * cache outcome and error *codes* only — never URLs, keys or upstream response
 * bodies, so logs cannot leak credentials.
 */
type LogFields = Record<string, string | number | boolean | null | undefined>;

function emit(level: "debug" | "warn", event: string, fields: LogFields): void {
  if (!marketDataConfig.debug) return;
  const parts = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
  const line = `[market-data] ${event} ${parts}`.trim();
  if (level === "warn") console.warn(line);
  else console.log(line);
}

export const marketDataLogger = {
  cacheHit(capability: string, key: string, source: string) {
    emit("debug", "cache.hit", { capability, key, source });
  },
  providerAttempt(capability: string, providerId: string) {
    emit("debug", "provider.attempt", { capability, provider: providerId });
  },
  providerSuccess(capability: string, providerId: string, status: string, failover: boolean) {
    emit("debug", "provider.success", { capability, provider: providerId, status, failover });
  },
  providerFailure(capability: string, providerId: string, code: string) {
    emit("warn", "provider.failure", { capability, provider: providerId, code });
  },
  providerSkipped(capability: string, providerId: string, reason: string) {
    emit("debug", "provider.skipped", { capability, provider: providerId, reason });
  },
  lastKnown(capability: string, key: string, source: string, ageMs: number) {
    emit("warn", "fallback.last_known", { capability, key, source, ageMs });
  },
  unavailable(capability: string, key: string, attempted: number) {
    emit("warn", "fallback.unavailable", { capability, key, attempted });
  },
};
