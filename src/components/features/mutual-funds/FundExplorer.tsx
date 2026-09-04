"use client";

import { Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { FundCategory, MutualFund, RiskLevel } from "@/types";
import { getFunds, type FundSortKey } from "@/services/mutualFundService";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency, formatPercent, trendClass } from "@/utils/format";

const RISK_TONE: Record<RiskLevel, "up" | "neutral" | "gold" | "down"> = {
  Low: "up",
  Moderate: "neutral",
  High: "gold",
  "Very High": "down",
};

const SORTS: { value: FundSortKey; label: string }[] = [
  { value: "y3", label: "3Y return" },
  { value: "y1", label: "1Y return" },
  { value: "y5", label: "5Y return" },
  { value: "aum", label: "Fund size" },
  { value: "expenseRatio", label: "Lowest cost" },
  { value: "name", label: "Name" },
];

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

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search funds or fund houses"
              aria-label="Search mutual funds"
              className="h-12 w-full rounded-pill border border-ink-200 bg-white pl-11 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-ink-400 focus:border-brand-300"
            />
          </div>
          <label className="flex h-12 shrink-0 items-center gap-2 rounded-pill border border-ink-200 bg-white px-4 text-sm shadow-soft">
            <span className="text-ink-400">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as FundSortKey)}
              className="bg-transparent font-medium text-ink-900 outline-none"
              aria-label="Sort funds"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            ariaLabel="Filter funds by category"
            options={[
              { value: "All", label: "All funds" },
              ...categories.map((c) => ({ value: c, label: `${c} Funds` })),
            ]}
            value={category}
            onChange={(value) => setCategory(value as FundCategory | "All")}
            size="sm"
          />
          <p className="tnum text-sm text-ink-400">
            {funds.length} {funds.length === 1 ? "scheme" : "schemes"}
          </p>
        </div>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Filter by risk level</legend>
          <span className="mr-1 text-sm text-ink-400">Risk</span>
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
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
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
              className="text-sm font-medium text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline"
            >
              Clear
            </button>
          )}
        </fieldset>
      </div>

      {funds.length === 0 ? (
        <div className="mt-8">
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
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {funds.map((fund) => (
            <li key={fund.id}>
              <article className="group flex h-full flex-col rounded-card border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-900">
                      {fund.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-400">
                      {fund.house} · {fund.subCategory}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-pill bg-ink-50 px-2 py-1 text-xs font-medium text-ink-600">
                    <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden />
                    {fund.rating}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{fund.category}</Badge>
                  <Badge tone={RISK_TONE[fund.risk]}>{fund.risk} risk</Badge>
                  <Badge tone="outline">Min SIP {formatCurrency(fund.minSip, 0)}</Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-ink-50/70 p-3">
                  {(["y1", "y3", "y5"] as const).map((key) => (
                    <div key={key} className="text-center">
                      <p className="text-[0.6875rem] uppercase tracking-wider text-ink-400">
                        {key.replace("y", "")}Y
                      </p>
                      <p className={cn("tnum mt-0.5 text-sm font-semibold", trendClass(fund.returns[key]))}>
                        {formatPercent(fund.returns[key])}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                  <dl className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <dt className="text-ink-400">NAV</dt>
                      <dd className="tnum mt-0.5 font-semibold text-ink-900">{formatCurrency(fund.nav)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Fund size</dt>
                      <dd className="tnum mt-0.5 font-semibold text-ink-900">{formatCompactCurrency(fund.aum)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Expense</dt>
                      <dd className="tnum mt-0.5 font-semibold text-ink-900">{fund.expenseRatio.toFixed(2)}%</dd>
                    </div>
                  </dl>
                  <Sparkline
                    data={fund.series}
                    trend={fund.returns.y1}
                    id={`fund-${fund.id}`}
                    width={80}
                    height={32}
                    filled={false}
                    className="shrink-0"
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
