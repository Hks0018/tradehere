import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { StockChartPanel } from "@/components/features/stocks/StockChartPanel";
import { StockTabs } from "@/components/features/stocks/StockTabs";
import { StockCard } from "@/components/market/StockCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Badge, ChangeBadge } from "@/components/ui/Badge";
import { DemoBadge, Disclaimer } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { getNewsByTicker } from "@/services/newsService";
import { getRelatedStocks, getStockBySymbol, getStockSymbols } from "@/services/stockService";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency, formatSigned, trendClass } from "@/utils/format";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateStaticParams() {
  const symbols = await getStockSymbols();
  return symbols.map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const stock = await getStockBySymbol(symbol);
  if (!stock) return { title: "Stock not found" };
  return {
    title: `${stock.name} (${stock.symbol})`,
    description: `Sample price, fundamentals, financials and coverage for ${stock.name}. Demonstration data only.`,
  };
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const stock = await getStockBySymbol(symbol);
  if (!stock) notFound();

  const [related, news] = await Promise.all([
    getRelatedStocks(stock.symbol),
    getNewsByTicker(stock.symbol),
  ]);

  return (
    <>
      <header className="border-b border-ink-100 bg-ink-50/60 pt-26 pb-8 sm:pt-30">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-400">
              <li><Link href="/stocks" className="transition-colors hover:text-ink-700">Stocks</Link></li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li><Link href={`/stocks?category=all`} className="transition-colors hover:text-ink-700">{stock.sector}</Link></li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li aria-current="page" className="font-medium text-ink-700">{stock.symbol}</li>
            </ol>
          </nav>

          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold tracking-tight text-ink-600 shadow-soft">
                  {stock.symbol.slice(0, 3)}
                </span>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-3xl">
                    {stock.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="outline" className="bg-white">{stock.symbol} · {stock.exchange}</Badge>
                    <Badge tone="neutral">{stock.sector}</Badge>
                    <Badge tone="neutral">{stock.capBucket}</Badge>
                    <DemoBadge />
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="tnum font-display text-3xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-4xl">
                  <AnimatedNumber value={stock.price} prefix="₹" />
                </p>
                <div className="mt-2 flex items-center gap-2 sm:justify-end">
                  <span className={cn("tnum text-sm font-medium", trendClass(stock.change))}>
                    {formatSigned(stock.change)}
                  </span>
                  <ChangeBadge value={stock.changePercent} />
                </div>
                <p className="mt-1.5 text-xs text-ink-400">Sample close · not a live quote</p>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <section className="py-10 sm:py-12">
        <div className="container-page space-y-4">
          <Reveal>
            <StockChartPanel stock={stock} />
          </Reveal>

          <Reveal delay={0.06}>
            <div className="rounded-card border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="mb-5 text-base font-semibold text-ink-900">Key metrics</h2>
              <StatGrid columns={4} className="sm:grid-cols-3 lg:grid-cols-5">
                <Stat label="Market Cap" value={formatCompactCurrency(stock.marketCap)} />
                <Stat label="P/E Ratio" value={stock.pe.toFixed(2)} />
                <Stat label="EPS" value={formatCurrency(stock.eps)} />
                <Stat label="52W High" value={formatCurrency(stock.high52)} />
                <Stat label="52W Low" value={formatCurrency(stock.low52)} />
              </StatGrid>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <StockTabs stock={stock} news={news} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-ink-50/50 py-14">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Other {stock.sector} companies
                </h2>
                <p className="mt-1 text-sm text-ink-500">Peers from the same sector in the sample universe.</p>
              </div>
              <Link href="/stocks" className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700">
                View all →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((peer) => (
                <StockCard key={peer.symbol} stock={peer} className="h-full" />
              ))}
            </div>
            <Disclaimer className="mt-10 bg-white" />
          </div>
        </section>
      )}
    </>
  );
}
