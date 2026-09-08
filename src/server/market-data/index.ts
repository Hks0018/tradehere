import "server-only";

import { MarketDataOrchestrator } from "./market-data-orchestrator";
import { ProviderRegistry } from "./provider.registry";
import { AlphaVantageMarketDataProvider } from "./providers/alpha-vantage";
import { IndianApiMarketDataProvider } from "./providers/indianapi";
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
    .register(new AlphaVantageMarketDataProvider())
    .register(new IndianApiMarketDataProvider())
    .register(new PrimaryMarketDataProvider())
    .register(new SecondaryMarketDataProvider())
    .register(new MockMarketDataProvider());

  return new MarketDataOrchestrator({ registry });
}

/**
 * Exactly one instance per server process.
 *
 * Parked on `globalThis` in every environment, not just development. Route
 * handlers and pages are separate bundles, so without this each would build its
 * own orchestrator — and therefore its own cache, its own daily budget and its
 * own circuit breakers. On a metered provider that quietly multiplies real API
 * usage by the number of bundles, and makes the health endpoint report a
 * different process's counters than the one serving pages.
 *
 * It also survives Next's module re-evaluation on hot reload, so cached data
 * and breaker state are not reset by every edit.
 */
const globalForMarketData = globalThis as unknown as {
  __tradehereMarketData?: MarketDataOrchestrator;
};

export const marketData: MarketDataOrchestrator = (globalForMarketData.__tradehereMarketData ??=
  createOrchestrator());

export { MarketDataOrchestrator } from "./market-data-orchestrator";
export { ProviderRegistry } from "./provider.registry";
export { MarketDataError, isMarketDataError } from "./errors";
export { AlphaVantageMarketDataProvider } from "./providers/alpha-vantage";
export { IndianApiMarketDataProvider } from "./providers/indianapi";
export type { MarketDataErrorCode } from "./errors";
export * from "./types";
