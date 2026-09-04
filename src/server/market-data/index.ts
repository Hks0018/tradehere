import "server-only";

import { MarketDataOrchestrator } from "./market-data-orchestrator";
import { ProviderRegistry } from "./provider.registry";
import { MockMarketDataProvider } from "./providers/mock.provider";
import { PrimaryMarketDataProvider } from "./providers/primary.provider";
import { SecondaryMarketDataProvider } from "./providers/secondary.provider";

/**
 * Composition root for the market-data engine.
 *
 * `import "server-only"` above is the guard that makes this module — and the
 * API keys it reaches — impossible to pull into a client bundle. Any component
 * that tries fails the build rather than shipping credentials to a browser.
 *
 * Adding a vendor is two lines: register it here, and name it in the priority
 * config. Nothing else in the application refers to a provider by name.
 */
function createOrchestrator(): MarketDataOrchestrator {
  const registry = new ProviderRegistry()
    .register(new PrimaryMarketDataProvider())
    .register(new SecondaryMarketDataProvider())
    .register(new MockMarketDataProvider());

  return new MarketDataOrchestrator({ registry });
}

/**
 * One instance per server process, so the cache, circuit breakers and health
 * counters are shared across requests. In development Next re-evaluates
 * modules on hot reload, so the instance is parked on `globalThis` to keep that
 * state from resetting on every edit.
 */
const globalForMarketData = globalThis as unknown as {
  __tradehereMarketData?: MarketDataOrchestrator;
};

export const marketData: MarketDataOrchestrator =
  globalForMarketData.__tradehereMarketData ?? createOrchestrator();

if (process.env.NODE_ENV !== "production") {
  globalForMarketData.__tradehereMarketData = marketData;
}

export { MarketDataOrchestrator } from "./market-data-orchestrator";
export { ProviderRegistry } from "./provider.registry";
export { MarketDataError, isMarketDataError } from "./errors";
export type { MarketDataErrorCode } from "./errors";
export * from "./types";
