import { marketDataConfig } from "./config";
import type { MarketDataProvider } from "./provider.interface";
import type { Capability, ProviderId } from "./types";

/**
 * The single place that answers "who should serve this?".
 *
 * Selection logic lives here and nowhere else, so no part of the app hardcodes
 * a provider name. Ordering comes from config; a provider that is registered
 * but absent from a capability's priority list is simply never chosen for it.
 */
export class ProviderRegistry {
  private readonly providers = new Map<ProviderId, MarketDataProvider>();

  register(provider: MarketDataProvider): this {
    this.providers.set(provider.id, provider);
    return this;
  }

  get(id: ProviderId): MarketDataProvider | undefined {
    return this.providers.get(id);
  }

  all(): MarketDataProvider[] {
    return [...this.providers.values()];
  }

  /**
   * Providers able to serve `capability`, highest priority first.
   *
   * Filters out anything that has not declared the capability, has not
   * implemented the corresponding method, or is not configured.
   */
  forCapability(capability: Capability, method: keyof MarketDataProvider): MarketDataProvider[] {
    const order = marketDataConfig.priority[capability] ?? [];

    return order
      .map((id) => this.providers.get(id))
      .filter((provider): provider is MarketDataProvider => {
        if (!provider) return false;
        if (!provider.capabilities[capability]) return false;
        if (typeof provider[method] !== "function") return false;
        return provider.isConfigured();
      });
  }

  /** Every registered provider that reports itself configured. */
  configured(): MarketDataProvider[] {
    return this.all().filter((provider) => provider.isConfigured());
  }

  clear(): void {
    this.providers.clear();
  }
}
