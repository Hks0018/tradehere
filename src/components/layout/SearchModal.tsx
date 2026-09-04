"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Calculator, CornerDownLeft, LineChart, Layers, Newspaper, Rocket, Search,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { fetchSearch } from "@/services/marketDataClient";
import type { SearchResult, SearchResultType } from "@/types";
import { cn } from "@/utils/cn";
import { trendClass } from "@/utils/format";

const TYPE_META: Record<SearchResultType, { label: string; icon: typeof LineChart; tone: string }> = {
  stock: { label: "Stock", icon: LineChart, tone: "text-brand-600" },
  fund: { label: "Fund", icon: Layers, tone: "text-up-600" },
  ipo: { label: "IPO", icon: Rocket, tone: "text-down-600" },
  article: { label: "News", icon: Newspaper, tone: "text-gold-600" },
  learn: { label: "Learn", icon: BookOpen, tone: "text-teal-500" },
  tool: { label: "Tool", icon: Calculator, tone: "text-ink-500" },
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Suggestions are fetched once, the first time the dialog is opened.
  useEffect(() => {
    if (!open || suggestions.length > 0) return;
    const controller = new AbortController();
    fetchSearch("", controller.signal)
      .then(setSuggestions)
      .catch(() => {
        /* Suggestions are optional; the dialog is still usable without them. */
      });
    return () => controller.abort();
  }, [open, suggestions.length]);

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

  /**
   * Queries run against Tradehere's own search endpoint, which is what keeps
   * the dataset — and any future provider credentials — off the client.
   * Debounced, and superseded requests are aborted so results cannot arrive
   * out of order.
   */
  useEffect(() => {
    // An empty query shows suggestions instead, so there is nothing to fetch
    // and no state to clear — `visible` already switches source below.
    if (!query.trim()) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchSearch(query, controller.signal)
        .then((found) => {
          setResults(found);
          setActiveIndex(0);
        })
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visible = useMemo(
    () => (query.trim() ? results : suggestions),
    [query, results, suggestions],
  );

  // The highlighted row is clamped rather than reset, so switching between
  // results and suggestions can never point past the end of the list.
  const highlighted = Math.min(activeIndex, Math.max(visible.length - 1, 0));

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
    } else if (event.key === "Enter" && visible[highlighted]) {
      event.preventDefault();
      go(visible[highlighted]);
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="search-heading" className="max-w-xl">
      <h2 id="search-heading" className="sr-only">
        Search the platform
      </h2>
      <div className="flex items-center gap-3.5 border-b border-ink-200 px-5 py-4">
        <Search className="size-5 shrink-0 text-ink-300" aria-hidden />
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
          className="w-full bg-transparent font-display text-lg font-medium tracking-[-0.02em] text-ink-900 outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-400"
        />
        <kbd className="hidden shrink-0 rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-400 sm:block">
          Esc
        </kbd>
      </div>

      <div id="search-results" role="listbox" className="max-h-[min(26rem,60vh)] overflow-y-auto py-2">
        {!query.trim() && (
          <p className="eyebrow px-4 py-2.5 text-ink-400">Suggested</p>
        )}
        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
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
              const active = index === highlighted;
              return (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(result)}
                    className={cn(
                      "flex w-full items-center gap-3.5 border-l-2 px-4 py-3 text-left transition-colors",
                      active ? "border-ink-900 bg-paper-100" : "border-transparent hover:bg-paper-100/60",
                    )}
                  >
                    <span className={cn("flex size-5 shrink-0 items-center justify-center", meta.tone)}>
                      <MetaIcon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-medium text-ink-900">
                        {result.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[0.6875rem] text-ink-400">
                        {result.subtitle}
                      </span>
                    </span>
                    {result.meta && (
                      <span className="tnum hidden shrink-0 font-mono text-sm text-ink-700 sm:block">
                        {result.meta}
                      </span>
                    )}
                    {typeof result.trend === "number" && (
                      <span className={cn("tnum shrink-0 font-mono text-xs", trendClass(result.trend))}>
                        <span aria-hidden>{result.trend > 0 ? "↑" : "↓"}</span>{" "}
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

      <footer className="eyebrow flex items-center justify-between border-t border-ink-200 px-5 py-3 text-ink-400">
        <span className="flex items-center gap-4">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
        </span>
        <span>Sample data</span>
      </footer>
    </Modal>
  );
}
