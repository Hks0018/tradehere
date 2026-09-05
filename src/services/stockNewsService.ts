import "server-only";

import { NEWS } from "@/data/news";
import { marketData } from "@/server/market-data";
import type { MarketNewsItem } from "@/server/market-data";
import type { NewsArticle } from "@/types";

/**
 * Company coverage for the stock detail page.
 *
 * Server-only, because it reaches the market-data engine. It lives apart from
 * `newsService` for exactly that reason: that module is imported by a client
 * component and must stay free of server dependencies.
 */

/** Provider sentiment -> the accent colour the existing card already uses. */
const SENTIMENT_ACCENT: Record<string, string> = {
  Bullish: "#0fa968",
  "Somewhat-Bullish": "#12a5a5",
  Neutral: "#5b54ec",
  "Somewhat-Bearish": "#d9a441",
  Bearish: "#e14b4b",
};

function toArticle(item: MarketNewsItem, symbol: string): NewsArticle {
  return {
    id: item.id,
    // External items open at the publisher; this slug is never routed to.
    slug: "",
    title: item.title,
    summary: item.summary,
    body: [item.summary],
    category: "Stocks",
    source: item.source,
    author: item.source,
    publishedAt: item.publishedAt,
    readMinutes: Math.max(1, Math.round(item.summary.split(/\s+/).length / 200)),
    featured: false,
    trending: false,
    tickers: item.tickers.length ? item.tickers : [symbol],
    accent: SENTIMENT_ACCENT[item.sentiment ?? "Neutral"] ?? "#5b54ec",
    url: item.url,
  };
}

function sampleFor(symbol: string, limit: number): NewsArticle[] {
  return NEWS.filter((article) => article.tickers.includes(symbol))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

/**
 * Real provider coverage where the provider covers the symbol, otherwise the
 * sample editorial set. The two are distinguishable downstream: provider items
 * carry an external `url` and the card says so.
 */
export async function getNewsByTicker(symbol: string, limit = 4): Promise<NewsArticle[]> {
  try {
    const live = await marketData.getMarketNews(symbol, limit);
    if (live.data.length > 0) return live.data.map((item) => toArticle(item, symbol));
  } catch {
    // No coverage, no quota, or the provider is unavailable — use the sample set.
  }

  return sampleFor(symbol, limit);
}
