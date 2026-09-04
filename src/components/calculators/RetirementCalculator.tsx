"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { calculateRetirement } from "@/utils/finance";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";
import { BreakdownTable } from "./BreakdownTable";
import { CalcField } from "./CalcField";
import { CalculatorLayout, ResultCard } from "./CalculatorLayout";

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(20000);
  const [preReturn, setPreReturn] = useState(12);
  const [postReturn, setPostReturn] = useState(7);
  const [inflation, setInflation] = useState(6);

  const result = useMemo(
    () =>
      calculateRetirement({
        currentAge,
        retirementAge: Math.max(retirementAge, currentAge + 1),
        lifeExpectancy: Math.max(lifeExpectancy, retirementAge + 1),
        monthlyExpense,
        currentSavings,
        monthlyInvestment,
        preReturn,
        postReturn,
        inflation,
      }),
    [
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpense,
      currentSavings,
      monthlyInvestment,
      preReturn,
      postReturn,
      inflation,
    ],
  );

  const onTrack = result.shortfall <= 0;

  return (
    <CalculatorLayout
      disclaimer="A projection based on constant assumed rates for return and inflation. Real returns, inflation, expenses and life circumstances vary. This is not financial advice — consider consulting a qualified adviser."
      inputs={
        <div className="space-y-8">
          <CalcField label="Current age" value={currentAge} min={18} max={59} onChange={setCurrentAge} suffix=" yr" />
          <CalcField
            label="Retirement age"
            value={retirementAge}
            min={Math.min(currentAge + 1, 70)}
            max={75}
            onChange={setRetirementAge}
            suffix=" yr"
          />
          <CalcField
            label="Life expectancy"
            value={lifeExpectancy}
            min={Math.min(retirementAge + 1, 95)}
            max={100}
            onChange={setLifeExpectancy}
            suffix=" yr"
          />
          <CalcField
            label="Monthly expenses today"
            value={monthlyExpense}
            min={10000}
            max={500000}
            step={5000}
            onChange={setMonthlyExpense}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Current savings"
            value={currentSavings}
            min={0}
            max={50000000}
            step={100000}
            onChange={setCurrentSavings}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Monthly investment"
            value={monthlyInvestment}
            min={1000}
            max={500000}
            step={1000}
            onChange={setMonthlyInvestment}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />

          <div className="grid gap-6 border-t border-ink-100 pt-6">
            <CalcField label="Return before retirement" value={preReturn} min={1} max={20} step={0.5} onChange={setPreReturn} suffix="%" />
            <CalcField label="Return after retirement" value={postReturn} min={1} max={15} step={0.5} onChange={setPostReturn} suffix="%" />
            <CalcField label="Inflation" value={inflation} min={1} max={12} step={0.5} onChange={setInflation} suffix="%" />
          </div>
        </div>
      }
      results={
        <>
          <div className="grid gap-8 sm:grid-cols-3">
            <ResultCard
              label="Corpus required"
              value={<AnimatedNumber value={result.corpusRequired} decimals={0} prefix="₹" />}
              tone="brand"
              hint={`At age ${retirementAge}`}
            />
            <ResultCard
              label="Projected corpus"
              value={<AnimatedNumber value={result.projectedCorpus} decimals={0} prefix="₹" />}
              hint={`In ${result.yearsToRetire} years`}
            />
            <ResultCard
              label={onTrack ? "Surplus" : "Shortfall"}
              value={
                <AnimatedNumber
                  value={Math.abs(onTrack ? result.projectedCorpus - result.corpusRequired : result.shortfall)}
                  decimals={0}
                  prefix="₹"
                />
              }
              tone={onTrack ? "up" : "neutral"}
            />
          </div>

          <div
            className={`flex items-start gap-4 border-t-2 pt-5 ${
              onTrack ? "border-up-500" : "border-gold-500"
            }`}
          >
            {onTrack ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-up-600" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
            )}
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {onTrack
                  ? "Your current plan reaches the target"
                  : `A monthly investment of ${formatCurrency(result.suggestedMonthlySip, 0)} would close the gap`}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                Your monthly expenses of {formatCurrency(monthlyExpense, 0)} today are projected to be{" "}
                {formatCurrency(result.monthlyExpenseAtRetirement, 0)} at age {retirementAge} at{" "}
                {inflation}% inflation.
              </p>
            </div>
          </div>

          <ChartContainer title="Accumulation to retirement" subtitle="Contributions plus existing savings, compounded">
            <GrowthChart data={result.breakdown} id="retirement" investedLabel="Contributed" valueLabel="Projected corpus" />
          </ChartContainer>
        </>
      }
      breakdown={<BreakdownTable rows={result.breakdown} investedLabel="Contributed" gainLabel="Growth" valueLabel="Corpus" />}
    />
  );
}
