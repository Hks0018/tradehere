import Link from "next/link";
import type { MarketIndex, MarketNarrative } from "@/types";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Delta } from "@/components/ui/Delta";
import { formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";
import { HeroBackdrop } from "./HeroBackdrop";

/**
 * Opening statement. Near-full-height, dark, and type-led — the market strip
 * along the bottom is the only chrome, and it doubles as proof that the page is
 * a market product rather than a brochure.
 */
export function Hero({
  indices,
  narrative,
}: {
  indices: MarketIndex[];
  narrative: MarketNarrative;
}) {
  const strip = indices.slice(0, 4);

  return (
    <section
      data-hero-dark
      className="on-void relative isolate flex min-h-[calc(100svh-1px)] flex-col overflow-hidden bg-void-950 text-paper-100"
    >
      <HeroBackdrop series={indices.slice(0, 5).map((i) => i.series)} />

      <div className="container-page relative flex flex-1 flex-col justify-center pt-32 pb-12 sm:pt-36">
        <Reveal y={10}>
          <p className="eyebrow flex items-center gap-3 text-paper-300/60">
            <span className="relative flex size-1.5">
              <span className="th-pulse-ring absolute inline-flex size-full rounded-full bg-up-400" />
              <span className="relative inline-flex size-1.5 rounded-full bg-up-400" />
            </span>
            Sample session · {narrative.mood}
          </p>
        </Reveal>

        <MaskedHeading
          as="h1"
          lines={["See the market", "differently."]}
          className="mt-8 font-display text-display-1 text-paper-50"
          delay={0.15}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <Reveal delay={0.5} y={16}>
            <p className="max-w-xl text-lg leading-relaxed text-paper-200/70 sm:text-xl">
              Sparkk turns market movement into understanding — what is moving, why it matters,
              and where to look next.
            </p>
          </Reveal>

          <Reveal delay={0.62} y={16}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:justify-end">
              <Link
                href="/markets"
                className="group/hero inline-flex items-center gap-3 rounded-pill bg-paper-50 px-8 py-4 text-[0.9375rem] font-medium text-void-950 transition-colors duration-300 hover:bg-brand-400"
              >
                Enter the market
                <span aria-hidden className="transition-transform duration-300 group-hover/hero:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="group/how relative inline-flex items-center gap-2 pb-1.5 text-[0.9375rem] font-medium text-paper-100"
              >
                How it works
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-paper-200/30" />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-paper-50 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/how:scale-x-100"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Market strip */}
      <Reveal delay={0.8} y={12} className="relative">
        <div className="border-t border-paper-200/12">
          <div className="container-page">
            <ul className="grid grid-cols-2 sm:grid-cols-4">
              {strip.map((index, i) => (
                <li
                  key={index.id}
                  className={cn(
                    "flex min-w-0 flex-col gap-1.5 py-4 sm:gap-2 sm:py-6",
                    // Hairlines between cells, without a trailing edge on either axis.
                    i % 2 === 1 && "border-l border-paper-200/10 pl-4 sm:pl-6",
                    i % 2 === 0 && i > 0 && "sm:border-l sm:border-paper-200/10 sm:pl-6",
                    i < 2 ? "" : "border-t border-paper-200/10 sm:border-t-0",
                    i === 2 && "sm:border-l sm:border-paper-200/10 sm:pl-6",
                  )}
                >
                  <span className="eyebrow truncate text-paper-300/45">{index.shortName}</span>
                  <span className="tnum truncate font-mono text-sm text-paper-50 sm:text-base">
                    {formatNumber(index.value)}
                  </span>
                  <Delta value={index.changePercent} size="xs" onVoid />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
