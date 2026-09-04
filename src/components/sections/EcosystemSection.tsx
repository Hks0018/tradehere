import Link from "next/link";
import type { EcosystemProduct } from "@/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

/**
 * Asymmetric ecosystem layout. Stocks takes a full column at display scale;
 * everything else is a stacked hairline list. Deliberately not a 3×2 card grid.
 */
export function EcosystemSection({ products }: { products: EcosystemProduct[] }) {
  const [feature, ...others] = products;

  return (
    <section className="section-y bg-white" id="ecosystem">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow index="06">The ecosystem</Eyebrow>
            <MaskedHeading
              lines={["One place for every", "financial decision."]}
              className="mt-8 font-display text-display-2 text-ink-900 text-balance-tight"
            />
          </div>
          <Reveal delay={0.15} y={14}>
            <p className="max-w-sm text-base leading-relaxed text-ink-600 lg:pb-3">
              Every product shares one data model and one way of being presented, so moving between
              them takes no relearning.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
          {/* Feature panel */}
          {feature && (
            <Reveal y={24}>
              <Link
                href={feature.href}
                className="group/feature relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-card bg-void-950 p-8 text-paper-100 sm:p-10"
              >
                <div aria-hidden className="th-grid-void absolute inset-0" />
                <div
                  aria-hidden
                  className="absolute -right-24 -top-24 size-80 rounded-full blur-[90px] transition-transform duration-700 group-hover/feature:scale-125"
                  style={{ background: `${feature.accent}40` }}
                />

                <div className="relative flex items-start justify-between">
                  <span className="eyebrow text-paper-300/50">Explore</span>
                  <span
                    aria-hidden
                    className="text-xl transition-transform duration-400 group-hover/feature:-translate-y-0.5 group-hover/feature:translate-x-0.5"
                  >
                    ↗
                  </span>
                </div>

                <div className="relative">
                  <h3 className="font-display text-display-2 font-semibold leading-none tracking-[-0.04em] text-paper-50">
                    {feature.name}
                  </h3>
                  <p className="mt-6 max-w-sm text-base leading-relaxed text-paper-200/70">
                    {feature.description}
                  </p>
                  <p className="mt-8 flex items-baseline gap-3 border-t border-paper-200/15 pt-6">
                    <span className="tnum font-display text-3xl font-semibold text-paper-50">
                      {feature.stat}
                    </span>
                    <span className="font-mono text-xs text-paper-300/55">{feature.statLabel}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Stacked list */}
          <ul className="flex flex-col">
            {others.map((product, index) => (
              <Reveal key={product.id} delay={0.06 * index} y={16} className="block">
                <li className="border-t border-ink-200 last:border-b">
                  <Link
                    href={product.href}
                    className="group/item grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 py-6"
                  >
                    <span
                      className="flex size-10 items-center justify-center rounded-card transition-transform duration-300 group-hover/item:scale-105"
                      style={{ background: `${product.accent}14`, color: product.accent }}
                    >
                      <Icon name={product.icon} className="size-[1.125rem]" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-display text-xl font-semibold tracking-[-0.025em] text-ink-900 transition-colors group-hover/item:text-brand-600">
                          {product.name}
                        </span>
                        <span className="tnum font-mono text-[0.6875rem] text-ink-400">
                          {product.stat} {product.statLabel}
                        </span>
                      </span>
                      <span className="mt-1 block max-w-md text-sm leading-relaxed text-ink-500">
                        {product.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "text-ink-300 transition-all duration-300",
                        "group-hover/item:translate-x-1 group-hover/item:text-brand-600",
                      )}
                    >
                      →
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
