import type { MarketPulseData } from "@/types";
import { Band } from "@/components/ui/Band";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MarketPulse } from "@/components/market/MarketPulse";

export function MarketPulseSection({ pulse }: { pulse: MarketPulseData }) {
  return (
    <Band env="void" grid className="section-y" id="market-pulse">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[160px]"
      />
      <div className="container-page">
        <SectionIntro
          index="02"
          eyebrow="Market pulse"
          lines={["The market,", "as one picture."]}
          standfirst="Every sector, placed by how it performed and how hard it moved, orbiting the session's overall mood. Hover or tab through a sector to read it."
          action={<ArrowLink href="/markets#pulse" onVoid>Open the full market</ArrowLink>}
          onVoid
          size="display-2"
        />

        <Reveal delay={0.1} y={28} className="mt-20">
          <MarketPulse pulse={pulse} />
        </Reveal>

        <p className="mt-16 border-t border-paper-200/12 pt-6 font-mono text-xs text-paper-300/45">
          Position shows rank and momentum · size shows share of market capitalisation · sample
          session data
        </p>
      </div>
    </Band>
  );
}
