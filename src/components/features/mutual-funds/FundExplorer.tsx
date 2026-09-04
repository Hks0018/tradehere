"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { FundCategory, MutualFund, RiskLevel } from "@/types";
import { getFunds, type FundSortKey } from "@/services/mutualFundService";
import { Tabs } from "@/components/ui/Tabs";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency, formatPercent, trendClass } from "@/utils/format";

const SORTS: { value: FundSortKey; label: string }[] = [
  { value: "y3", label: "3Y return" },
  { value: "y1", label: "1Y return" },
  { value: "y5", label: "5Y return" },
  { value: "aum", label: "Fund size" },
  { value: "expenseRatio", label: "Lowest cost" },
  { value: "name", label: "Name" },
];

/**
 * Funds as a ranked editorial table rather than a grid of tiles: one row per
 * scheme, the return you sorted by given weight, everything else in support.
 */
export function FundExplorer({
  initialFunds,
  categories,
  risks,
  initialCategory = "All",
}: {
  initialFunds: MutualFund[];
  categories: FundCategory[];
  risks: RiskLevel[];
  initialCategory?: FundCategory | "All";
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FundCategory | "All">(initialCategory);
  const [activeRisks, setActiveRisks] = useState<RiskLevel[]>([]);
  const [sortKey, setSortKey] = useState<FundSortKey>("y3");
  const [funds, setFunds] = useState<MutualFund[]>(initialFunds);

  useEffect(() => {
    let cancelled = false;
    void getFunds({ search, category, risks: activeRisks, sortKey }).then((results) => {
      if (!cancelled) setFunds(results);
    });
    return () => {
      cancelled = true;
    };
  }, [search, category, activeRisks, sortKey]);

  const toggleRisk = (risk: RiskLevel) =>
    setActiveRisks((current) =>
      current.includes(risk) ? current.filter((r) => r !== risk) : [...current, risk],
    );

  const primaryReturn = (fund: MutualFund) =>
    sortKey === "y1" ? fund.returns.y1 : sortKey === "y5" ? fund.returns.y5 : fund.returns.y3;
  const primaryLabel = sortKey === "y1" ? "1Y" : sortKey === "y5" ? "5Y" : "3Y";

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-ink-300"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search funds or fund houses"
          aria-label="Search mutual funds"
          className="w-full border-b border-ink-300 bg-transparent py-4 pl-9 pr-4 font-display text-xl font-medium tracking-[-0.02em] text-ink-900 outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-400 focus:border-ink-900 sm:text-2xl"
        />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-6">
        <Tabs
          ariaLabel="Filter funds by category"
          variant="underline"
          options={[
            { value: "All", label: "All funds" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
          value={category}
          onChange={(value) => setCategory(value as FundCategory | "All")}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Filter by risk level</legend>
            <span className="eyebrow mr-2 text-ink-400">Risk</span>
            {risks.map((risk) => {
              const active = activeRisks.includes(risk);
              return (
                <button
                  key={risk}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleRisk(risk)}
                  className={cn(
                    "rounded-pill border px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "border-ink-900 bg-ink-900 text-paper-50"
                      : "border-ink-200 text-ink-600 hover:border-ink-900",
                  )}
                >
                  {risk}
                </button>
              );
            })}
            {activeRisks.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveRisks([])}
                className="ml-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400 underline-offset-4 hover:text-ink-900 hover:underline"
              >
                Clear
              </button>
            )}
          </fieldset>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2.5 text-sm">
              <span className="eyebrow text-ink-400">Sort</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as FundSortKey)}
                className="border-b border-ink-300 bg-transparent py-1 font-medium text-ink-900 outline-none transition-colors focus:border-ink-900"
                aria-label="Sort funds"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="eyebrow tnum text-ink-400">
              {funds.length} {funds.length === 1 ? "scheme" : "schemes"}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {funds.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No schemes match those filters"
            description="Try a different category, or clear the risk filters."
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setActiveRisks([]);
                }}
              >
                Reset filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-12 border-t border-ink-900">
          {funds.map((fund, index) => (
            <li key={fund.id} className="border-b border-ink-100">
              <article className="group/fund grid items-center gap-x-8 gap-y-4 py-6 lg:grid-cols-[3rem_minmax(0,1.6fr)_auto_auto_auto] lg:py-7">
                <p className="tnum hidden font-mono text-xs text-ink-300 lg:block">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-ink-900">
                    {fund.name}
                  </h3>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
                    <span>{fund.house}</span>
                    <span aria-hidden>·</span>
                    <span>{fund.subCategory}</span>
                    <span aria-hidden>·</span>
                    <span
                      className={cn(
                        fund.risk === "Very High" || fund.risk === "High"
                          ? "text-gold-600"
                          : "text-ink-400",
                      )}
                    >
                      {fund.risk} risk
                    </span>
                    <span aria-hidden>·</span>
                    <span aria-label={`Rated ${fund.rating} out of 5`}>
                      {"★".repeat(fund.rating)}
                      <span className="text-ink-200">{"★".repeat(5 - fund.rating)}</span>
                    </span>
                  </p>
                </div>

                <div className="hidden lg:block">
                  <Sparkline
                    data={fund.series}
                    trend={fund.returns.y1}
                    id={`fund-${fund.id}`}
                    width={120}
                    height={36}
                    filled={false}
                  />
                </div>

                <dl className="flex gap-8 lg:gap-10">
                  <div>
                    <dt className="eyebrow text-ink-400">NAV</dt>
                    <dd className="tnum mt-1.5 font-mono text-sm text-ink-800">
                      {formatCurrency(fund.nav)}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-400">Size</dt>
                    <dd className="tnum mt-1.5 font-mono text-sm text-ink-800">
                      {formatCompactCurrency(fund.aum)}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-400">Expense</dt>
                    <dd className="tnum mt-1.5 font-mono text-sm text-ink-800">
                      {fund.expenseRatio.toFixed(2)}%
                    </dd>
                  </div>
                </dl>

                <div className="lg:text-right">
                  <p className="eyebrow text-ink-400">{primaryLabel} return</p>
                  <p
                    className={cn(
                      "tnum mt-1 font-display text-2xl font-semibold",
                      trendClass(primaryReturn(fund)),
                    )}
                  >
                    {formatPercent(primaryReturn(fund))}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
