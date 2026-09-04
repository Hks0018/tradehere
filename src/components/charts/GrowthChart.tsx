"use client";

import { useReducedMotion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency } from "@/utils/format";

export interface GrowthDatum {
  year: number;
  invested: number;
  value: number;
}

/**
 * Stacked-style projection chart shared by every calculator: invested capital
 * underneath, projected value above.
 */
export function GrowthChart({
  data,
  height = 300,
  investedLabel = "Invested",
  valueLabel = "Projected value",
  id,
}: {
  data: GrowthDatum[];
  height?: number;
  investedLabel?: string;
  valueLabel?: string;
  id: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`growth-value-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`growth-invested-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink-400)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--color-ink-400)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-ink-100)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(y) => `Y${y}`}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-ink-300)", strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-lift">
                  <p className="mb-1 text-xs text-ink-400">Year {label}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} className="tnum text-sm text-ink-700">
                      <span className="mr-2 inline-block size-2 rounded-full" style={{ background: entry.color }} />
                      {entry.name}: <span className="font-semibold">{formatCompactCurrency(Number(entry.value))}</span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            height={32}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--color-ink-500)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke="var(--color-brand-600)"
            strokeWidth={2}
            fill={`url(#growth-value-${id})`}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="invested"
            name={investedLabel}
            stroke="var(--color-ink-400)"
            strokeWidth={1.75}
            strokeDasharray="5 4"
            fill={`url(#growth-invested-${id})`}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
