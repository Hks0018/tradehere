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
    <section className="overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft">
      <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h3 className="text-base font-semibold text-ink-900">Year-by-year breakdown</h3>
        <span className="text-xs text-ink-400">{rows.length} years</span>
      </header>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Projected value at the end of each year</caption>
          <thead className="sticky top-0 bg-ink-50/95 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider text-ink-500">
              <th scope="col" className="px-5 py-3 text-left font-semibold">Year</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">{investedLabel}</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">{gainLabel}</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                <th scope="row" className="px-5 py-3 text-left font-medium text-ink-900">
                  Year {row.year}
                </th>
                <td className="tnum px-5 py-3 text-right text-ink-600">
                  <span className="sm:hidden">{formatCompactCurrency(row.invested)}</span>
                  <span className="hidden sm:inline">{formatCurrency(row.invested, 0)}</span>
                </td>
                <td className="tnum px-5 py-3 text-right font-medium text-up-600">
                  <span className="sm:hidden">{formatCompactCurrency(row.gain)}</span>
                  <span className="hidden sm:inline">{formatCurrency(row.gain, 0)}</span>
                </td>
                <td className="tnum px-5 py-3 text-right font-semibold text-ink-900">
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
