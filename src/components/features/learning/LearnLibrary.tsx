"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, FileText, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { LearnFormat, LearnItem, LearnLevel } from "@/types";
import { getLearnItems } from "@/services/learnService";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

const FORMAT_ICON = { Article: FileText, Video: PlayCircle, Guide: BookOpen } as const;
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
      <div className="flex flex-col gap-4">
        <Tabs
          ariaLabel="Filter lessons by level"
          options={LEVELS.map((l) => ({ value: l, label: l }))}
          value={level}
          onChange={(value) => setLevel(value as LearnLevel | "All")}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                  )}
                >
                  {option === "All" ? "All topics" : option}
                </button>
              );
            })}
          </div>

          <label className="flex shrink-0 items-center gap-2 text-sm text-ink-400">
            Format
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as LearnFormat | "All")}
              className="rounded-pill border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-900 outline-none"
              aria-label="Filter by format"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
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
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {items.length === 0 ? (
            <EmptyState
              title="No lessons match those filters"
              description="Try a different level, topic or format."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
                  <LearnCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function LearnCard({ item }: { item: LearnItem }) {
  const FormatIcon = FORMAT_ICON[item.format];
  return (
    <Link
      href={`/learn/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift"
    >
      <div
        className="relative h-24 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${item.accent}1f, ${item.accent}05)` }}
      >
        <span
          aria-hidden
          className="absolute -right-6 -top-6 size-24 rounded-full opacity-15 blur-xl transition-transform duration-500 group-hover:scale-125"
          style={{ background: item.accent }}
        />
        <span
          className="absolute bottom-3 left-4 flex size-9 items-center justify-center rounded-xl bg-white shadow-soft"
          style={{ color: item.accent }}
        >
          <FormatIcon className="size-4.5" aria-hidden />
        </span>
        <span className="absolute right-3 top-3 rounded-pill bg-white/85 px-2.5 py-1 text-xs font-medium text-ink-600 backdrop-blur">
          {item.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-ink-400">
          {item.topic} · {item.minutes} min {item.format.toLowerCase()}
        </p>
        <h3 className="mt-2 text-base font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{item.excerpt}</p>
      </div>
    </Link>
  );
}
