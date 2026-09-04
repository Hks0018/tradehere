"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { EcosystemProduct } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/utils/cn";

/**
 * Product grid. The hovered card lifts and reveals a soft accent wash driven by
 * each product's own colour token.
 */
export function EcosystemSection({ products }: { products: EcosystemProduct[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <section id="ecosystem" className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <div aria-hidden className="th-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
      />

      <div className="container-page relative">
        <SectionHeading
          onDark
          align="center"
          eyebrow="The ecosystem"
          title="One place for every financial decision."
          description="Stocks, funds, offerings and instruments — presented consistently, so moving between them takes no relearning."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href={product.href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06]",
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                  style={{ background: product.accent }}
                />

                <span
                  className="relative flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `${product.accent}22`, color: product.accent }}
                >
                  <Icon name={product.icon} className="size-5" />
                </span>

                <h3 className="relative mt-5 font-display text-lg font-semibold text-white">
                  {product.name}
                </h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-ink-400">
                  {product.description}
                </p>

                <div className="relative mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="tnum text-xl font-semibold text-white">{product.stat}</p>
                    <p className="text-xs text-ink-500">{product.statLabel}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors group-hover:text-white">
                    Explore
                    <ArrowRight
                      className={cn(
                        "size-4 transition-transform duration-300",
                        hovered === product.id && "translate-x-0.5",
                      )}
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
