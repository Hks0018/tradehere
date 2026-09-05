"use client";

import { useEffect, useState } from "react";
import type { PricePoint, StockDetail, Timeframe } from "@/types";
import { PriceChart } from "@/components/charts/PriceChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { Tabs } from "@/components/ui/Tabs";
import { fetchHistory } from "@/services/marketDataClient";
import { describeSection } from "@/utils/provenance";
import { formatCurrency, formatPercent, trendClass } from "@/utils/format";
import { cn } from "@/utils/cn";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "1Y", "5Y"];

interface Series {
  timeframe: Timeframe;
  points: PricePoint[];
  source: string | null;
  status: string;
}

/**
 * Interactive price chart.
 *
 * The initial series is rendered on the server, so the chart is populated on
 * first paint; changing the timeframe fetches through Tradehere's own history
 * API. The caption states the actual source, because a free Alpha Vantage key
 * returns daily bars — the 1D view is the most recent daily closes, not
 * fabricated intraday data.
 */
export function StockChartPanel({
  stock,
  initialSeries,
  initialSource,
  initialStatus,
}: {
  stock: StockDetail;
  initialSeries: PricePoint[];
  initialSource: string | null;
  initialStatus: string;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [series, setSeries] = useState<Series>({
    timeframe: "1M",
    points: initialSeries,
    source: initialSource,
    status: initialStatus,
  });
  const [failure, setFailure] = useState<{ timeframe: Timeframe; message: string } | null>(null);

  // Derived rather than stored, so nothing is set synchronously in the effect.
  const showingError = failure?.timeframe === timeframe;
  const loading = series.timeframe !== timeframe && !showingError;

  useEffect(() => {
    // The server already supplied this window.
    if (series.timeframe === timeframe) return;

    const controller = new AbortController();

    fetchHistory(stock.symbol, timeframe, controller.signal)
      .then((result) =>
        setSeries({
          timeframe,
          points: result.points,
          source: result.source,
          status: result.status,
        }),
      )
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setFailure({
          timeframe,
          message: cause instanceof Error ? cause.message : "Price history is unavailable.",
        });
      });

    return () => controller.abort();
  }, [stock.symbol, timeframe, series.timeframe]);

  const points = series.points;
  const first = points[0]?.v ?? stock.price;
  const last = points[points.length - 1]?.v ?? stock.price;
  const periodChange = last - first;
  const periodChangePercent = first === 0 ? 0 : (periodChange / first) * 100;

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
      <div className={cn("transition-opacity duration-200", loading && "opacity-50")}>
        <PriceChart
          data={points}
          trend={periodChangePercent}
          referenceValue={first}
          id={`${stock.symbol}-${timeframe}`}
          height={340}
        />
      </div>

      <p className="mt-3 px-1 font-mono text-[0.6875rem] text-ink-400" aria-live="polite">
        {showingError
          ? failure.message
          : loading
            ? "Loading price history…"
            : describeSection(
                { source: series.source, status: series.status as never, timestamp: "" },
                "Daily closes",
              )}
      </p>
    </ChartContainer>
  );
}
