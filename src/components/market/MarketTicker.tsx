import type { MarketIndex } from "@/types";
import { formatNumber, formatPercent, trendClass } from "@/utils/format";
import { cn } from "@/utils/cn";

/** Continuously scrolling index strip. Duplicated once for a seamless loop. */
export function MarketTicker({ indices, onDark = false }: { indices: MarketIndex[]; onDark?: boolean }) {
  const items = [...indices, ...indices];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y",
        onDark ? "border-white/10 bg-white/[0.03]" : "border-ink-100 bg-ink-50/70",
      )}
      aria-label="Sample index levels"
    >
      <div className="th-marquee flex w-max items-center gap-8 py-2.5">
        {items.map((index, i) => (
          <div
            key={`${index.id}-${i}`}
            aria-hidden={i >= indices.length}
            className="flex shrink-0 items-center gap-2 px-1 text-sm"
          >
            <span className={cn("font-medium", onDark ? "text-ink-300" : "text-ink-600")}>
              {index.shortName}
            </span>
            <span className={cn("tnum", onDark ? "text-white" : "text-ink-900")}>
              {formatNumber(index.value)}
            </span>
            <span className={cn("tnum text-xs font-semibold", trendClass(index.changePercent))}>
              {formatPercent(index.changePercent)}
            </span>
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r",
          onDark ? "from-ink-950 to-transparent" : "from-white to-transparent",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l",
          onDark ? "from-ink-950 to-transparent" : "from-white to-transparent",
        )}
      />
    </div>
  );
}
