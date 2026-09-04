import type { MarketIndex } from "@/types";
import { IndexCard } from "@/components/market/IndexCard";
import { MarketTicker } from "@/components/market/MarketTicker";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/DemoDataNote";

export function MarketSnapshot({
  snapshot,
  ticker,
}: {
  snapshot: MarketIndex[];
  ticker: MarketIndex[];
}) {
  return (
    <section className="py-20 sm:py-24" id="snapshot">
      <div className="container-page">
        <SectionHeading
          eyebrow="Market snapshot"
          title="A clear read on where the market stands"
          description="Benchmark indices, their intraday shape and the size of today's move — summarised the moment you land."
          action={<Button href="/markets" variant="secondary">Open market overview</Button>}
        />

        <div className="mt-4 flex items-center gap-3">
          <DemoBadge label="Sample Market Data" />
          <span className="text-xs text-ink-400">Figures are illustrative, not live quotes.</span>
        </div>

        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.map((index) => (
            <RevealItem key={index.id}>
              <IndexCard index={index} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="mt-12">
        <MarketTicker indices={ticker} />
      </div>
    </section>
  );
}
