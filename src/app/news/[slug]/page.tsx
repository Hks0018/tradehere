import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/features/news/NewsFeed";
import { Band } from "@/components/ui/Band";
import { Delta } from "@/components/ui/Delta";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";
import { getArticleBySlug, getNewsSlugs, getRelatedNews } from "@/services/newsService";
import { getStockBySymbol } from "@/services/stockService";
import { DATA_REFERENCE_DATE } from "@/utils/series";
import { formatCurrency, formatRelative } from "@/utils/format";
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
        <header className="relative overflow-hidden bg-paper-100 pt-32 pb-12 sm:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[10%] -top-1/3 size-[28rem] rounded-full opacity-20 blur-[110px]"
            style={{ background: article.accent }}
          />
          <div className="container-page relative">
            <nav aria-label="Breadcrumb" className="mb-10">
              <ol className="eyebrow flex items-center gap-2 text-ink-400">
                <li>
                  <Link href="/news" className="transition-colors hover:text-ink-900">
                    News
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/news?category=${encodeURIComponent(article.category)}`}
                    className="transition-colors hover:text-ink-900"
                  >
                    {article.category}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <MaskedHeading
                as="h1"
                lines={[article.title]}
                className="font-display text-display-3 text-ink-900 text-balance-tight sm:text-display-2"
              />
              <Reveal delay={0.18} y={14}>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink-600">
                  {article.summary}
                </p>
                <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-300 pt-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">
                  <span className="text-ink-700">{article.author}</span>
                  <span aria-hidden>·</span>
                  <span>{article.source}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={article.publishedAt}>
                    {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{article.readMinutes} min read</span>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-2 text-gold-600">
                    <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
                    Sample story
                  </span>
                </p>
              </Reveal>
            </div>
          </div>
        </header>

        <div className="bg-white py-16 sm:py-20">
          <div className="container-reading">
            <Reveal y={14}>
              <div className="space-y-6">
                {article.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "leading-[1.8] text-ink-700",
                      index === 0 && "text-xl leading-[1.7] text-ink-900",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {mentioned.length > 0 && (
              <Reveal delay={0.06} y={14}>
                <section className="mt-14">
                  <Eyebrow>Companies mentioned</Eyebrow>
                  <ul className="mt-6 border-t border-ink-900">
                    {mentioned.map((stock) => (
                      <li key={stock!.symbol} className="border-b border-ink-100">
                        <Link
                          href={`/stocks/${stock!.symbol}`}
      prefetch={false}
                          className="group/m flex items-center justify-between gap-6 py-4"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink-900 transition-colors group-hover/m:text-brand-600">
                              {stock!.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-400">
                              {stock!.symbol}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-baseline gap-5">
                            <span className="tnum font-mono text-sm text-ink-900">
                              {formatCurrency(stock!.price)}
                            </span>
                            <Delta value={stock!.changePercent} size="sm" className="w-20 justify-end" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            <Disclaimer className="mt-14" />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Band env="paper" className="section-y-sm">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-display-3 font-semibold text-ink-900">
                More in {article.category.toLowerCase()}
              </h2>
              <ArrowLink href="/news">All news</ArrowLink>
            </div>
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <NewsCard article={item} />
                </li>
              ))}
            </ul>
          </div>
        </Band>
      )}
    </>
  );
}
