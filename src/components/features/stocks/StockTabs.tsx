"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { NewsArticle, StockDetail } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { DonutChart } from "@/components/charts/DonutChart";
import { FinancialsBarChart } from "@/components/charts/FinancialsBarChart";
import { DATA_REFERENCE_DATE } from "@/utils/series";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelative,
  trendClass,
} from "@/utils/format";

type TabKey = "overview" | "fundamentals" | "financials" | "news";

const SHAREHOLDING_COLORS = [
  "var(--color-brand-600)",
  "var(--color-teal-500)",
  "var(--color-gold-500)",
  "var(--color-ink-300)",
];

export function StockTabs({ stock, news }: { stock: StockDetail; news: NewsArticle[] }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <Tabs
        ariaLabel="Company information"
        variant="underline"
        options={[
          { value: "overview", label: "Overview" },
          { value: "fundamentals", label: "Fundamentals" },
          { value: "financials", label: "Financials" },
          { value: "news", label: "News", count: news.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="Company information"
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="pt-10"
        >
          {tab === "overview" && <OverviewTab stock={stock} />}
          {tab === "fundamentals" && <FundamentalsTab stock={stock} />}
          {tab === "financials" && <FinancialsTab stock={stock} />}
          {tab === "news" && <NewsTab news={news} name={stock.name} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-900 pt-5">
      <h3 className="eyebrow text-ink-400">{title}</h3>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function OverviewTab({ stock }: { stock: StockDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Panel title="Company overview">
        <p className="text-sm leading-relaxed text-ink-600">{stock.description}</p>
        <StatGrid className="mt-2" columns={4}>
          <Stat label="Sector" value={<span className="text-sm">{stock.sector}</span>} />
          <Stat label="Industry" value={<span className="text-sm">{stock.industry}</span>} />
          <Stat label="Founded" value={<span className="text-sm">{stock.founded}</span>} />
          <Stat label="Employees" value={<span className="text-sm">{formatNumber(stock.employees, 0)}</span>} />
          <Stat label="Headquarters" value={<span className="text-sm">{stock.headquarters}</span>} className="col-span-2" />
          <Stat label="Exchange" value={<span className="text-sm">{stock.exchange}</span>} />
          <Stat label="Cap bucket" value={<span className="text-sm">{stock.capBucket}</span>} />
        </StatGrid>
      </Panel>

      <Panel title="Shareholding pattern">
        <DonutChart
          data={stock.shareholding.map((entry, i) => ({
            label: entry.label,
            value: entry.value,
            color: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
          }))}
          centerLabel="Promoter stake"
          centerValue={`${stock.shareholding[0].value.toFixed(1)}%`}
        />
        <ul className="mt-4 space-y-2">
          {stock.shareholding.map((entry, i) => (
            <li key={entry.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-600">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length] }}
                />
                {entry.label}
              </span>
              <span className="tnum font-medium text-ink-900">{entry.value.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function FundamentalsTab({ stock }: { stock: StockDetail }) {
  const range = stock.high52 - stock.low52;
  const position = Math.min(Math.max(((stock.price - stock.low52) / range) * 100, 0), 100);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Valuation">
        <StatGrid columns={2}>
          <Stat label="Market Cap" value={formatCompactCurrency(stock.marketCap)} />
          <Stat label="P/E Ratio" value={formatNumber(stock.pe)} />
          <Stat label="EPS" value={formatCurrency(stock.eps)} />
          <Stat label="Book Value" value={formatCurrency(stock.bookValue)} />
          <Stat label="Dividend Yield" value={`${stock.dividendYield.toFixed(2)}%`} />
          <Stat label="Debt / Equity" value={formatNumber(stock.debtToEquity)} />
        </StatGrid>
      </Panel>

      <Panel title="Performance & range">
        <StatGrid columns={2}>
          <Stat label="Return on Equity" value={`${stock.roe.toFixed(1)}%`} />
          <Stat
            label="Revenue Growth"
            value={formatPercent(stock.revenueGrowth)}
            valueClassName={trendClass(stock.revenueGrowth)}
          />
          <Stat
            label="Profit Growth"
            value={formatPercent(stock.profitGrowth)}
            valueClassName={trendClass(stock.profitGrowth)}
          />
          <Stat label="Volume" value={formatNumber(stock.volume, 0)} />
        </StatGrid>

        <div className="mt-8 border-t border-ink-200 pt-6">
          <div className="eyebrow flex items-center justify-between text-ink-400">
            <span>52-week low</span>
            <span>52-week high</span>
          </div>
          <div className="relative mt-3 h-px bg-ink-200">
            <span
              className="absolute -top-1.5 size-3 -translate-x-1/2 rounded-full bg-brand-600"
              style={{ left: `${position}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-sm">
            <span className="tnum text-ink-900">{formatCurrency(stock.low52)}</span>
            <span className="tnum text-ink-900">{formatCurrency(stock.high52)}</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function FinancialsTab({ stock }: { stock: StockDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Panel title="Revenue and profit">
        <FinancialsBarChart data={stock.financials} />
      </Panel>

      <Panel title="Year-wise summary">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Sample annual revenue, profit and margin</caption>
            <thead>
              <tr className="eyebrow border-b border-ink-900 text-ink-400">
                <th scope="col" className="py-2 text-left font-semibold">Year</th>
                <th scope="col" className="py-2 text-right font-semibold">Revenue</th>
                <th scope="col" className="py-2 text-right font-semibold">Profit</th>
                <th scope="col" className="py-2 text-right font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody>
              {stock.financials.map((row) => (
                <tr key={row.year} className="border-b border-ink-100 last:border-0">
                  <th scope="row" className="py-2.5 text-left font-medium text-ink-900">{row.year}</th>
                  <td className="tnum py-2.5 text-right text-ink-600">
                    {formatCompactCurrency(row.revenue * 1e7)}
                  </td>
                  <td className="tnum py-2.5 text-right text-ink-600">
                    {formatCompactCurrency(row.profit * 1e7)}
                  </td>
                  <td className="tnum py-2.5 text-right text-ink-600">{row.ebitdaMargin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 font-mono text-[0.6875rem] text-ink-400">Figures in ₹ crore, converted for display · sample data</p>
      </Panel>
    </div>
  );
}

function NewsTab({ news, name }: { news: NewsArticle[]; name: string }) {
  if (news.length === 0) {
    return (
      <div className="border-t border-ink-200 px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink-700">No sample coverage for {name} yet</p>
        <Link href="/news" className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
          Browse all market news →
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {news.map((article) => {
        // Provider items live at the publisher; sample editorial has a page here.
        const external = Boolean(article.url);
        const LinkComponent = external ? "a" : Link;
        const linkProps = external
          ? { href: article.url!, target: "_blank", rel: "noopener noreferrer" }
          : { href: `/news/${article.slug}` };

        return (
        <li key={article.id}>
          <LinkComponent
            {...linkProps}
            className="group flex h-full flex-col border-t border-ink-200 pt-4 transition-colors hover:border-ink-900"
          >
            <span className="eyebrow text-brand-600">{article.category}</span>
            <span className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
              {article.title}
            </span>
            <span className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{article.summary}</span>
            <span className="mt-5 font-mono text-[0.6875rem] text-ink-400">
              {article.source} · {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
              {external && " · opens at source"}
            </span>
          </LinkComponent>
        </li>
        );
      })}
    </ul>
  );
}
