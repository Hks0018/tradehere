"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Calculator, CornerDownLeft, LineChart, Layers, Newspaper, Rocket, Search,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { getSearchSuggestions, search } from "@/services/searchService";
import type { SearchResult, SearchResultType } from "@/types";
import { cn } from "@/utils/cn";
import { trendClass } from "@/utils/format";

const TYPE_META: Record<SearchResultType, { label: string; icon: typeof LineChart; tone: string }> = {
  stock: { label: "Stock", icon: LineChart, tone: "text-brand-600 bg-brand-50" },
  fund: { label: "Fund", icon: Layers, tone: "text-up-600 bg-up-50" },
  ipo: { label: "IPO", icon: Rocket, tone: "text-down-600 bg-down-50" },
  article: { label: "News", icon: Newspaper, tone: "text-gold-600 bg-gold-100" },
  learn: { label: "Learn", icon: BookOpen, tone: "text-teal-500 bg-ink-50" },
  tool: { label: "Tool", icon: Calculator, tone: "text-ink-600 bg-ink-50" },
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    void getSearchSuggestions().then(setSuggestions);
  }, []);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    void search(query).then((found) => {
      if (!cancelled) {
        setResults(found);
        setActiveIndex(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const visible = useMemo(
    () => (query.trim() ? results : suggestions),
    [query, results, suggestions],
  );

  const go = (result: SearchResult) => {
    onClose();
    router.push(result.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(visible.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + visible.length) % Math.max(visible.length, 1));
    } else if (event.key === "Enter" && visible[activeIndex]) {
      event.preventDefault();
      go(visible[activeIndex]);
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="search-heading" className="max-w-xl">
      <h2 id="search-heading" className="sr-only">
        Search the platform
      </h2>
      <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
        <Search className="size-4.5 shrink-0 text-ink-400" aria-hidden />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          type="search"
          role="combobox"
          aria-expanded
          aria-controls="search-results"
          aria-autocomplete="list"
          placeholder="Search stocks, funds, IPOs, news and lessons"
          className="w-full bg-transparent text-[0.9375rem] text-ink-900 outline-none placeholder:text-ink-400"
        />
        <kbd className="hidden shrink-0 rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-400 sm:block">
          Esc
        </kbd>
      </div>

      <div id="search-results" role="listbox" className="max-h-[min(26rem,60vh)] overflow-y-auto p-2">
        {!query.trim() && (
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Suggested
          </p>
        )}
        {visible.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm font-medium text-ink-700">No matches for “{query}”</p>
            <p className="mt-1 text-sm text-ink-400">
              Try a company name, a fund category, or a topic like “diversification”.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {visible.map((result, index) => {
              const meta = TYPE_META[result.type];
              const MetaIcon = meta.icon;
              const active = index === activeIndex;
              return (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(result)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-ink-50" : "hover:bg-ink-50/70",
                    )}
                  >
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                      <MetaIcon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-ink-400">{result.subtitle}</span>
                    </span>
                    {result.meta && (
                      <span className="tnum hidden shrink-0 text-sm font-medium text-ink-700 sm:block">
                        {result.meta}
                      </span>
                    )}
                    {typeof result.trend === "number" && (
                      <span className={cn("tnum shrink-0 text-xs font-semibold", trendClass(result.trend))}>
                        {result.trend > 0 ? "+" : ""}
                        {result.trend.toFixed(2)}%
                      </span>
                    )}
                    {active && <CornerDownLeft className="size-3.5 shrink-0 text-ink-300" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-[0.6875rem] text-ink-400">
        <span className="flex items-center gap-3">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
        </span>
        <span>Searching sample data</span>
      </footer>
    </Modal>
  );
}
