import type { SectorPulse, Stock } from "@/types";
import type { MoverKind } from "@/services/marketService";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MoversRanking } from "@/components/market/MoversRanking";

/**
 * The session's movement as an editorial ranking. The lead sector is stated in
 * words first; the stocks behind it come from the shared `MoversRanking`.
 */
export function WhatsMoving({
  movers,
  leadSector,
}: {
  movers: Record<MoverKind, Stock[]>;
  leadSector: SectorPulse;
}) {
  return (
    <section className="section-y bg-white" id="whats-moving">
      <div className="container-page">
        <Eyebrow index="03">What&apos;s moving</Eyebrow>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-20">
          <MaskedHeading
            lines={[leadSector.name.toUpperCase(), "leads the advance."]}
            className="font-display text-display-3 uppercase text-ink-900 text-balance-tight"
          />
          <Reveal delay={0.15} y={14}>
            <div className="flex items-end justify-between gap-6">
              <p className="max-w-md text-base leading-relaxed text-ink-600">
                {leadSector.name} contributed the largest share of the session&apos;s movement, with{" "}
                {leadSector.advancers} constituents advancing against {leadSector.decliners} that
                fell.
              </p>
              <p className="tnum shrink-0 font-display text-data-lg font-semibold text-up-600">
                +{leadSector.changePercent.toFixed(2)}%
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={18} className="mt-14">
          <MoversRanking movers={movers} />
        </Reveal>
      </div>
    </section>
  );
}
