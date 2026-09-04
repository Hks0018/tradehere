"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import type { Stock } from "@/types";
import type { MoverKind } from "@/services/marketService";
import { Tabs } from "@/components/ui/Tabs";
import { StockRow } from "./StockCard";

const OPTIONS: { value: MoverKind; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "gainers", label: "Top Gainers" },
  { value: "losers", label: "Top Losers" },
  { value: "active", label: "Most Active" },
];

/**
 * Tabbed market-movers panel. Data for every tab is fetched on the server and
 * passed in, so switching tabs is instant and works without JavaScript latency.
 */
export function MoversTabs({
  movers,
  columns = 2,
}: {
  movers: Record<MoverKind, Stock[]>;
  columns?: 1 | 2;
}) {
  const [active, setActive] = useState<MoverKind>("trending");
  const reduceMotion = useReducedMotion();
  const list = movers[active] ?? [];

  return (
    <div className="rounded-card border border-ink-100 bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Tabs
          options={OPTIONS}
          value={active}
          onChange={setActive}
          ariaLabel="Market movers category"
          size="sm"
        />
        <Link
          href="/stocks"
          className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          View all stocks →
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="Market movers"
          key={active}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={columns === 2 ? "grid gap-x-4 p-2 sm:p-3 lg:grid-cols-2" : "p-2 sm:p-3"}
        >
          {list.map((stock, index) => (
            <StockRow key={stock.symbol} stock={stock} rank={index + 1} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
