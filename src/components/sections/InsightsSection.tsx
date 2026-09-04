import type { Stock } from "@/types";
import type { MoverKind } from "@/services/marketService";
import { MoversTabs } from "@/components/market/MoversTabs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function InsightsSection({ movers }: { movers: Record<MoverKind, Stock[]> }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Featured market insights"
          title="What is moving, and by how much"
          description="Trending names, the day's largest advances and declines, and the most heavily traded counters — in one panel."
          action={<Button href="/stocks" variant="secondary">Browse all stocks</Button>}
        />
        <Reveal className="mt-10">
          <MoversTabs movers={movers} />
        </Reveal>
      </div>
    </section>
  );
}
