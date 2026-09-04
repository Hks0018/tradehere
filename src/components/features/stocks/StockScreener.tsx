"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Stock } from "@/types";
import { fetchStocks } from "@/services/marketDataClient";
import type {
  SortDirection,
  StockCategory,
  StockSortKey,
} from "@/services/stockService.types";
import { Tabs } from "@/components/ui/Tabs";
import { Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { StockRow } from "@/components/market/StockCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCompactNumber, formatCurrency } from "@/utils/format";

const CATEGORIES: { value: StockCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "large", label: "Large Cap" },
  { value: "mid", label: "Mid Cap" },
  { value: "small", label: "Small Cap" },
];

const COLUMNS: { key: StockSortKey; label: string; className?: string }[] = [
  { key: "name", label: "Company" },
  { key: "price", label: "Price", className: "text-right" },
  { key: "changePercent", label: "Change", className: "text-right" },
  { key: "marketCap", label: "Market Cap", className: "text-right hidden lg:table-cell" },
  { key: "volume", label: "Volume", className: "text-right hidden xl:table-cell" },
];

/**
 * Client-side screener. It calls the same `stockService` the server pages use,
 * so replacing the mock source in Phase 2 changes nothing here.
 */
export function StockScreener({
  initialStocks,
  sectors,
  initialCategory = "all",
}: {
  initialStocks: Stock[];
  sectors: string[];
  initialCategory?: StockCategory;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StockCategory>(initialCategory);
  const [activeSectors, setActiveSectors] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<StockSortKey>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  /**
   * Filtering and ranking happen on the server, behind Tradehere's own API, so
   * the browser never holds the full universe. Keystrokes are debounced and
   * superseded requests aborted, so a fast typist cannot land stale results.
   */
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetchStocks(
        { search, category, sectors: activeSectors, sortKey, sortDirection },
        controller.signal,
      )
        .then((results) => {
          setStocks(results);
          setError(null);
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return;
          setError(cause instanceof Error ? cause.message : "Market data is unavailable.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, search ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, activeSectors, sortKey, sortDirection]);

  const toggleSector = (sector: string) =>
    setActiveSectors((current) =>
      current.includes(sector) ? current.filter((s) => s !== sector) : [...current, sector],
    );

  const onSort = (key: StockSortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  };

  const filtersActive = activeSectors.length > 0 || search.length > 0 || category !== "all";
  const resultLabel = useMemo(
    () => `${stocks.length} ${stocks.length === 1 ? "company" : "companies"}`,
    [stocks.length],
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-ink-300"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, symbol or sector"
              aria-label="Search stocks"
              className="w-full border-b border-ink-300 bg-transparent py-4 pl-9 pr-4 font-display text-xl font-medium tracking-[-0.02em] text-ink-900 outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-400 focus:border-ink-900 sm:text-2xl"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className={cn(
              "flex shrink-0 items-center justify-center gap-2 self-end border-b py-4 text-sm font-medium transition-colors",
              showFilters || activeSectors.length
                ? "border-ink-900 text-ink-900"
                : "border-ink-300 text-ink-500 hover:text-ink-900",
            )}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {activeSectors.length > 0 && (
              <span className="tnum font-mono text-xs text-brand-600">
                {activeSectors.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            ariaLabel="Filter stocks by category"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
            size="sm"
          />
          <p className="tnum eyebrow text-ink-400" aria-live="polite">
            {loading ? "Updating…" : resultLabel}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-b border-ink-200 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="eyebrow text-ink-400">Filter by sector</h3>
                  {activeSectors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveSectors([])}
                      className="flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
                    >
                      <X className="size-3" aria-hidden />
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sectors.map((sector) => {
                    const active = activeSectors.includes(sector);
                    return (
                      <button
                        key={sector}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleSector(sector)}
                        className={cn(
                          "rounded-pill border px-3.5 py-1.5 text-sm transition-colors",
                          active
                            ? "border-ink-900 bg-ink-900 text-paper-50"
                            : "border-ink-200 text-ink-600 hover:border-ink-900",
                        )}
                      >
                        {sector}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stocks.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={error ? "Market data is unavailable" : "No companies match those filters"}
            description={
              error ?? "Try a different search term, or clear the sector filters to widen the results."
            }
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setActiveSectors([]);
                }}
              >
                Reset filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop / tablet: sortable table */}
          <div className="mt-10 hidden md:block">
            <table className="w-full">
              <caption className="sr-only">
                Sample stock list, sortable by company, price, change, market capitalisation and volume
              </caption>
              <thead>
                <tr className="border-y border-ink-900">
                  {COLUMNS.map((column) => {
                    const active = sortKey === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                        className={cn("eyebrow px-4 py-3.5 text-ink-400", column.className)}
                      >
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 transition-colors hover:text-ink-900",
                            active && "text-ink-900",
                          )}
                        >
                          {column.label}
                          <ArrowUpDown className={cn("size-3", active ? "opacity-100" : "opacity-35")} aria-hidden />
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="eyebrow px-4 py-3.5 text-right text-ink-400">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.symbol} className="group border-b border-ink-100 transition-colors hover:bg-paper-100/60">
                    <td className="px-4 py-4">
                      <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-[0.9375rem] font-medium text-ink-900 group-hover:text-brand-600">
                            {stock.name}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[0.6875rem] text-ink-400">
                            {stock.symbol} · {stock.sector}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="tnum px-4 py-4 text-right font-mono text-sm text-ink-900">
                      {formatCurrency(stock.price)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Delta value={stock.changePercent} size="sm" className="justify-end" />
                    </td>
                    <td className="tnum hidden px-4 py-4 text-right font-mono text-sm text-ink-600 lg:table-cell">
                      {formatCompactCurrency(stock.marketCap)}
                    </td>
                    <td className="tnum hidden px-4 py-4 text-right font-mono text-sm text-ink-600 xl:table-cell">
                      {formatCompactNumber(stock.volume)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <Sparkline
                          data={stock.series}
                          trend={stock.changePercent}
                          id={`table-${stock.symbol}`}
                          width={84}
                          height={30}
                          filled={false}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="mt-8 border-t border-ink-900 md:hidden">
            {stocks.map((stock, index) => (
              <StockRow key={stock.symbol} stock={stock} rank={index + 1} />
            ))}
          </div>
        </>
      )}

      {filtersActive && (
        <p className="mt-6 font-mono text-[0.6875rem] text-ink-400">
          Showing filtered sample data · figures are illustrative, not live quotes
        </p>
      )}
    </div>
  );
}
