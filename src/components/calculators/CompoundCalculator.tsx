"use client";

import { useMemo, useState } from "react";
import { calculateCompound } from "@/utils/finance";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";
import { BreakdownTable } from "./BreakdownTable";
import { CalcField } from "./CalcField";
import { CalculatorLayout, ResultCard } from "./CalculatorLayout";

const FREQUENCIES = [
  { label: "Annually", value: 1 },
  { label: "Half-yearly", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
];

export function CompoundCalculator() {
  const [principal, setPrincipal] = useState(200000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(15);
  const [frequency, setFrequency] = useState(1);

  const result = useMemo(
    () => calculateCompound(principal, rate, years, frequency),
    [principal, rate, years, frequency],
  );

  const simpleInterest = (principal * rate * years) / 100;
  const compoundingAdvantage = result.interest - simpleInterest;

  return (
    <CalculatorLayout
      inputs={
        <div className="space-y-8">
          <CalcField
            label="Principal"
            value={principal}
            min={1000}
            max={10000000}
            step={1000}
            onChange={setPrincipal}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Interest rate"
            value={rate}
            min={1}
            max={30}
            step={0.5}
            onChange={setRate}
            suffix="%"
            hint="Assumed annual rate"
          />
          <CalcField
            label="Duration"
            value={years}
            min={1}
            max={40}
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
              label="Principal"
              value={<AnimatedNumber value={result.principal} decimals={0} prefix="₹" />}
            />
            <ResultCard
              label="Interest earned"
              value={<AnimatedNumber value={result.interest} decimals={0} prefix="₹" />}
              tone="up"
            />
            <ResultCard
              label="Final amount"
              value={<AnimatedNumber value={result.maturity} decimals={0} prefix="₹" />}
              tone="brand"
            />
          </div>

          <ChartContainer
            title="Compounding at work"
            subtitle={`Compounding adds ${formatCurrency(compoundingAdvantage, 0)} over simple interest`}
          >
            <GrowthChart data={result.breakdown} id="compound" investedLabel="Principal" valueLabel="Value" />
          </ChartContainer>
        </>
      }
      breakdown={<BreakdownTable rows={result.breakdown} investedLabel="Principal" gainLabel="Interest" valueLabel="Value" />}
    />
  );
}
