import { IPOS } from "@/data/ipos";
import { LEARN_ITEMS } from "@/data/learn";
import { MUTUAL_FUNDS } from "@/data/mutualFunds";
import { NEWS } from "@/data/news";
import { STOCKS } from "@/data/stocks";
import { CALCULATORS } from "@/data/tools";
import type { SearchResult } from "@/types";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/utils/format";

/**
 * Builds the searchable index once at module load. Phase 2 replaces the body of
 * `search()` with a call to a real search endpoint; `SearchResult` stays put.
 */
function buildIndex(): SearchResult[] {
  const stocks: SearchResult[] = STOCKS.map((s) => ({
    id: `stock-${s.symbol}`,
    type: "stock",
    title: s.name,
    subtitle: `${s.symbol} · ${s.sector}`,
    href: `/stocks/${s.symbol}`,
    meta: formatCurrency(s.price),
    trend: s.changePercent,
  }));

  const funds: SearchResult[] = MUTUAL_FUNDS.map((f) => ({
    id: `fund-${f.id}`,
    type: "fund",
    title: f.name,
    subtitle: `${f.category} · ${f.subCategory}`,
    href: `/mutual-funds?fund=${f.id}`,
    meta: `${formatPercent(f.returns.y3)} · 3Y`,
    trend: f.returns.y3,
  }));

  const ipos: SearchResult[] = IPOS.map((i) => ({
    id: `ipo-${i.id}`,
    type: "ipo",
    title: i.company,
    subtitle: `${i.sector} · ${i.status}`,
    href: `/ipo?ipo=${i.id}`,
    meta: `₹${i.priceBand.min}–${i.priceBand.max}`,
  }));

  const articles: SearchResult[] = NEWS.map((n) => ({
    id: `news-${n.id}`,
    type: "article",
    title: n.title,
    subtitle: `${n.category} · ${n.readMinutes} min read`,
    href: `/news/${n.slug}`,
  }));

  const learn: SearchResult[] = LEARN_ITEMS.map((l) => ({
    id: `learn-${l.id}`,
    type: "learn",
    title: l.title,
    subtitle: `${l.level} · ${l.topic}`,
    href: `/learn/${l.slug}`,
    meta: `${l.minutes} min`,
  }));

  const tools: SearchResult[] = CALCULATORS.map((c) => ({
    id: `tool-${c.id}`,
    type: "tool",
    title: c.name,
    subtitle: c.tagline,
    href: `/tools/${c.slug}`,
  }));

  return [...stocks, ...funds, ...ipos, ...articles, ...learn, ...tools];
}

const INDEX = buildIndex();

/** Cheap relevance score: prefix match > word-start match > substring. */
function score(result: SearchResult, term: string): number {
  const title = result.title.toLowerCase();
  const subtitle = result.subtitle.toLowerCase();
  if (title.startsWith(term)) return 100;
  if (title.split(/\s+/).some((word) => word.startsWith(term))) return 70;
  if (title.includes(term)) return 50;
  if (subtitle.includes(term)) return 25;
  return 0;
}

export async function search(query: string, limit = 12): Promise<SearchResult[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return INDEX.map((result) => ({ result, s: score(result, term) }))
    .filter((entry) => entry.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((entry) => entry.result);
}

/** Shown when the search modal opens with an empty query. */
export async function getSearchSuggestions(): Promise<SearchResult[]> {
  const popular = STOCKS.filter((s) => s.tags.includes("popular")).slice(0, 4);
  return [
    ...popular.map<SearchResult>((s) => ({
      id: `stock-${s.symbol}`,
      type: "stock",
      title: s.name,
      subtitle: `${s.symbol} · ${formatCompactCurrency(s.marketCap)}`,
      href: `/stocks/${s.symbol}`,
      meta: formatCurrency(s.price),
      trend: s.changePercent,
    })),
    { id: "tool-sip", type: "tool", title: "SIP Calculator", subtitle: "Project a monthly investment plan", href: "/tools/sip" },
    { id: "nav-ipo", type: "ipo", title: "IPO Centre", subtitle: "Upcoming, open and recently listed", href: "/ipo" },
  ];
}
