import type { MarketIndex } from "@/types";
import { formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

/**
 * Refined index strip. Mono, hairline-separated, and quiet — it reads as a
 * status line rather than a scrolling billboard.
 */
export function MarketTicker({ indices, onDark = false }: { indices: MarketIndex[]; onDark?: boolean }) {
  const items = [...indices, ...indices];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y",
        onDark ? "border-paper-200/12 bg-void-900" : "border-ink-200 bg-white",
      )}
      aria-label="Sample index levels"
    >
      <div className="th-marquee flex w-max items-center py-3">
        {items.map((index, i) => (
          <div
            key={`${index.id}-${i}`}
            aria-hidden={i >= indices.length}
            className={cn(
              "flex shrink-0 items-baseline gap-3 border-r px-6",
              onDark ? "border-paper-200/12" : "border-ink-100",
            )}
          >
            <span
              className={cn(
                "font-mono text-[0.6875rem] uppercase tracking-[0.14em]",
                onDark ? "text-paper-300/50" : "text-ink-400",
              )}
            >
              {index.shortName}
            </span>
            <span className={cn("tnum font-mono text-sm", onDark ? "text-paper-50" : "text-ink-900")}>
              {formatNumber(index.value)}
            </span>
            <span
              className={cn(
                "tnum font-mono text-xs",
                index.changePercent > 0
                  ? onDark
                    ? "text-up-400"
                    : "text-up-600"
                  : onDark
                    ? "text-down-400"
                    : "text-down-600",
              )}
            >
              <span aria-hidden>{index.changePercent > 0 ? "↑" : "↓"}</span>{" "}
              {index.changePercent > 0 ? "+" : ""}
              {index.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r",
          onDark ? "from-void-900 to-transparent" : "from-white to-transparent",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l",
          onDark ? "from-void-900 to-transparent" : "from-white to-transparent",
        )}
      />
    </div>
  );
}
