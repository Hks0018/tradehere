import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-ink-900 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="th-grid-bg pointer-events-none absolute inset-0 opacity-60" />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[100px]"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-white text-balance-tight sm:text-[2.75rem]">
                Make smarter financial decisions.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-300 sm:text-lg">
                Understand the market, compare products on the same terms, and build the knowledge
                to decide for yourself.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/markets" variant="onDark" size="lg">
                  Explore Markets
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button href="/learn" variant="onDarkGhost" size="lg">
                  Start Learning
                </Button>
              </div>
              <p className="mt-8 text-xs leading-relaxed text-ink-500">
                Market data shown for informational purposes. Investments are subject to market risks.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
