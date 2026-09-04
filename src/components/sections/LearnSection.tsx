import Link from "next/link";
import type { LearnItem, LearningPath } from "@/types";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";

/**
 * Editorial education block: one lesson given real weight, the rest as an
 * index, and the structured paths as a short sidebar.
 */
export function LearnSection({
  featured,
  items,
  paths,
}: {
  featured: LearnItem;
  items: LearnItem[];
  paths: LearningPath[];
}) {
  return (
    <Band env="paper" className="section-y" id="learn">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow index="07">Learn the market</Eyebrow>
            <MaskedHeading
              lines={["Learn before", "you invest."]}
              className="mt-8 font-display text-display-2 text-ink-900 text-balance-tight"
            />
          </div>
          <Reveal delay={0.12} y={14}>
            <ArrowLink href="/learn">Open the learning hub</ArrowLink>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          {/* Featured lesson */}
          <Reveal y={22}>
            <Link href={`/learn/${featured.slug}`} className="group/feat block">
              <div
                className="relative flex aspect-[16/10] items-end overflow-hidden rounded-card p-8"
                style={{
                  background: `linear-gradient(150deg, ${featured.accent}26, ${featured.accent}05)`,
                }}
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-56 rounded-full opacity-30 blur-3xl transition-transform duration-700 group-hover/feat:scale-125"
                  style={{ background: featured.accent }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 14px)",
                    color: featured.accent,
                  }}
                />
                <p className="relative font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-600">
                  {featured.level} · {featured.minutes} min {featured.format.toLowerCase()}
                </p>
              </div>

              <h3 className="mt-7 max-w-xl font-display text-display-3 font-semibold text-ink-900 transition-colors group-hover/feat:text-brand-600">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-600">
                {featured.excerpt}
              </p>
            </Link>
          </Reveal>

          <div>
            <ul>
              {items.map((item, index) => (
                <Reveal key={item.id} delay={0.06 * index} y={14} className="block">
                  <li className="border-t border-ink-200 first:border-t-2 first:border-ink-900">
                    <Link href={`/learn/${item.slug}`} className="group/item block py-6">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-400">
                          {item.topic}
                        </p>
                        <p className="tnum font-mono text-[0.6875rem] text-ink-400">
                          {item.minutes} min
                        </p>
                      </div>
                      <h3 className="mt-2.5 font-display text-headline font-semibold text-ink-900 transition-colors group-hover/item:text-brand-600">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                        {item.excerpt}
                      </p>
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2} y={14}>
              <div className="mt-10 border-t border-ink-200 pt-8">
                <p className="eyebrow text-ink-400">Learning paths</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-3">
                  {paths.map((path) => (
                    <li key={path.id}>
                      <Link
                        href={`/learn/${path.itemSlugs[0]}`}
                        className="inline-flex items-center gap-2 rounded-pill border border-ink-300 px-4 py-2 text-sm text-ink-700 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-paper-50"
                      >
                        {path.title}
                        <span aria-hidden className="text-xs">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Band>
  );
}
