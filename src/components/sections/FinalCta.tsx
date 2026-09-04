import Link from "next/link";
import { Band } from "@/components/ui/Band";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <Band env="void" grid className="section-y">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-brand-600/18 blur-[150px]"
      />
      <div className="container-page">
        <MaskedHeading
          lines={["The market,", "explained."]}
          className="font-display text-display-1 text-paper-50"
        />

        <div className="mt-14 grid gap-10 border-t border-paper-200/12 pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Reveal delay={0.2} y={14}>
            <p className="max-w-xl text-lg leading-relaxed text-paper-200/70">
              Understand what is moving, compare products on the same terms, and build the knowledge
              to decide for yourself.
            </p>
          </Reveal>

          <Reveal delay={0.3} y={14}>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/markets"
                className="group/cta inline-flex items-center gap-3 rounded-pill bg-paper-50 px-8 py-4 text-[0.9375rem] font-medium text-void-950 transition-colors duration-300 hover:bg-brand-400"
              >
                Explore markets
                <span aria-hidden className="transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center rounded-pill border border-paper-200/25 px-8 py-4 text-[0.9375rem] font-medium text-paper-100 transition-colors duration-300 hover:border-paper-100 hover:bg-paper-50 hover:text-void-950"
              >
                Start learning
              </Link>
            </div>
          </Reveal>
        </div>

        <p className="mt-12 font-mono text-xs leading-relaxed text-paper-300/45">
          Market data shown for informational purposes. Investments are subject to market risks.
        </p>
      </div>
    </Band>
  );
}
