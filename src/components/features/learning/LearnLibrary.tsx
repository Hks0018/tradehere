"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { LearnFormat, LearnItem, LearnLevel } from "@/types";
import { getLearnItems } from "@/services/learnService";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

const LEVELS: (LearnLevel | "All")[] = ["All", "Beginner", "Intermediate", "Advanced"];
const FORMATS: (LearnFormat | "All")[] = ["All", "Article", "Video", "Guide"];

export function LearnLibrary({
  initialItems,
  topics,
  initialLevel = "All",
  initialTopic = "All",
}: {
  initialItems: LearnItem[];
  topics: string[];
  initialLevel?: LearnLevel | "All";
  initialTopic?: string;
}) {
  const [level, setLevel] = useState<LearnLevel | "All">(initialLevel);
  const [topic, setTopic] = useState<string>(initialTopic);
  const [format, setFormat] = useState<LearnFormat | "All">("All");
  const [items, setItems] = useState(initialItems);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    void getLearnItems({ level, topic, format }).then((results) => {
      if (!cancelled) setItems(results);
    });
    return () => {
      cancelled = true;
    };
  }, [level, topic, format]);

  return (
    <div>
      <div className="flex flex-col gap-6">
        <Tabs
          ariaLabel="Filter lessons by level"
          variant="underline"
          options={LEVELS.map((l) => ({ value: l, label: l }))}
          value={level}
          onChange={(value) => setLevel(value as LearnLevel | "All")}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...topics].map((option) => {
              const active = topic === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(option)}
                  className={cn(
                    "rounded-pill border px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "border-ink-900 bg-ink-900 text-paper-50"
                      : "border-ink-200 text-ink-600 hover:border-ink-900",
                  )}
                >
                  {option === "All" ? "All topics" : option}
                </button>
              );
            })}
          </div>

          <label className="flex shrink-0 items-center gap-2.5">
            <span className="eyebrow text-ink-400">Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as LearnFormat | "All")}
              className="border-b border-ink-300 bg-transparent py-1 text-sm font-medium text-ink-900 outline-none transition-colors focus:border-ink-900"
              aria-label="Filter by format"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="Lessons"
          key={`${level}-${topic}-${format}`}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          {items.length === 0 ? (
            <EmptyState
              title="No lessons match those filters"
              description="Try a different level, topic or format."
            />
          ) : (
            <ul className="border-t border-ink-900">
              {items.map((item, index) => (
                <li key={item.id} className="border-b border-ink-100">
                  <Link
                    href={`/learn/${item.slug}`}
                    className="group/lesson grid items-baseline gap-x-10 gap-y-3 py-7 lg:grid-cols-[3rem_9rem_minmax(0,1fr)_7rem]"
                  >
                    <span className="tnum hidden font-mono text-xs text-ink-300 lg:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="eyebrow text-brand-600">{item.level}</span>
                    <span className="min-w-0">
                      <span className="block font-display text-xl font-semibold leading-snug tracking-[-0.022em] text-ink-900 transition-colors group-hover/lesson:text-brand-600 sm:text-2xl">
                        {item.title}
                      </span>
                      <span className="mt-2.5 block max-w-2xl leading-relaxed text-ink-600">
                        {item.excerpt}
                      </span>
                      <span className="mt-3 block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">
                        {item.topic}
                      </span>
                    </span>
                    <span className="font-mono text-[0.6875rem] text-ink-400 lg:text-right">
                      {item.minutes} min
                      <span className="mt-1 block">{item.format}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Grid presentation used for related lessons. */
export function LearnCard({ item }: { item: LearnItem }) {
  return (
    <Link
      href={`/learn/${item.slug}`}
      className="group/card flex h-full flex-col border-t border-ink-200 pt-4 transition-colors hover:border-ink-900"
    >
      <span className="eyebrow flex items-center gap-2 text-brand-600">
        {item.level}
        <span aria-hidden className="text-ink-200">/</span>
        <span className="text-ink-400">{item.format}</span>
      </span>
      <span className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover/card:text-brand-600">
        {item.title}
      </span>
      <span className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{item.excerpt}</span>
      <span className="mt-5 font-mono text-[0.6875rem] text-ink-400">{item.minutes} min read</span>
    </Link>
  );
}
