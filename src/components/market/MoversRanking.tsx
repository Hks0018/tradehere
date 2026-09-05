"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Stock } from "@/types";
import type { MoverKind } from "@/services/marketService";
import { Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { ArrowLink } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";

const FILTERS: { value: MoverKind; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
  { value: "active", label: "Most active" },
];

/**
 * Ranked market movement. The leading name is given real scale, the rest run as
 * a numbered hairline list — no per-row boxes. Shared by the homepage and the
 * markets page so the two can never drift apart.
 */
export function MoversRanking({
  movers,
  initialFilter = "trending",
}: {
  movers: Record<MoverKind, Stock[]>;
  initialFilter?: MoverKind;
}) {
  const [filter, setFilter] = useState<MoverKind>(initialFilter);
  const reduceMotion = useReducedMotion();
  const list = movers[filter] ?? [];
  const [lead, ...rest] = list;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-ink-200 pb-4">
        <div role="tablist" aria-label="Market movers" className="flex flex-wrap gap-x-8 gap-y-2">
          {FILTERS.map((option, index) => {
            const active = option.value === filter;
            return (
              <button
                key={option.value}
                role="tab"
                type="button"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const delta = e.key === "ArrowRight" ? 1 : -1;
                  const next = (index + delta + FILTERS.length) % FILTERS.length;
                  setFilter(FILTERS[next].value);
                  const buttons = e.currentTarget.parentElement?.querySelectorAll("button");
                  (buttons?.[next] as HTMLButtonElement | undefined)?.focus();
                }}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "relative pb-1 font-display text-lg font-semibold tracking-[-0.02em] transition-colors sm:text-xl",
                  active ? "text-ink-900" : "text-ink-300 hover:text-ink-600",
                )}
              >
                {option.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 -bottom-[17px] h-0.5 origin-left bg-ink-900 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>
        <ArrowLink href="/stocks">All stocks</ArrowLink>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="Market movers"
          key={filter}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {lead && (
            <Link
              href={`/stocks/${lead.symbol}`}
      prefetch={false}
              className="group/lead grid items-center gap-8 border-b border-ink-200 py-10 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-10"
            >
              <span className="tnum font-mono text-sm text-ink-300">01</span>
              <span>
                <span className="block font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900 transition-colors group-hover/lead:text-brand-600 sm:text-4xl">
                  {lead.name}
                </span>
                <span className="mt-2 block font-mono text-xs text-ink-400">
                  {lead.symbol} · {lead.sector} · {formatCompactCurrency(lead.marketCap)}
                </span>
              </span>
              <span className="hidden lg:block">
                <Sparkline
                  data={lead.series}
                  trend={lead.changePercent}
                  id={`lead-${lead.symbol}`}
                  width={280}
                  height={64}
                  className="w-full"
                />
              </span>
              <span className="flex items-baseline gap-6 lg:flex-col lg:items-end lg:gap-2">
                <span className="tnum font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {formatCurrency(lead.price)}
                </span>
                <Delta value={lead.changePercent} size="md" />
              </span>
            </Link>
          )}

          <ul>
            {rest.map((stock, index) => (
              <li key={stock.symbol} className="border-b border-ink-100">
                <Link
                  href={`/stocks/${stock.symbol}`}
      prefetch={false}
                  className="group/row grid items-center gap-4 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto] sm:gap-8"
                >
                  <span className="tnum hidden font-mono text-xs text-ink-300 sm:block">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9375rem] font-medium text-ink-900 transition-colors group-hover/row:text-brand-600">
                      {stock.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-400">
                      {stock.symbol}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <Sparkline
                      data={stock.series}
                      trend={stock.changePercent}
                      id={`row-${stock.symbol}`}
                      width={110}
                      height={30}
                      filled={false}
                    />
                  </span>
                  <span className="flex items-baseline justify-between gap-6 sm:justify-end">
                    <span className="tnum font-mono text-sm text-ink-800">
                      {formatCurrency(stock.price)}
                    </span>
                    <Delta value={stock.changePercent} size="sm" className="w-24 justify-end" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
