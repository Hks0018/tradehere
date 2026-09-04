"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/types";
import { formatCurrency, formatNumber, trendColor } from "@/utils/format";

interface PriceChartProps {
  data: PricePoint[];
  trend: number;
  height?: number;
  showAxes?: boolean;
  referenceValue?: number;
  currency?: boolean;
  id: string;
}

/** Full-size interactive price chart used on detail pages and the markets page. */
export function PriceChart({
  data,
  trend,
  height = 320,
  showAxes = true,
  referenceValue,
  currency = true,
  id,
}: PriceChartProps) {
  const reduceMotion = useReducedMotion();
  const color = trendColor(trend);

  const domain = useMemo<[number, number]>(() => {
    const values = data.map((d) => d.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.12 || max * 0.02;
    return [min - pad, max + pad];
  }, [data]);

  const tickFormatter = (value: number) =>
    currency ? `₹${formatNumber(value, 0)}` : formatNumber(value, 0);

  return (
    <motion.div
      style={{ height }}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: showAxes ? 0 : -40 }}>
          <defs>
            <linearGradient id={`price-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.24} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-ink-100)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
            hide={!showAxes}
          />
          <YAxis
            domain={domain}
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={68}
            tickFormatter={tickFormatter}
            hide={!showAxes}
          />
          {typeof referenceValue === "number" && (
            <ReferenceLine
              y={referenceValue}
              stroke="var(--color-ink-300)"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
          )}
          <Tooltip
            cursor={{ stroke: "var(--color-ink-300)", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const value = payload[0].value as number;
              return (
                <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-lift">
                  <p className="text-xs text-ink-400">{label}</p>
                  <p className="tnum text-sm font-semibold text-ink-900">
                    {currency ? formatCurrency(value) : formatNumber(value)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#price-${id})`}
            isAnimationActive={!reduceMotion}
            animationDuration={800}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
