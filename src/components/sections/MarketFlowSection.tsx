import type { FlowChain } from "@/types";
import { Band } from "@/components/ui/Band";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { MarketFlow } from "@/components/market/MarketFlow";

export function MarketFlowSection({ chains }: { chains: FlowChain[] }) {
  return (
    <Band env="void" className="section-y" id="market-flow">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] top-1/3 -z-10 size-[36rem] rounded-full bg-up-500/8 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] bottom-0 -z-10 size-[32rem] rounded-full bg-down-500/8 blur-[150px]"
      />
      <div className="container-page">
        <SectionIntro
          index="04"
          eyebrow="Market flow"
          lines={["Where the money", "is rotating."]}
          standfirst="Momentum rarely sits still. These are the sectors gaining and losing the session's attention, in order."
          onVoid
          size="display-2"
        />

        <div className="mt-20">
          <MarketFlow chains={chains} />
        </div>
      </div>
    </Band>
  );
}
