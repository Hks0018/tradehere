import Link from "next/link";
import type { MarketIndex } from "@/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { Reveal } from "@/components/ui/Reveal";
import { formatNumber, formatSigned } from "@/utils/format";
import { describeQuote } from "@/utils/provenance";

/** One honest line about where an index's level came from. */
function freshnessLabel(index: MarketIndex): string {
  return index.meta
    ? describeQuote(index.meta)
    : "Sample close · not a live quote";
}

/**
 * Indices with hierarchy rather than uniformity: the benchmark is set at
 * display scale, two majors sit beside it, and the remainder run as a compact
 * hairline table.
 */
export function IndexBoard({ indices }: { indices: MarketIndex[] }) {
  const [benchmark, second, third, ...rest] = indices;
  const majors = [second, third].filter(Boolean);

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        {benchmark && (
          <Reveal y={20}>
            <article className="border-t-2 border-ink-900 pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
                  {benchmark.name}
                </h3>
                <Delta value={benchmark.changePercent} />
              </div>

              <p className="tnum mt-6 font-display text-data-xl font-semibold text-ink-900">
                <AnimatedNumber value={benchmark.value} />
              </p>
              <p className="tnum mt-2 font-mono text-sm text-ink-500">
                {formatSigned(benchmark.change)} today
              </p>
              <p className="eyebrow mt-1 text-ink-400">{freshnessLabel(benchmark)}</p>

              <div className="mt-7">
                <Sparkline
                  data={benchmark.series}
                  trend={benchmark.changePercent}
                  id={`board-${benchmark.id}`}
                  width={640}
                  height={96}
                  className="w-full"
                />
              </div>

              <dl className="mt-6 flex gap-10 border-t border-ink-200 pt-4 font-mono text-xs">
                <div className="flex gap-2">
                  <dt className="text-ink-400">Day low</dt>
                  <dd className="tnum text-ink-700">{formatNumber(benchmark.dayLow)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink-400">Day high</dt>
                  <dd className="tnum text-ink-700">{formatNumber(benchmark.dayHigh)}</dd>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <dt className="text-ink-400">Prev close</dt>
                  <dd className="tnum text-ink-700">{formatNumber(benchmark.previousClose)}</dd>
                </div>
              </dl>
            </article>
          </Reveal>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
          {majors.map((index, i) => (
            <Reveal key={index.id} delay={0.08 * (i + 1)} y={18}>
              <article className="border-t border-ink-900 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-base font-semibold text-ink-900">{index.name}</h3>
                  <Delta value={index.changePercent} size="sm" />
                </div>
                <p className="tnum mt-3 font-display text-data-lg font-semibold text-ink-900">
                  <AnimatedNumber value={index.value} />
                </p>
                <p className="eyebrow mt-1 text-ink-400">{freshnessLabel(index)}</p>
                <div className="mt-4">
                  <Sparkline
                    data={index.series}
                    trend={index.changePercent}
                    id={`board-${index.id}`}
                    width={320}
                    height={48}
                    className="w-full"
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <Reveal delay={0.12} y={16}>
          <table className="mt-16 w-full">
            <caption className="eyebrow border-t border-ink-900 py-4 text-left text-ink-400">
              Other markets
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Index</th>
                <th scope="col">Region</th>
                <th scope="col">Level</th>
                <th scope="col">Change</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((index) => (
                <tr key={index.id} className="border-t border-ink-100" title={freshnessLabel(index)}>
                  <th scope="row" className="py-4 pr-4 text-left text-sm font-medium text-ink-900">
                    <Link href="#indices" className="hover:text-brand-600">
                      {index.name}
                    </Link>
                  </th>
                  <td className="hidden py-4 pr-4 font-mono text-[0.6875rem] uppercase tracking-wider text-ink-400 sm:table-cell">
                    {index.region}
                  </td>
                  <td className="tnum py-4 pr-4 text-right font-mono text-sm text-ink-800">
                    {formatNumber(index.value)}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <Delta value={index.changePercent} size="sm" className="justify-end" />
                  </td>
                  <td className="hidden py-4 text-right md:table-cell">
                    <span className="flex justify-end">
                      <Sparkline
                        data={index.series}
                        trend={index.changePercent}
                        id={`board-row-${index.id}`}
                        width={96}
                        height={26}
                        filled={false}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      )}
    </div>
  );
}
