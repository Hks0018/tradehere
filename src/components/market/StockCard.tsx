import Link from "next/link";
import type { Stock } from "@/types";
import { Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";

/**
 * A stock in a grid. Anchored by a rule rather than enclosed in a box — the
 * rule darkens on hover, which reads as selection without adding a container.
 */
export function StockCard({ stock, className }: { stock: Stock; className?: string }) {
  return (
    <Link
      href={`/stocks/${stock.symbol}`}
      prefetch={false}
      className={cn(
        "group/card flex flex-col border-t border-ink-200 pt-4 transition-colors hover:border-ink-900",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">
          {stock.symbol}
        </p>
        <Delta value={stock.changePercent} size="xs" />
      </div>

      <p className="mt-3 font-display text-lg font-semibold leading-tight tracking-[-0.025em] text-ink-900 transition-colors group-hover/card:text-brand-600">
        {stock.name}
      </p>

      <div className="mt-4">
        <Sparkline
          data={stock.series}
          trend={stock.changePercent}
          id={`card-${stock.symbol}`}
          width={220}
          height={44}
          className="w-full"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="tnum font-mono text-sm text-ink-900">{formatCurrency(stock.price)}</p>
        <p className="font-mono text-[0.6875rem] text-ink-400">
          {formatCompactCurrency(stock.marketCap)}
        </p>
      </div>
    </Link>
  );
}

/** Compact single-line row for dense lists. */
export function StockRow({ stock, rank }: { stock: Stock; rank?: number }) {
  return (
    <Link
      href={`/stocks/${stock.symbol}`}
      prefetch={false}
      className="group/row grid items-center gap-4 border-b border-ink-100 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto] sm:gap-8"
    >
      {typeof rank === "number" && (
        <span className="tnum hidden font-mono text-xs text-ink-300 sm:block">
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-[0.9375rem] font-medium text-ink-900 transition-colors group-hover/row:text-brand-600">
          {stock.name}
        </span>
        <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-400">{stock.symbol}</span>
      </span>
      <span className="hidden sm:block">
        <Sparkline
          data={stock.series}
          trend={stock.changePercent}
          id={`srow-${stock.symbol}`}
          width={100}
          height={28}
          filled={false}
        />
      </span>
      <span className="flex items-baseline justify-between gap-6 sm:justify-end">
        <span className="tnum font-mono text-sm text-ink-800">{formatCurrency(stock.price)}</span>
        <Delta value={stock.changePercent} size="sm" className="w-24 justify-end" />
      </span>
    </Link>
  );
}
