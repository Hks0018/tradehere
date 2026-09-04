import type { Metadata } from "next";
import { MarketTicker } from "@/components/market/MarketTicker";
import { MarketPulse } from "@/components/market/MarketPulse";
import { MarketFlow } from "@/components/market/MarketFlow";
import { MoversRanking } from "@/components/market/MoversRanking";
import { IndexBoard } from "@/components/market/IndexBoard";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { ArrowLink } from "@/components/ui/Button";
import {
  getAllMovers,
  getHighlights,
  getIndices,
  getMarketFlow,
  getMarketNarrative,
  getMarketPulse,
  getMarketStatus,
} from "@/services/marketService";
import { cn } from "@/utils/cn";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "The session read as a story: overall mood, sector rotation, index levels, the day's movement and what it means.",
};

const TONE_MARK = {
  positive: { glyph: "↑", label: "Supporting", className: "text-up-600" },
  negative: { glyph: "↓", label: "Weighing", className: "text-down-600" },
  neutral: { glyph: "→", label: "Watching", className: "text-ink-500" },
} as const;

export default async function MarketsPage() {
  const [indices, pulse, narrative, movers, flow, highlights, status] = await Promise.all([
    getIndices(),
    getMarketPulse(),
    getMarketNarrative(),
    getAllMovers(8),
    getMarketFlow(),
    getHighlights(),
    getMarketStatus(),
  ]);

  return (
    <>
      <PageHeader
        env="void"
        eyebrow="Markets"
        title={["The market,", "at a glance."]}
        description="Not a wall of widgets. The session read in order — how it feels, where it rotated, what led, and why it matters."
      >
        <p className="eyebrow text-paper-300/55">{status.label}</p>
        <p className="eyebrow text-brand-300">Today · {narrative.mood}</p>
      </PageHeader>

      {/* 01 — the mood, stated */}
      <Band env="void" className="pb-4">
        <div className="container-page">
          <div className="grid gap-10 border-t border-paper-200/12 pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
            <MaskedHeading
              lines={narrative.headline}
              className="font-display text-display-2 text-paper-50 text-balance-tight"
            />
            <Reveal delay={0.18} y={14}>
              <p className="text-lg leading-relaxed text-paper-200/70">{narrative.sentence}</p>
            </Reveal>
          </div>
        </div>
      </Band>

      {/* 02 — Market Pulse */}
      <Band env="void" grid className="section-y" id="pulse">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[160px]"
        />
        <div className="container-page">
          <SectionIntro
            index="01"
            eyebrow="Market pulse"
            lines={["Every sector,", "in one picture."]}
            standfirst="Position shows rank and momentum, size shows share of market capitalisation. Hover or tab a sector to read it."
            onVoid
          />
          <Reveal delay={0.1} y={26} className="mt-20">
            <MarketPulse pulse={pulse} />
          </Reveal>
        </div>
      </Band>

      <MarketTicker indices={indices} />

      {/* 03 — Indices */}
      <section className="section-y bg-white" id="indices">
        <div className="container-page">
          <SectionIntro
            index="02"
            eyebrow="Indices"
            lines={["Where the", "benchmarks closed."]}
            standfirst="Indian benchmarks first, then the global markets that set the overnight tone."
          />
          <div className="mt-16">
            <IndexBoard indices={indices} />
          </div>
        </div>
      </section>

      {/* 04 — Movers */}
      <Band env="paper" className="section-y" id="movers">
        <div className="container-page">
          <SectionIntro
            index="03"
            eyebrow="Market movers"
            lines={["What moved,", "and by how much."]}
            standfirst="Ranked by the size of the move and by traded volume, with the session's leader given its due."
          />
          <Reveal delay={0.1} y={18} className="mt-14">
            <MoversRanking movers={movers} />
          </Reveal>
        </div>
      </Band>

      {/* 05 — Rotation */}
      <Band env="void" className="section-y" id="sectors">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[10%] top-1/4 -z-10 size-[34rem] rounded-full bg-up-500/8 blur-[150px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] bottom-0 -z-10 size-[30rem] rounded-full bg-down-500/8 blur-[150px]"
        />
        <div className="container-page">
          <SectionIntro
            index="04"
            eyebrow="Sector rotation"
            lines={["Where the money", "is rotating."]}
            standfirst="Momentum rarely sits still. These are the sectors gaining and losing the session's attention."
            onVoid
          />
          <div className="mt-20">
            <MarketFlow chains={flow} />
          </div>
        </div>
      </Band>

      {/* 06 — Insights */}
      <section className="section-y bg-white" id="insights">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow index="05">Market insights</Eyebrow>
              <MaskedHeading
                lines={["What it", "means."]}
                className="mt-8 font-display text-display-2 text-ink-900"
              />
              <Reveal delay={0.18} y={14}>
                <p className="mt-8 max-w-sm text-lg leading-relaxed text-ink-600">
                  The readings above, translated into the handful of things actually worth carrying
                  into tomorrow.
                </p>
                <div className="mt-8">
                  <ArrowLink href="/news">Read market news</ArrowLink>
                </div>
              </Reveal>
            </div>

            <ul>
              {highlights.map((highlight, index) => (
                <Reveal key={highlight.id} delay={index * 0.07} y={16} className="block">
                  <li className="border-t border-ink-200 py-8 first:border-t-2 first:border-ink-900">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <p
                        className={cn(
                          "eyebrow flex items-center gap-2",
                          TONE_MARK[highlight.tone].className,
                        )}
                      >
                        <span aria-hidden>{TONE_MARK[highlight.tone].glyph}</span>
                        {TONE_MARK[highlight.tone].label}
                      </p>
                      <p className="tnum font-mono text-[0.6875rem] text-ink-300">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                    </div>
                    <h3 className="mt-4 font-display text-headline font-semibold text-ink-900">
                      {highlight.title}
                    </h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-600">{highlight.detail}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <Disclaimer className="mt-20" />
        </div>
      </section>
    </>
  );
}
