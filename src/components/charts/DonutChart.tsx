"use client";

import { useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
  valueFormatter = (v: number) => `${v.toFixed(1)}%`,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  valueFormatter?: (value: number) => string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="64%"
            outerRadius="94%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={!reduceMotion}
            animationDuration={700}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const datum = payload[0].payload as DonutDatum;
              return (
                <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-lift">
                  <p className="text-xs text-ink-500">{datum.label}</p>
                  <p className="tnum text-sm font-semibold text-ink-900">
                    {valueFormatter(datum.value)}
                  </p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="tnum text-xl font-semibold text-ink-900">{centerValue}</span>
          )}
          {centerLabel && <span className="mt-0.5 text-xs text-ink-400">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
