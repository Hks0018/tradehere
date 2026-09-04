"use client";

import { useReducedMotion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialYear } from "@/types";
import { formatCompactCurrency } from "@/utils/format";

/** Revenue vs profit history on the stock detail page. */
export function FinancialsBarChart({ data, height = 280 }: { data: FinancialYear[]; height?: number }) {
  const reduceMotion = useReducedMotion();
  // Values are stored in ₹ crore; convert for the shared currency formatter.
  const chartData = data.map((d) => ({
    year: d.year,
    Revenue: d.revenue * 1e7,
    Profit: d.profit * 1e7,
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={6}>
          <CartesianGrid stroke="var(--color-ink-100)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-400)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={78}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
          />
          <Tooltip
            cursor={{ fill: "var(--color-ink-50)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-lift">
                  <p className="mb-1 text-xs text-ink-400">{label}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} className="tnum text-sm text-ink-700">
                      <span className="mr-2 inline-block size-2 rounded-full" style={{ background: entry.color }} />
                      {entry.name}:{" "}
                      <span className="font-semibold">{formatCompactCurrency(Number(entry.value))}</span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--color-ink-500)" }}
          />
          <Bar dataKey="Revenue" fill="var(--color-brand-500)" radius={[5, 5, 0, 0]} isAnimationActive={!reduceMotion} />
          <Bar dataKey="Profit" fill="var(--color-up-500)" radius={[5, 5, 0, 0]} isAnimationActive={!reduceMotion} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
