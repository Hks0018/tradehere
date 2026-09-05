import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StockChartPanel } from "@/components/features/stocks/StockChartPanel";
import { StockTabs } from "@/components/features/stocks/StockTabs";
import { StockCard } from "@/components/market/StockCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Band } from "@/components/ui/Band";
import { Delta } from "@/components/ui/Delta";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { ArrowLink } from "@/components/ui/Button";
import { getNewsByTicker } from "@/services/stockNewsService";
import {
  getRelatedStocks,
  getStockBySymbol,
  getStockStory,
  getStockWithProvenance,
} from "@/services/stockService";
import { describeQuote, describeSection, isRealMarketData } from "@/utils/provenance";
import { formatCompactCurrency, formatCurrency, formatSigned } from "@/utils/format";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

/**
 * Rendered per request rather than prerendered.
 *
 * This page carries real market data, and static generation would do two bad
 * things: freeze a price into HTML at build time, and spend the day's metered
 * API allowance building twenty-eight pages at once. The engine's cache does
 * the work instead, so repeat views cost nothing while the data stays current.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const stock = await getStockBySymbol(symbol);
  if (!stock) return { title: "Stock not found" };
  return {
    title: `${stock.name} (${stock.symbol})`,
    description: `Price, fundamentals, financials and coverage for ${stock.name}.`,
  };
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const resolved = await getStockWithProvenance(symbol);
  if (!resolved) notFound();

  const { stock, quoteMeta, profileMeta, historyMeta } = resolved;

  const [related, news, story] = await Promise.all([
    getRelatedStocks(stock.symbol),
    getNewsByTicker(stock.symbol),
    getStockStory(stock.symbol),
  ]);

  return (
    <>
      {/* The company, at scale */}
      <Band as="header" env="void" grid marksNavDark className="pt-32 pb-14 sm:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[8%] -top-1/2 -z-10 size-[34rem] rounded-full bg-brand-600/15 blur-[140px]"
        />
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="eyebrow flex flex-wrap items-center gap-2 text-paper-300/50">
              <li>
                <Link href="/stocks" className="transition-colors hover:text-paper-50">
                  Stocks
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>{stock.sector}</li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-paper-100">
                {stock.symbol}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <MaskedHeading
                as="h1"
                lines={[stock.name]}
                className="font-display text-display-2 text-paper-50 text-balance-tight"
              />
              <Reveal delay={0.18} y={12}>
                <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-paper-300/55">
                  <span>{stock.symbol} · {stock.exchange}</span>
                  <span aria-hidden>—</span>
                  <span>{stock.industry}</span>
                  <span aria-hidden>—</span>
                  <span>{stock.capBucket}</span>
                  {isRealMarketData(quoteMeta) && (
                    <>
                      <span aria-hidden>—</span>
                      <span className="text-up-400">Real market data</span>
                    </>
                  )}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.24} y={16}>
              <div className="border-t border-paper-200/15 pt-6 lg:text-right">
                <p className="tnum font-display text-data-xl font-semibold text-paper-50">
                  <AnimatedNumber value={stock.price} prefix="₹" />
                </p>
                <p className="mt-3 flex flex-wrap items-baseline gap-4 lg:justify-end">
                  <span className="tnum font-mono text-sm text-paper-200/70">
                    {formatSigned(stock.change)}
                  </span>
                  <Delta value={stock.changePercent} size="lg" onVoid />
                </p>
                <p className="eyebrow mt-4 text-paper-300/45">{describeQuote(quoteMeta)}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Band>

      {/* The chart is the workspace */}
      <section className="section-y-sm bg-white">
        <div className="container-page">
          <Reveal y={18}>
            <StockChartPanel
              stock={stock}
              initialSeries={stock.series}
              initialSource={historyMeta?.source ?? null}
              initialStatus={historyMeta?.status ?? "UNAVAILABLE"}
            />
          </Reveal>
        </div>
      </section>

      {/* The story today */}
      {story && (
        <Band env="paper" className="section-y-sm">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
              <div>
                <Eyebrow>The story today</Eyebrow>
                <MaskedHeading
                  lines={story.verdict.split(" the ").length > 1
                    ? [story.verdict.split(" the ")[0], `the ${story.verdict.split(" the ")[1]}`]
                    : [story.verdict]}
                  className="mt-6 font-display text-display-3 text-ink-900 text-balance-tight"
                />
              </div>
              <Reveal delay={0.15} y={14}>
                <div className="space-y-5 border-t border-ink-900 pt-6">
                  {story.paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-lg leading-relaxed text-ink-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Band>
      )}

      {/* Key numbers */}
      <section className="section-y-sm bg-white">
        <div className="container-page">
          <Eyebrow>{describeSection(profileMeta, "Key numbers")}</Eyebrow>
          <Reveal delay={0.1} y={16}>
            <StatGrid columns={4} className="mt-8 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Market cap" value={formatCompactCurrency(stock.marketCap)} />
              <Stat label="P/E ratio" value={stock.pe.toFixed(2)} />
              <Stat label="EPS" value={formatCurrency(stock.eps)} />
              <Stat label="52-week high" value={formatCurrency(stock.high52)} />
              <Stat label="52-week low" value={formatCurrency(stock.low52)} />
            </StatGrid>
          </Reveal>

          <Reveal delay={0.16} y={16} className="mt-20">
            <StockTabs stock={stock} news={news} />
          </Reveal>

          <p className="mt-10 font-mono text-[0.6875rem] text-ink-400">
            {describeSection(historyMeta, "Price history")}
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <Band env="paper" className="section-y-sm">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Same sector</Eyebrow>
                <h2 className="mt-5 font-display text-display-3 font-semibold text-ink-900">
                  Other {stock.sector.toLowerCase()} companies
                </h2>
              </div>
              <ArrowLink href="/stocks">All stocks</ArrowLink>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((peer) => (
                <StockCard key={peer.symbol} stock={peer} />
              ))}
            </div>

            <Disclaimer className="mt-16" />
          </div>
        </Band>
      )}
    </>
  );
}
