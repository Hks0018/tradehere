import type { MarketHighlight } from "@/types";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const TONE_MARK = {
  positive: { glyph: "↑", label: "Supporting the market", className: "text-up-600" },
  negative: { glyph: "↓", label: "Weighing on the market", className: "text-down-600" },
  neutral: { glyph: "→", label: "Worth watching", className: "text-ink-500" },
} as const;

/**
 * The explanation layer — what the numbers in the sections above actually mean.
 * The lead insight is set at display scale; the rest run as a hairline list, so
 * the section reads as a page of writing rather than four matching tiles.
 */
export function UnderstandTheMove({ highlights }: { highlights: MarketHighlight[] }) {
  const [lead, ...rest] = highlights;

  return (
    <Band env="paper" className="section-y" id="how-it-works">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow index="05">Understand the move</Eyebrow>
            <MaskedHeading
              lines={["Why the market", "is moving."]}
              className="mt-8 font-display text-display-2 text-ink-900 text-balance-tight"
            />
            <Reveal delay={0.2} y={14}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-600">
                Numbers tell you what happened. These tell you why it happened, and whether it is
                the kind of move that matters.
              </p>
              <div className="mt-8">
                <ArrowLink href="/news">Read market news</ArrowLink>
              </div>
            </Reveal>
          </div>

          <div>
            {lead && (
              <Reveal y={20}>
                <article className="border-t-2 border-ink-900 pt-8">
                  <p className={cn("eyebrow flex items-center gap-2", TONE_MARK[lead.tone].className)}>
                    <span aria-hidden>{TONE_MARK[lead.tone].glyph}</span>
                    {TONE_MARK[lead.tone].label}
                  </p>
                  <h3 className="mt-5 font-display text-display-3 font-semibold uppercase leading-[1.05] tracking-[-0.03em] text-ink-900">
                    {lead.title}
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-ink-600">{lead.detail}</p>
                </article>
              </Reveal>
            )}

            <ul className="mt-4">
              {rest.map((highlight, index) => (
                <Reveal key={highlight.id} delay={0.08 * index} y={16} className="block">
                  <li className="border-t border-ink-200 py-8">
                    <p
                      className={cn(
                        "eyebrow flex items-center gap-2",
                        TONE_MARK[highlight.tone].className,
                      )}
                    >
                      <span aria-hidden>{TONE_MARK[highlight.tone].glyph}</span>
                      {TONE_MARK[highlight.tone].label}
                    </p>
                    <h3 className="mt-4 font-display text-headline font-semibold text-ink-900">
                      {highlight.title}
                    </h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-600">{highlight.detail}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Band>
  );
}
