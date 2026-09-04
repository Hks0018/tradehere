import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { NewsFeed } from "@/components/features/news/NewsFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Badge } from "@/components/ui/Badge";
import { getFeaturedArticle, getNews, getTrendingNews } from "@/services/newsService";
import type { NewsCategory } from "@/types";
import { DATA_REFERENCE_DATE } from "@/utils/series";
import { formatRelative } from "@/utils/format";

export const metadata: Metadata = {
  title: "Market News",
  description:
    "Sample market, stock, economy, business and personal finance coverage, structured so a live news feed can be connected later.",
};

const CATEGORIES: NewsCategory[] = ["Markets", "Stocks", "Economy", "Business", "Personal Finance"];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const requested = params.category as NewsCategory | undefined;
  const category: NewsCategory | "All" =
    requested && CATEGORIES.includes(requested) ? requested : "All";

  const [featured, trending, articles] = await Promise.all([
    getFeaturedArticle(),
    getTrendingNews(5),
    getNews({ category }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Market news"
        title="What happened, and why it matters"
        description="Coverage across markets, companies, the economy and personal finance — written to be understood, not decoded."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            <Reveal>
              <Link
                href={`/news/${featured.slug}`}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-card bg-ink-900 p-7 sm:p-9"
              >
                <div aria-hidden className="th-grid-bg absolute inset-0 opacity-50" />
                <div
                  aria-hidden
                  className="absolute -right-24 -top-24 size-72 rounded-full opacity-30 blur-3xl"
                  style={{ background: featured.accent }}
                />
                <div className="relative">
                  <Badge tone="dark">Featured · {featured.category}</Badge>
                  <h2 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    {featured.summary}
                  </p>
                  <p className="mt-6 flex items-center gap-2 text-xs text-ink-400">
                    <span>{featured.author}</span>
                    <span aria-hidden>·</span>
                    <span>{formatRelative(featured.publishedAt, DATA_REFERENCE_DATE)}</span>
                    <span aria-hidden>·</span>
                    <span>{featured.readMinutes} min read</span>
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white">
                    Read the story
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-card border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
                  <Flame className="size-4 text-down-500" aria-hidden />
                  Trending stories
                </h2>
                <ol className="mt-4 space-y-1">
                  {trending.map((article, index) => (
                    <li key={article.id}>
                      <Link
                        href={`/news/${article.slug}`}
                        className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink-50"
                      >
                        <span className="tnum text-sm font-semibold text-ink-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-snug text-ink-900 group-hover:text-brand-700">
                            {article.title}
                          </span>
                          <span className="mt-1 block text-xs text-ink-400">
                            {article.category} · {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-12">
            <h2 className="sr-only">Latest news</h2>
            <NewsFeed initialArticles={articles} initialCategory={category} />
          </Reveal>

          <Disclaimer
            className="mt-10"
            text="All stories on this page are sample editorial content written for this demonstration. They do not report real events and are not investment advice."
          />
        </div>
      </section>
    </>
  );
}
