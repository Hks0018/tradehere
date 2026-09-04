import type { Metadata } from "next";
import { MarketTicker } from "@/components/market/MarketTicker";
import { MoversTabs } from "@/components/market/MoversTabs";
import { SectorPerformance } from "@/components/market/SectorPerformance";
import { SentimentGauge } from "@/components/market/SentimentGauge";
import { StockCard } from "@/components/market/StockCard";
import { IndicesPanel } from "@/components/features/markets/IndicesPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getAllMovers,
  getHighlights,
  getIndices,
  getMarketStatus,
  getSectors,
  getSentiment,
} from "@/services/marketService";
import { getStocks } from "@/services/stockService";
import { cn } from "@/utils/cn";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Index levels, sector performance, market breadth and the day's biggest movers — a complete sample-market overview.",
};

const TONE_STYLES = {
  positive: "border-up-100 bg-up-50",
  negative: "border-down-100 bg-down-50",
  neutral: "border-ink-100 bg-ink-50",
} as const;

export default async function MarketsPage() {
  const [indices, movers, sectors, sentiment, highlights, trending, status] = await Promise.all([
    getIndices(),
    getAllMovers(8),
    getSectors(),
    getSentiment(),
    getHighlights(),
    getStocks({ category: "trending", limit: 8 }),
    getMarketStatus(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Markets"
        title="The whole market, at a glance"
        description="Benchmark and global indices, sector rotation, market breadth and the day's largest moves — organised into a single overview."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="outline" className="bg-white">
            <span aria-hidden className="size-1.5 rounded-full bg-ink-400" />
            {status.label}
          </Badge>
          <Badge tone="brand">{sentiment.label}</Badge>
        </div>
      </PageHeader>

      <MarketTicker indices={indices} />

      <section id="indices" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Indices"
            title="Market indices"
            description="Indian benchmarks alongside a selection of global markets, each with its intraday shape."
          />
          <Reveal className="mt-8">
            <IndicesPanel indices={indices} />
          </Reveal>
        </div>
      </section>

      <section id="movers" className="scroll-mt-24 border-y border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Market movers"
            title="Gainers, losers and the most traded"
            description="The names driving the session, ranked by move size and by traded volume."
          />
          <Reveal className="mt-8">
            <MoversTabs movers={movers} />
          </Reveal>
        </div>
      </section>

      <section id="sectors" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Market overview"
            title="Sector performance and breadth"
            description="Where money rotated during the sample session, and how broad participation was across the market."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Reveal>
              <div className="h-full rounded-card border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink-900">Sector performance</h3>
                  <span className="text-xs text-ink-400">{sectors.length} sectors</span>
                </div>
                <SectorPerformance sectors={sectors} />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-card border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink-900">Market sentiment</h3>
                  <span className="text-xs text-ink-400">{sentiment.updatedLabel}</span>
                </div>
                <SentimentGauge sentiment={sentiment} />
              </div>
            </Reveal>
          </div>

          <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((highlight) => (
              <RevealItem key={highlight.id} className="h-full">
                <article className={cn("h-full rounded-card border p-5", TONE_STYLES[highlight.tone])}>
                  <h3 className="text-sm font-semibold text-ink-900">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{highlight.detail}</p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Trending"
            title="Trending stocks"
            description="Names drawing the most attention in the sample session."
            action={<Button href="/stocks" variant="secondary">Open stock screener</Button>}
          />
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((stock) => (
              <RevealItem key={stock.symbol} className="h-full">
                <StockCard stock={stock} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>

          <Disclaimer className="mt-10 bg-white" />
        </div>
      </section>
    </>
  );
}
