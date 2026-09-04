"use client";

import { useMemo, useState } from "react";
import { calculateFd } from "@/utils/finance";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { formatCompactCurrency } from "@/utils/format";
import { BreakdownTable } from "./BreakdownTable";
import { CalcField } from "./CalcField";
import { CalculatorLayout, ResultCard } from "./CalculatorLayout";

const FREQUENCIES = [
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Half-yearly", value: 2 },
  { label: "Annually", value: 1 },
];

export function FdCalculator() {
  const [deposit, setDeposit] = useState(500000);
  const [rate, setRate] = useState(7.4);
  const [years, setYears] = useState(5);
  const [frequency, setFrequency] = useState(4);

  const result = useMemo(
    () => calculateFd(deposit, rate, years, frequency),
    [deposit, rate, years, frequency],
  );

  return (
    <CalculatorLayout
      disclaimer="Indicative only. Deposit rates, premature-withdrawal penalties and applicable taxes are set by the institution and will change the outcome."
      inputs={
        <div className="space-y-8">
          <CalcField
            label="Deposit amount"
            value={deposit}
            min={10000}
            max={20000000}
            step={10000}
            onChange={setDeposit}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Interest rate"
            value={rate}
            min={1}
            max={15}
            step={0.05}
            onChange={setRate}
            suffix="%"
            hint="Annual"
          />
          <CalcField
            label="Duration"
            value={years}
            min={1}
            max={20}
            step={1}
            onChange={setYears}
            suffix=" yr"
          />

          <fieldset>
            <legend className="text-sm font-medium text-ink-700">Compounding frequency</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {FREQUENCIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={frequency === option.value}
                  onClick={() => setFrequency(option.value)}
                  className={`rounded-pill border px-3.5 py-1.5 text-sm transition-colors ${
                    frequency === option.value
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-ink-200 text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      }
      results={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultCard
              label="Deposit amount"
              value={<AnimatedNumber value={result.principal} decimals={0} prefix="₹" />}
            />
            <ResultCard
              label="Interest earned"
              value={<AnimatedNumber value={result.interest} decimals={0} prefix="₹" />}
              tone="up"
              hint={`Over ${years} years`}
            />
            <ResultCard
              label="Maturity amount"
              value={<AnimatedNumber value={result.maturity} decimals={0} prefix="₹" />}
              tone="brand"
            />
          </div>

          <ChartContainer title="Growth of the deposit" subtitle="Principal against maturity value each year">
            <GrowthChart data={result.breakdown} id="fd" investedLabel="Deposit" valueLabel="Value" />
          </ChartContainer>
        </>
      }
      breakdown={<BreakdownTable rows={result.breakdown} investedLabel="Deposit" gainLabel="Interest" valueLabel="Value" />}
    />
  );
}
