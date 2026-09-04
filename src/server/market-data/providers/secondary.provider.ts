import { RestMarketDataProvider } from "./rest-provider.base";

/**
 * Secondary live vendor — the failover target when the primary is unhealthy.
 *
 * Marked `DELAYED` because a backup tier is usually a cheaper, lagged feed.
 * That status travels with the data all the way to the interface, so a reader
 * is told the prices are delayed rather than being shown them as real time.
 */
export class SecondaryMarketDataProvider extends RestMarketDataProvider {
  constructor() {
    super({
      id: "secondary",
      label: "Secondary Market Data Vendor",
      capabilities: {
        quotes: true,
        historical: true,
        indices: true,
        search: false,
        sectors: false,
        breadth: false,
        fundamentals: false,
        websocket: false,
        news: false,
      },
      enabled: process.env.MARKET_PROVIDER_SECONDARY_ENABLED === "true",
      baseUrl: process.env.MARKET_PROVIDER_SECONDARY_BASE_URL,
      apiKey: process.env.MARKET_PROVIDER_SECONDARY_API_KEY,
      timeoutMs: Number.parseInt(process.env.MARKET_PROVIDER_SECONDARY_TIMEOUT_MS ?? "4000", 10),
      dataStatus: "DELAYED",
    });
  }
}
