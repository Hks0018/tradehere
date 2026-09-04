import Link from "next/link";
import type { CalculatorMeta } from "@/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * The toolkit as a rack of instruments: five vertical columns divided by
 * hairlines, each one a working calculator rather than a marketing tile.
 */
export function ToolsSection({ calculators }: { calculators: CalculatorMeta[] }) {
  return (
    <section className="section-y bg-white" id="tools">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow index="08">Financial tools</Eyebrow>
            <MaskedHeading
              lines={["Your financial", "toolkit."]}
              className="mt-8 font-display text-display-2 text-ink-900 text-balance-tight"
            />
          </div>
          <Reveal delay={0.12} y={14}>
            <div className="max-w-sm lg:pb-3">
              <p className="text-base leading-relaxed text-ink-600">
                Five working instruments. Change any input and the projection, the chart and the
                year-by-year breakdown recalculate immediately.
              </p>
              <div className="mt-6">
                <ArrowLink href="/tools">See all tools</ArrowLink>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-ink-900 sm:grid-cols-2 lg:grid-cols-5">
          {calculators.map((calculator, index) => (
            <Reveal key={calculator.id} delay={index * 0.06} y={18} className="block h-full">
              <Link
                href={`/tools/${calculator.slug}`}
                className="group/tool flex h-full flex-col justify-between gap-10 border-b border-ink-200 py-8 sm:min-h-[19rem] lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="tnum font-mono text-[0.6875rem] text-ink-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="transition-transform duration-300 group-hover/tool:scale-110"
                      style={{ color: calculator.accent }}
                    >
                      <Icon name={calculator.icon} className="size-[1.125rem]" />
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink-900 transition-colors group-hover/tool:text-brand-600">
                    {calculator.name.replace(" Calculator", "")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{calculator.tagline}</p>
                </div>

                <span className="flex items-center justify-between">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-400">
                    Calculator
                  </span>
                  <span
                    aria-hidden
                    className="text-ink-300 transition-all duration-300 group-hover/tool:translate-x-1 group-hover/tool:text-brand-600"
                  >
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
