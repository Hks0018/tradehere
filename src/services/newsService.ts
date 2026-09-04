import { NEWS } from "@/data/news";
import type { NewsArticle, NewsCategory } from "@/types";

export interface NewsQuery {
  category?: NewsCategory | "All";
  search?: string;
  limit?: number;
}

function byRecency(a: NewsArticle, b: NewsArticle) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export async function getNews(query: NewsQuery = {}): Promise<NewsArticle[]> {
  const { category = "All", search = "", limit } = query;
  let results = [...NEWS];
  const term = search.trim().toLowerCase();

  if (category !== "All") results = results.filter((n) => n.category === category);
  if (term) {
    results = results.filter(
      (n) => n.title.toLowerCase().includes(term) || n.summary.toLowerCase().includes(term),
    );
  }

  results.sort(byRecency);
  return limit ? results.slice(0, limit) : results;
}

export async function getFeaturedArticle(): Promise<NewsArticle> {
  return [...NEWS].filter((n) => n.featured).sort(byRecency)[0] ?? NEWS[0];
}

export async function getTrendingNews(limit = 5): Promise<NewsArticle[]> {
  return [...NEWS].filter((n) => n.trending).sort(byRecency).slice(0, limit);
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  return NEWS.find((n) => n.slug === slug);
}

export async function getRelatedNews(slug: string, limit = 3): Promise<NewsArticle[]> {
  const article = await getArticleBySlug(slug);
  if (!article) return [];
  return NEWS.filter((n) => n.category === article.category && n.slug !== slug)
    .sort(byRecency)
    .slice(0, limit);
}

export async function getNewsSlugs(): Promise<string[]> {
  return NEWS.map((n) => n.slug);
}

export async function getNewsByTicker(symbol: string, limit = 4): Promise<NewsArticle[]> {
  return NEWS.filter((n) => n.tickers.includes(symbol)).sort(byRecency).slice(0, limit);
}
