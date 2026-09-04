"use client";

import { useMemo, useState } from "react";
import { calculateEmi } from "@/utils/finance";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DonutChart } from "@/components/charts/DonutChart";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";
import { CalcField } from "./CalcField";
import { CalculatorLayout, ResultCard } from "./CalculatorLayout";

export function EmiCalculator() {
  const [amount, setAmount] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const result = useMemo(() => calculateEmi(amount, rate, years), [amount, rate, years]);
  const interestShare = (result.totalInterest / result.totalPayment) * 100;

  return (
    <CalculatorLayout
      disclaimer="This is an indicative calculation. Actual loan terms, processing fees, insurance and rate resets are set by the lender and will change the outcome."
      inputs={
        <div className="space-y-8">
          <CalcField
            label="Loan amount"
            value={amount}
            min={50000}
            max={50000000}
            step={50000}
            onChange={setAmount}
            prefix="₹"
            formatValue={(v) => formatCompactCurrency(v)}
          />
          <CalcField
            label="Interest rate"
            value={rate}
            min={1}
            max={24}
            step={0.05}
            onChange={setRate}
            suffix="%"
            hint="Annual, reducing balance"
          />
          <CalcField
            label="Loan duration"
            value={years}
            min={1}
            max={30}
            step={1}
            onChange={setYears}
            suffix=" yr"
          />
        </div>
      }
      results={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultCard
              label="Monthly EMI"
              value={<AnimatedNumber value={result.emi} decimals={0} prefix="₹" />}
              tone="brand"
              hint={`${years * 12} instalments`}
            />
            <ResultCard
              label="Total interest"
              value={<AnimatedNumber value={result.totalInterest} decimals={0} prefix="₹" />}
              hint={`${interestShare.toFixed(1)}% of total outflow`}
            />
            <ResultCard
              label="Total payment"
              value={<AnimatedNumber value={result.totalPayment} decimals={0} prefix="₹" />}
              hint="Principal plus interest"
            />
          </div>

          <ChartContainer title="Where each rupee goes">
            <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <DonutChart
                height={190}
                data={[
                  { label: "Principal", value: result.principal, color: "var(--color-brand-500)" },
                  { label: "Interest", value: result.totalInterest, color: "var(--color-down-500)" },
                ]}
                valueFormatter={(v) => formatCurrency(v, 0)}
                centerLabel="Interest share"
                centerValue={`${interestShare.toFixed(0)}%`}
              />
              <dl className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-2 text-ink-600">
                    <span aria-hidden className="size-2.5 rounded-full bg-brand-500" />
                    Principal
                  </dt>
                  <dd className="tnum font-semibold text-ink-900">{formatCurrency(result.principal, 0)}</dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-2 text-ink-600">
                    <span aria-hidden className="size-2.5 rounded-full bg-down-500" />
                    Interest
                  </dt>
                  <dd className="tnum font-semibold text-ink-900">
                    {formatCurrency(result.totalInterest, 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </ChartContainer>
        </>
      }
      breakdown={
        <section className="overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft">
          <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h3 className="text-base font-semibold text-ink-900">Amortisation by year</h3>
            <span className="text-xs text-ink-400">{result.schedule.length} years</span>
          </header>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Principal and interest paid each year with closing balance</caption>
              <thead className="sticky top-0 bg-ink-50/95 backdrop-blur">
                <tr className="text-xs uppercase tracking-wider text-ink-500">
                  <th scope="col" className="px-5 py-3 text-left font-semibold">Year</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Principal paid</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Interest paid</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                    <th scope="row" className="px-5 py-3 text-left font-medium text-ink-900">
                      Year {row.year}
                    </th>
                    <td className="tnum px-5 py-3 text-right text-ink-600">
                      {formatCompactCurrency(row.principalPaid)}
                    </td>
                    <td className="tnum px-5 py-3 text-right text-down-600">
                      {formatCompactCurrency(row.interestPaid)}
                    </td>
                    <td className="tnum px-5 py-3 text-right font-semibold text-ink-900">
                      {formatCompactCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
    />
  );
}
