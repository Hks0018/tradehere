import Link from "next/link";
import type { MarketIndex } from "@/types";
import { Sparkline } from "@/components/ui/Sparkline";
import { ChangeBadge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/cn";
import { formatNumber, formatSigned, trendClass } from "@/utils/format";

export function IndexCard({
  index,
  href = "/markets#indices",
  className,
}: {
  index: MarketIndex;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-card border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-ink-200 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{index.name}</p>
          <p className="mt-0.5 text-xs text-ink-400">
            {index.region === "India" ? "Indian market" : "Global market"}
          </p>
        </div>
        <ChangeBadge value={index.changePercent} />
      </div>

      <p className="mt-4 tnum font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900">
        <AnimatedNumber value={index.value} />
      </p>
      <p className={cn("mt-1 tnum text-sm font-medium", trendClass(index.change))}>
        {formatSigned(index.change)} today
      </p>

      <div className="mt-4 -mx-1">
        <Sparkline
          data={index.series}
          trend={index.changePercent}
          id={`index-${index.id}`}
          width={260}
          height={52}
          className="w-full"
        />
      </div>

      <dl className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
        <div className="flex gap-1.5">
          <dt className="text-ink-400">Low</dt>
          <dd className="tnum font-medium text-ink-600">{formatNumber(index.dayLow)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-ink-400">High</dt>
          <dd className="tnum font-medium text-ink-600">{formatNumber(index.dayHigh)}</dd>
        </div>
      </dl>
    </Link>
  );
}
