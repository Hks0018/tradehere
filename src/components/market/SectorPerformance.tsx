import type { Sector } from "@/types";
import { cn } from "@/utils/cn";
import { formatPercent, trendClass } from "@/utils/format";

/** Horizontal bar list showing each sector's move around a zero centre line. */
export function SectorPerformance({ sectors }: { sectors: Sector[] }) {
  const max = Math.max(...sectors.map((s) => Math.abs(s.changePercent)), 1);

  return (
    <ul className="space-y-1">
      {sectors.map((sector) => {
        const width = (Math.abs(sector.changePercent) / max) * 50;
        const positive = sector.changePercent >= 0;
        return (
          <li
            key={sector.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink-50 sm:grid-cols-[minmax(0,11rem)_1fr_auto] sm:gap-4"
          >
            <span className="truncate text-sm font-medium text-ink-800">{sector.name}</span>

            <span className="relative hidden h-2 rounded-full bg-ink-50 sm:block">
              <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink-200" />
              <span
                className={cn(
                  "absolute inset-y-0 rounded-full",
                  positive ? "left-1/2 bg-up-500" : "right-1/2 bg-down-500",
                )}
                style={{ width: `${width}%` }}
              />
            </span>

            <span className="flex items-center gap-3">
              <span className="hidden text-xs text-ink-400 md:block">
                {sector.advancers}↑ {sector.decliners}↓
              </span>
              <span className={cn("tnum w-16 text-right text-sm font-semibold", trendClass(sector.changePercent))}>
                {formatPercent(sector.changePercent)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
