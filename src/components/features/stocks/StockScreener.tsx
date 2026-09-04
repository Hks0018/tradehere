"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Stock } from "@/types";
import {
  getStocks,
  type SortDirection,
  type StockCategory,
  type StockSortKey,
} from "@/services/stockService";
import { Tabs } from "@/components/ui/Tabs";
import { ChangeBadge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { StockCard } from "@/components/market/StockCard";
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    void getStocks({ search, category, sectors: activeSectors, sortKey, sortDirection }).then(
      (results) => {
        if (!cancelled) setStocks(results);
      },
    );
    return () => {
      cancelled = true;
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
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, symbol or sector"
              aria-label="Search stocks"
              className="h-12 w-full rounded-pill border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-900 shadow-soft outline-none transition-colors placeholder:text-ink-400 focus:border-brand-300"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className={cn(
              "flex h-12 shrink-0 items-center justify-center gap-2 rounded-pill border px-5 text-sm font-medium transition-colors",
              showFilters || activeSectors.length
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
            )}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {activeSectors.length > 0 && (
              <span className="tnum rounded-pill bg-brand-600 px-1.5 text-xs text-white">
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
          <p className="tnum text-sm text-ink-400">{resultLabel}</p>
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
              <div className="rounded-card border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">Sectors</h3>
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
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
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
            title="No companies match those filters"
            description="Try a different search term, or clear the sector filters to widen the results."
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
          <div className="mt-8 hidden overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft md:block">
            <table className="w-full">
              <caption className="sr-only">
                Sample stock list, sortable by company, price, change, market capitalisation and volume
              </caption>
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  {COLUMNS.map((column) => {
                    const active = sortKey === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                        className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500", column.className)}
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
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.symbol} className="group border-b border-ink-100 last:border-0 transition-colors hover:bg-ink-50/70">
                    <td className="px-4 py-3.5">
                      <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-[0.6875rem] font-bold text-ink-500">
                          {stock.symbol.slice(0, 3)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink-900 group-hover:text-brand-700">
                            {stock.name}
                          </span>
                          <span className="block truncate text-xs text-ink-400">
                            {stock.symbol} · {stock.sector}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="tnum px-4 py-3.5 text-right text-sm font-medium text-ink-900">
                      {formatCurrency(stock.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ChangeBadge value={stock.changePercent} />
                    </td>
                    <td className="tnum hidden px-4 py-3.5 text-right text-sm text-ink-600 lg:table-cell">
                      {formatCompactCurrency(stock.marketCap)}
                    </td>
                    <td className="tnum hidden px-4 py-3.5 text-right text-sm text-ink-600 xl:table-cell">
                      {formatCompactNumber(stock.volume)}
                    </td>
                    <td className="px-4 py-3.5">
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:hidden">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </>
      )}

      {filtersActive && (
        <p className="mt-4 text-xs text-ink-400">
          Showing filtered sample data. Figures are illustrative and not live quotes.
        </p>
      )}
    </div>
  );
}
