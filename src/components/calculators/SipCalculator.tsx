"use client";

import { useMemo, useState } from "react";
import { calculateSip } from "@/utils/finance";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DonutChart } from "@/components/charts/DonutChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";
import { BreakdownTable } from "./BreakdownTable";
import { CalcField } from "./CalcField";
import { CalculatorLayout, ResultCard } from "./CalculatorLayout";

export function SipCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(12);

  const result = useMemo(() => calculateSip(monthly, rate, years), [monthly, rate, years]);
  const gainShare = result.futureValue > 0 ? (result.returns / result.futureValue) * 100 : 0;

  return (
    <CalculatorLayout
      inputs={
        <div className="space-y-8">
          <CalcField
            label="Monthly investment"
            value={monthly}
            min={500}
            max={200000}
            step={500}
            onChange={setMonthly}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Expected annual return"
            value={rate}
            min={1}
            max={30}
            step={0.5}
            onChange={setRate}
            suffix="%"
            hint="Assumed, not guaranteed"
          />
          <CalcField
            label="Investment duration"
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            suffix=" yr"
          />

          <div className="rounded-xl bg-ink-50 p-4">
            <p className="text-xs leading-relaxed text-ink-500">
              Contributions are assumed at the start of each month and the return is applied at a
              constant monthly rate. Real-world returns vary from year to year.
            </p>
          </div>
        </div>
      }
      results={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultCard
              label="Total invested"
              value={<AnimatedNumber value={result.invested} decimals={0} prefix="₹" />}
              hint={`${years * 12} instalments`}
            />
            <ResultCard
              label="Estimated returns"
              value={<AnimatedNumber value={result.returns} decimals={0} prefix="₹" />}
              tone="up"
              hint={`${gainShare.toFixed(1)}% of final value`}
            />
            <ResultCard
              label="Total future value"
              value={<AnimatedNumber value={result.futureValue} decimals={0} prefix="₹" />}
              tone="brand"
              hint={`After ${years} years`}
            />
          </div>

          <ChartContainer title="Projected growth" subtitle="Invested capital against projected value">
            <GrowthChart data={result.breakdown} id="sip" />
          </ChartContainer>

          <ChartContainer title="Composition at maturity">
            <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <DonutChart
                height={190}
                data={[
                  { label: "Invested", value: result.invested, color: "var(--color-ink-300)" },
                  { label: "Returns", value: result.returns, color: "var(--color-brand-500)" },
                ]}
                valueFormatter={(v) => formatCurrency(v, 0)}
                centerLabel="Returns share"
                centerValue={`${gainShare.toFixed(0)}%`}
              />
              <dl className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-2 text-ink-600">
                    <span aria-hidden className="size-2.5 rounded-full bg-ink-300" />
                    Invested
                  </dt>
                  <dd className="tnum font-semibold text-ink-900">{formatCurrency(result.invested, 0)}</dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-2 text-ink-600">
                    <span aria-hidden className="size-2.5 rounded-full bg-brand-500" />
                    Returns
                  </dt>
                  <dd className="tnum font-semibold text-ink-900">{formatCurrency(result.returns, 0)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-sm">
                  <dt className="font-medium text-ink-900">Maturity value</dt>
                  <dd className="tnum font-semibold text-ink-900">
                    {formatCurrency(result.futureValue, 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </ChartContainer>
        </>
      }
      breakdown={<BreakdownTable rows={result.breakdown} />}
    />
  );
}
