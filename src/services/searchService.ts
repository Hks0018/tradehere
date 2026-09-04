import "server-only";

import { IPOS } from "@/data/ipos";
import { LEARN_ITEMS } from "@/data/learn";
import { MUTUAL_FUNDS } from "@/data/mutualFunds";
import { NEWS } from "@/data/news";
import { CALCULATORS } from "@/data/tools";
import { marketData } from "@/server/market-data";
import type { SearchResult } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/format";

/**
 * Global search.
 *
 * Instruments come from the market-data engine, so a live provider's universe
 * becomes searchable the moment one is configured. Everything else — funds,
 * offerings, stories, lessons, tools — is Tradehere's own content and is
 * matched locally.
 *
 * Server-only: this runs behind `/api/search` so no dataset and no provider
 * detail is shipped to the browser.
 */

/** Content entries are static, so the non-market index is built once. */
function buildContentIndex(): SearchResult[] {
  const funds: SearchResult[] = MUTUAL_FUNDS.map((fund) => ({
    id: `fund-${fund.id}`,
    type: "fund",
    title: fund.name,
    subtitle: `${fund.category} · ${fund.subCategory}`,
    href: `/mutual-funds?fund=${fund.id}`,
    meta: `${formatPercent(fund.returns.y3)} · 3Y`,
    trend: fund.returns.y3,
  }));

  const ipos: SearchResult[] = IPOS.map((ipo) => ({
    id: `ipo-${ipo.id}`,
    type: "ipo",
    title: ipo.company,
    subtitle: `${ipo.sector} · ${ipo.status}`,
    href: `/ipo?ipo=${ipo.id}`,
    meta: `₹${ipo.priceBand.min}–${ipo.priceBand.max}`,
  }));

  const articles: SearchResult[] = NEWS.map((article) => ({
    id: `news-${article.id}`,
    type: "article",
    title: article.title,
    subtitle: `${article.category} · ${article.readMinutes} min read`,
    href: `/news/${article.slug}`,
  }));

  const learn: SearchResult[] = LEARN_ITEMS.map((item) => ({
    id: `learn-${item.id}`,
    type: "learn",
    title: item.title,
    subtitle: `${item.level} · ${item.topic}`,
    href: `/learn/${item.slug}`,
    meta: `${item.minutes} min`,
  }));

  const tools: SearchResult[] = CALCULATORS.map((calculator) => ({
    id: `tool-${calculator.id}`,
    type: "tool",
    title: calculator.name,
    subtitle: calculator.tagline,
    href: `/tools/${calculator.slug}`,
  }));

  return [...funds, ...ipos, ...articles, ...learn, ...tools];
}

const CONTENT_INDEX = buildContentIndex();

/** Cheap relevance score: prefix match beats word-start beats substring. */
function score(result: SearchResult, term: string): number {
  const title = result.title.toLowerCase();
  const subtitle = result.subtitle.toLowerCase();
  if (title.startsWith(term)) return 100;
  if (title.split(/\s+/).some((word) => word.startsWith(term))) return 70;
  if (title.includes(term)) return 50;
  if (subtitle.includes(term)) return 25;
  return 0;
}

async function instrumentResults(term: string, limit: number): Promise<SearchResult[]> {
  try {
    const found = await marketData.searchInstruments(term, limit);
    if (found.data.length === 0) return [];

    // One batched quote call decorates the matches with a price and a move.
    const quotes = await marketData.getQuotes(found.data.map((instrument) => instrument.symbol));
    const bySymbol = new Map(quotes.data.map((quote) => [quote.symbol, quote]));

    return found.data.map<SearchResult>((instrument) => {
      const quote = bySymbol.get(instrument.symbol);
      return {
        id: `stock-${instrument.symbol}`,
        type: "stock",
        title: instrument.name,
        subtitle: `${instrument.symbol} · ${instrument.sector ?? instrument.exchange}`,
        href: `/stocks/${instrument.symbol}`,
        meta: quote ? formatCurrency(quote.currentPrice) : undefined,
        trend: quote?.changePercent,
      };
    });
  } catch {
    // Search stays useful for content even when market data is down.
    return [];
  }
}

export async function search(query: string, limit = 12): Promise<SearchResult[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const instruments = await instrumentResults(term, limit);

  const content = CONTENT_INDEX.map((result) => ({ result, s: score(result, term) }))
    .filter((entry) => entry.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((entry) => entry.result);

  // Instruments lead: a symbol search should not be buried under articles.
  return [...instruments, ...content].slice(0, limit);
}

/** Shown when the search dialog opens with an empty query. */
export async function getSearchSuggestions(): Promise<SearchResult[]> {
  try {
    const instruments = await marketData.listInstruments();
    const symbols = instruments.data.slice(0, 4).map((instrument) => instrument.symbol);
    const quotes = await marketData.getQuotes(symbols);

    const popular = quotes.data.map<SearchResult>((quote) => ({
      id: `stock-${quote.symbol}`,
      type: "stock",
      title: quote.name,
      subtitle: `${quote.symbol} · ${quote.exchange}`,
      href: `/stocks/${quote.symbol}`,
      meta: formatCurrency(quote.currentPrice),
      trend: quote.changePercent,
    }));

    return [...popular, ...FALLBACK_SUGGESTIONS];
  } catch {
    return FALLBACK_SUGGESTIONS;
  }
}

const FALLBACK_SUGGESTIONS: SearchResult[] = [
  {
    id: "tool-sip",
    type: "tool",
    title: "SIP Calculator",
    subtitle: "Project a monthly investment plan",
    href: "/tools/sip",
  },
  {
    id: "nav-ipo",
    type: "ipo",
    title: "IPO Centre",
    subtitle: "Upcoming, open and recently listed",
    href: "/ipo",
  },
];
