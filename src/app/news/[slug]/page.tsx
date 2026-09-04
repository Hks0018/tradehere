import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NewsCard } from "@/components/features/news/NewsFeed";
import { Badge } from "@/components/ui/Badge";
import { DemoBadge, Disclaimer } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { getArticleBySlug, getNewsSlugs, getRelatedNews } from "@/services/newsService";
import { getStockBySymbol } from "@/services/stockService";
import { DATA_REFERENCE_DATE } from "@/utils/series";
import { formatCurrency, formatPercent, formatRelative, trendClass } from "@/utils/format";
import { cn } from "@/utils/cn";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Story not found" };
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, tickers] = await Promise.all([
    getRelatedNews(slug),
    Promise.all(article.tickers.map((symbol) => getStockBySymbol(symbol))),
  ]);
  const mentioned = tickers.filter((stock) => Boolean(stock));

  return (
    <>
      <article>
        <header className="border-b border-ink-100 bg-ink-50/60 pt-26 pb-10 sm:pt-30">
          <div className="container-page max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1 text-sm text-ink-400">
                <li><Link href="/news" className="transition-colors hover:text-ink-700">News</Link></li>
                <li aria-hidden><ChevronRight className="size-3.5" /></li>
                <li>
                  <Link
                    href={`/news?category=${encodeURIComponent(article.category)}`}
                    className="transition-colors hover:text-ink-700"
                  >
                    {article.category}
                  </Link>
                </li>
              </ol>
            </nav>

            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{article.category}</Badge>
                <DemoBadge label="Sample Story" />
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink-900 text-balance-tight sm:text-4xl">
                {article.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">{article.summary}</p>
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-400">
                <span className="font-medium text-ink-600">{article.author}</span>
                <span aria-hidden>·</span>
                <span>{article.source}</span>
                <span aria-hidden>·</span>
                <time dateTime={article.publishedAt}>
                  {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
                </time>
                <span aria-hidden>·</span>
                <span>{article.readMinutes} min read</span>
              </p>
            </Reveal>
          </div>
        </header>

        <div className="py-12 sm:py-16">
          <div className="container-page max-w-3xl">
            <Reveal>
              <div className="space-y-5">
                {article.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "leading-[1.75] text-ink-700",
                      index === 0 && "text-lg leading-[1.7] text-ink-800",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {mentioned.length > 0 && (
              <Reveal delay={0.06}>
                <section className="mt-10 rounded-card border border-ink-100 bg-ink-50/60 p-5">
                  <h2 className="text-sm font-semibold text-ink-900">Companies mentioned</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {mentioned.map((stock) => (
                      <li key={stock!.symbol}>
                        <Link
                          href={`/stocks/${stock!.symbol}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-soft transition-colors hover:bg-white/70"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink-900">
                              {stock!.name}
                            </span>
                            <span className="block text-xs text-ink-400">{stock!.symbol}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="tnum block text-sm font-semibold text-ink-900">
                              {formatCurrency(stock!.price)}
                            </span>
                            <span className={cn("tnum block text-xs font-medium", trendClass(stock!.changePercent))}>
                              {formatPercent(stock!.changePercent)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            <Disclaimer className="mt-10" />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-ink-50/50 py-14">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-xl font-semibold text-ink-900">More in {article.category}</h2>
              <Link href="/news" className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700">
                All news →
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <NewsCard article={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
