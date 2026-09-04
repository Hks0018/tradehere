import type { Metadata } from "next";
import Link from "next/link";
import { NewsFeed } from "@/components/features/news/NewsFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
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
        title={["What happened,", "and why it matters."]}
        description="Coverage across markets, companies, the economy and personal finance — written to be understood, not decoded."
      />

      {/* Lead story */}
      <Band env="void" grid className="section-y-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[8%] top-0 -z-10 size-[32rem] rounded-full opacity-25 blur-[130px]"
          style={{ background: featured.accent }}
        />
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
            <Reveal y={20}>
              <Link href={`/news/${featured.slug}`} className="group/lead block">
                <p className="eyebrow flex items-center gap-3 text-brand-300">
                  Lead story
                  <span aria-hidden className="h-px w-8 bg-paper-200/25" />
                  <span className="text-paper-300/60">{featured.category}</span>
                </p>
                <h2 className="mt-7 max-w-3xl font-display text-display-2 font-semibold leading-[0.98] tracking-[-0.038em] text-paper-50 transition-colors group-hover/lead:text-brand-300">
                  {featured.title}
                </h2>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper-200/70">
                  {featured.summary}
                </p>
                <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-paper-300/50">
                  <span>{featured.author}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={featured.publishedAt}>
                    {formatRelative(featured.publishedAt, DATA_REFERENCE_DATE)}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{featured.readMinutes} min read</span>
                </p>
              </Link>
            </Reveal>

            <Reveal delay={0.12} y={18}>
              <div>
                <Eyebrow onVoid>Trending</Eyebrow>
                <ol className="mt-6 border-t border-paper-200/15">
                  {trending.map((article, index) => (
                    <li key={article.id} className="border-b border-paper-200/10">
                      <Link
                        href={`/news/${article.slug}`}
                        className="group/t flex gap-5 py-4"
                      >
                        <span className="tnum font-mono text-xs text-paper-300/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.9375rem] font-medium leading-snug text-paper-100 transition-colors group-hover/t:text-brand-300">
                            {article.title}
                          </span>
                          <span className="mt-1.5 block font-mono text-[0.6875rem] text-paper-300/45">
                            {article.category} ·{" "}
                            {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </Band>

      <section className="section-y bg-white">
        <div className="container-page">
          <Eyebrow>Latest</Eyebrow>
          <h2 className="sr-only">Latest news</h2>
          <Reveal delay={0.08} y={16} className="mt-8">
            <NewsFeed initialArticles={articles} initialCategory={category} />
          </Reveal>

          <Disclaimer
            className="mt-16"
            text="All stories on this site are sample editorial content written for this demonstration. They do not report real events and are not investment advice."
          />
        </div>
      </section>
    </>
  );
}
