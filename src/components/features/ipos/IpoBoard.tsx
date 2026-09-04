"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Ipo, IpoStatus } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { IpoCard } from "./IpoCard";

type Filter = IpoStatus | "All";

export function IpoBoard({ grouped }: { grouped: Record<IpoStatus, Ipo[]> }) {
  const [filter, setFilter] = useState<Filter>("Open");
  const reduceMotion = useReducedMotion();

  const all = [...grouped.Open, ...grouped.Upcoming, ...grouped.Listed];
  const visible = filter === "All" ? all : grouped[filter];

  return (
    <div>
      <Tabs
        ariaLabel="Filter offerings by status"
        options={[
          { value: "Open", label: "Open now", count: grouped.Open.length },
          { value: "Upcoming", label: "Upcoming", count: grouped.Upcoming.length },
          { value: "Listed", label: "Recently listed", count: grouped.Listed.length },
          { value: "All", label: "All", count: all.length },
        ]}
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
      />

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="Public offerings"
          key={filter}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {visible.length === 0 ? (
            <EmptyState
              title="Nothing in this stage right now"
              description="Switch to another tab to see offerings that are open, upcoming or recently listed."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((ipo) => (
                <li key={ipo.id}>
                  <IpoCard ipo={ipo} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
