import { RestMarketDataProvider } from "./rest-provider.base";

/**
 * Primary live vendor.
 *
 * Inert until `MARKET_PROVIDER_PRIMARY_ENABLED`, `..._BASE_URL` and
 * `..._API_KEY` are all set, at which point the registry places it ahead of
 * the sample provider for every capability it declares. No code change is
 * needed to promote it.
 *
 * Capabilities are deliberately narrow: quote vendors typically sell prices and
 * candles, not sector breadth or fundamentals. Anything it does not claim keeps
 * routing to a provider that does.
 */
export class PrimaryMarketDataProvider extends RestMarketDataProvider {
  constructor() {
    super({
      id: "primary",
      label: "Primary Market Data Vendor",
      capabilities: {
        quotes: true,
        historical: true,
        indices: true,
        search: true,
        sectors: false,
        breadth: false,
        fundamentals: false,
        websocket: false,
        news: false,
      },
      enabled: process.env.MARKET_PROVIDER_PRIMARY_ENABLED === "true",
      baseUrl: process.env.MARKET_PROVIDER_PRIMARY_BASE_URL,
      apiKey: process.env.MARKET_PROVIDER_PRIMARY_API_KEY,
      timeoutMs: Number.parseInt(process.env.MARKET_PROVIDER_PRIMARY_TIMEOUT_MS ?? "4000", 10),
      dataStatus: "LIVE",
    });
  }
}
