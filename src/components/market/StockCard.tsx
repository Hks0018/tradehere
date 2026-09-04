import Link from "next/link";
import type { Stock } from "@/types";
import { ChangeBadge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";

/** Card presentation of a stock — used in grids and on mobile lists. */
export function StockCard({ stock, className }: { stock: Stock; className?: string }) {
  return (
    <Link
      href={`/stocks/${stock.symbol}`}
      className={cn(
        "group flex flex-col rounded-card border border-ink-100 bg-white p-4 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-ink-200 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700">
            {stock.name}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            {stock.symbol} · {stock.sector}
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-[0.6875rem] font-bold tracking-tight text-ink-500">
          {stock.symbol.slice(0, 3)}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="tnum text-lg font-semibold text-ink-900">{formatCurrency(stock.price)}</p>
          <p className="mt-1 text-xs text-ink-400">{formatCompactCurrency(stock.marketCap)} m-cap</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ChangeBadge value={stock.changePercent} />
          <Sparkline
            data={stock.series}
            trend={stock.changePercent}
            id={`card-${stock.symbol}`}
            width={92}
            height={30}
            filled={false}
          />
        </div>
      </div>
    </Link>
  );
}

/** Compact single-line row used inside panels and the movers tabs. */
export function StockRow({ stock, rank }: { stock: Stock; rank?: number }) {
  return (
    <Link
      href={`/stocks/${stock.symbol}`}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink-50 sm:gap-4"
    >
      {typeof rank === "number" && (
        <span className="tnum hidden w-5 shrink-0 text-sm font-medium text-ink-300 sm:block">
          {rank}
        </span>
      )}
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-[0.6875rem] font-bold tracking-tight text-ink-500">
        {stock.symbol.slice(0, 3)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink-900 group-hover:text-brand-700">
          {stock.name}
        </span>
        <span className="block truncate text-xs text-ink-400">{stock.symbol}</span>
      </span>
      <Sparkline
        data={stock.series}
        trend={stock.changePercent}
        id={`row-${stock.symbol}`}
        width={72}
        height={26}
        filled={false}
        className="hidden shrink-0 sm:block"
      />
      <span className="shrink-0 text-right">
        <span className="tnum block text-sm font-semibold text-ink-900">
          {formatCurrency(stock.price)}
        </span>
        <span className="mt-0.5 block">
          <ChangeBadge value={stock.changePercent} showIcon={false} className="px-1.5 py-0.5" />
        </span>
      </span>
    </Link>
  );
}
