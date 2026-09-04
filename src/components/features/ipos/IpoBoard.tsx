"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Ipo, IpoStatus } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { IpoEntry } from "./IpoCard";

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
        variant="underline"
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
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          {visible.length === 0 ? (
            <EmptyState
              title="Nothing in this stage right now"
              description="Switch to another tab to see offerings that are open, upcoming or recently listed."
            />
          ) : (
            <div>
              {visible.map((ipo, index) => (
                <IpoEntry key={ipo.id} ipo={ipo} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
