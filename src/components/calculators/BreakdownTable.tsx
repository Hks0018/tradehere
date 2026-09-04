import { formatCompactCurrency, formatCurrency } from "@/utils/format";

export interface BreakdownRow {
  year: number;
  invested: number;
  value: number;
  gain: number;
}

/** Year-by-year table shared by the investment calculators. */
export function BreakdownTable({
  rows,
  investedLabel = "Invested",
  valueLabel = "Value",
  gainLabel = "Returns",
}: {
  rows: BreakdownRow[];
  investedLabel?: string;
  valueLabel?: string;
  gainLabel?: string;
}) {
  return (
    <section>
      <header className="flex items-baseline justify-between border-t border-ink-900 pt-4">
        <h3 className="eyebrow text-ink-400">Year-by-year breakdown</h3>
        <p className="tnum font-mono text-[0.6875rem] text-ink-400">{rows.length} years</p>
      </header>

      <div className="mt-6 max-h-[28rem] overflow-auto">
        <table className="w-full">
          <caption className="sr-only">Projected value at the end of each year</caption>
          <thead className="sticky top-0 bg-white">
            <tr className="eyebrow border-b border-ink-200 text-ink-400">
              <th scope="col" className="py-3 pr-4 text-left">Year</th>
              <th scope="col" className="py-3 pr-4 text-right">{investedLabel}</th>
              <th scope="col" className="py-3 pr-4 text-right">{gainLabel}</th>
              <th scope="col" className="py-3 text-right">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-ink-100">
                <th scope="row" className="py-3.5 pr-4 text-left font-mono text-sm text-ink-500">
                  {String(row.year).padStart(2, "0")}
                </th>
                <td className="tnum py-3.5 pr-4 text-right font-mono text-sm text-ink-600">
                  <span className="sm:hidden">{formatCompactCurrency(row.invested)}</span>
                  <span className="hidden sm:inline">{formatCurrency(row.invested, 0)}</span>
                </td>
                <td className="tnum py-3.5 pr-4 text-right font-mono text-sm text-up-600">
                  <span className="sm:hidden">{formatCompactCurrency(row.gain)}</span>
                  <span className="hidden sm:inline">{formatCurrency(row.gain, 0)}</span>
                </td>
                <td className="tnum py-3.5 text-right font-mono text-sm font-medium text-ink-900">
                  <span className="sm:hidden">{formatCompactCurrency(row.value)}</span>
                  <span className="hidden sm:inline">{formatCurrency(row.value, 0)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
