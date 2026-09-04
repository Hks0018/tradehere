import { ArrowRight, ShieldCheck } from "lucide-react";
import type { MarketIndex, Stock } from "@/types";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { HeroVisual } from "./HeroVisual";

interface HeroProps {
  index: MarketIndex;
  watchlist: Stock[];
  breadth: { advancers: number; decliners: number };
}

export function Hero({ index, watchlist, breadth }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32">
      <div aria-hidden className="th-dot-bg pointer-events-none absolute inset-0 opacity-45" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[-15%] size-[36rem] rounded-full bg-brand-100/60 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] top-24 size-[30rem] rounded-full bg-up-50 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-pill border border-ink-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-600 shadow-soft backdrop-blur">
                  <ShieldCheck className="size-3.5 text-brand-600" aria-hidden />
                  Market intelligence, made understandable
                </span>
                <DemoBadge />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.032em] text-ink-900 text-balance-tight sm:text-[3.25rem] lg:text-[3.5rem]">
                Everything you need to understand the markets.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
                Explore markets, track opportunities, analyze investments, and build your financial
                knowledge — all from one powerful platform.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/markets" size="lg">
                  Explore Markets
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button href="#ecosystem" variant="secondary" size="lg">
                  Discover the Platform
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-100 pt-8">
                {[
                  { value: "28", label: "Companies profiled" },
                  { value: "18", label: "Fund schemes" },
                  { value: "5", label: "Working calculators" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs leading-snug text-ink-400">{stat.label}</dt>
                    <dd className="tnum font-display text-2xl font-semibold text-ink-900">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="lg:pl-4">
            <HeroVisual index={index} watchlist={watchlist} breadth={breadth} />
          </div>
        </div>
      </div>
    </section>
  );
}
