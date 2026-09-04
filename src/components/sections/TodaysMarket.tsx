import Link from "next/link";
import type { MarketIndex, MarketNarrative } from "@/types";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Delta } from "@/components/ui/Delta";
import { ArrowLink } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatNumber, formatSigned } from "@/utils/format";

/**
 * The session in one sentence, then the number behind it. Typography carries
 * the hierarchy — the only rules on the page are hairlines.
 */
export function TodaysMarket({
  narrative,
  headline,
  secondary,
}: {
  narrative: MarketNarrative;
  headline: MarketIndex;
  secondary: MarketIndex[];
}) {
  return (
    <Band env="paper" className="section-y" id="todays-market">
      <div className="container-page">
        <Eyebrow index="01">Today&apos;s market</Eyebrow>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <MaskedHeading
              lines={narrative.headline}
              className="font-display text-display-2 text-ink-900 text-balance-tight"
            />

            <Reveal delay={0.2} y={14}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-600">
                {narrative.sentence}
              </p>
            </Reveal>

            <Reveal delay={0.3} y={14}>
              <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
                <ArrowLink href="/markets">Read the full market</ArrowLink>
                <p className="font-mono text-xs text-ink-400">
                  Sample session · figures are illustrative
                </p>
              </div>
            </Reveal>
          </div>

          {/* Headline index — the number is the subject */}
          <Reveal delay={0.15} y={20}>
            <div className="border-t border-ink-200 pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink-900">
                  {headline.name}
                </h3>
                <Delta value={headline.changePercent} size="sm" />
              </div>

              <p className="tnum mt-6 font-display text-data-xl font-semibold text-ink-900">
                <AnimatedNumber value={headline.value} />
              </p>
              <p className="tnum mt-2 font-mono text-sm text-ink-500">
                {formatSigned(headline.change)} today · low {formatNumber(headline.dayLow, 0)} ·
                high {formatNumber(headline.dayHigh, 0)}
              </p>

              <div className="mt-6">
                <Sparkline
                  data={headline.series}
                  trend={headline.changePercent}
                  id="today-headline"
                  width={520}
                  height={72}
                  className="w-full"
                />
              </div>

              <ul className="mt-8 border-t border-ink-200">
                {secondary.map((index) => (
                  <li key={index.id} className="border-b border-ink-200/70">
                    <Link
                      href="/markets#indices"
                      className="group/idx flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="text-sm font-medium text-ink-700 transition-colors group-hover/idx:text-brand-600">
                        {index.name}
                      </span>
                      <span className="flex items-baseline gap-4">
                        <span className="tnum font-mono text-sm text-ink-800">
                          {formatNumber(index.value)}
                        </span>
                        <Delta value={index.changePercent} size="xs" className="w-20 justify-end" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Band>
  );
}
