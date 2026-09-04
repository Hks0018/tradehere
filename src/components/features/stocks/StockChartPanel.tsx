"use client";

import { useMemo, useState } from "react";
import type { StockDetail, Timeframe } from "@/types";
import { PriceChart } from "@/components/charts/PriceChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { Tabs } from "@/components/ui/Tabs";
import { seriesForTimeframe } from "@/utils/series";
import { formatCurrency, formatPercent, trendClass } from "@/utils/format";
import { cn } from "@/utils/cn";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "1Y", "5Y"];

/**
 * Interactive price chart with timeframe switching. Series are derived through
 * the same helper the service uses, keeping client and server output identical.
 */
export function StockChartPanel({ stock }: { stock: StockDetail }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");

  const series = useMemo(
    () => seriesForTimeframe(`history:${stock.symbol}`, stock.price, timeframe),
    [stock.symbol, stock.price, timeframe],
  );

  const first = series[0]?.v ?? stock.price;
  const last = series[series.length - 1]?.v ?? stock.price;
  const periodChange = last - first;
  const periodChangePercent = (periodChange / first) * 100;

  return (
    <ChartContainer
      title="Price history"
      subtitle={
        <span className={cn("tnum", trendClass(periodChangePercent))}>
          {formatCurrency(periodChange)} ({formatPercent(periodChangePercent)}) over {timeframe}
        </span>
      }
      actions={
        <Tabs
          ariaLabel="Chart timeframe"
          options={TIMEFRAMES.map((tf) => ({ value: tf, label: tf }))}
          value={timeframe}
          onChange={setTimeframe}
          size="sm"
        />
      }
    >
      <PriceChart
        data={series}
        trend={periodChangePercent}
        referenceValue={first}
        id={`${stock.symbol}-${timeframe}`}
        height={340}
      />
      <p className="mt-3 px-1 text-xs text-ink-400">
        Sample price history generated for demonstration. Not live or historical market data.
      </p>
    </ChartContainer>
  );
}
