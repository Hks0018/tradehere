import { CalendarDays, Package, TrendingUp } from "lucide-react";
import type { Ipo } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency, formatShortDate, trendClass } from "@/utils/format";

const STATUS_TONE = {
  Open: "up",
  Upcoming: "brand",
  Listed: "neutral",
} as const;

export function IpoCard({ ipo }: { ipo: Ipo }) {
  const listingGain =
    ipo.listingPrice && ipo.currentPrice
      ? ((ipo.currentPrice - ipo.priceBand.max) / ipo.priceBand.max) * 100
      : null;

  return (
    <article className="flex h-full flex-col rounded-card border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-900">{ipo.company}</h3>
          <p className="mt-1 text-xs text-ink-400">{ipo.sector}</p>
        </div>
        <Badge tone={STATUS_TONE[ipo.status]}>
          {ipo.status === "Open" && <span aria-hidden className="size-1.5 rounded-full bg-up-500" />}
          {ipo.status}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-500">{ipo.summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-ink-100 pt-4 text-sm">
        <div>
          <dt className="text-xs text-ink-400">Price band</dt>
          <dd className="tnum mt-0.5 font-semibold text-ink-900">
            ₹{ipo.priceBand.min} – ₹{ipo.priceBand.max}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Lot size</dt>
          <dd className="tnum mt-0.5 font-semibold text-ink-900">
            <Package className="mr-1 inline size-3.5 text-ink-300" aria-hidden />
            {ipo.lotSize} shares
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Issue size</dt>
          <dd className="tnum mt-0.5 font-semibold text-ink-900">
            {formatCompactCurrency(ipo.issueSize)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">
            {ipo.status === "Listed" ? "Listed on" : "Open — Close"}
          </dt>
          <dd className="tnum mt-0.5 font-semibold text-ink-900">
            <CalendarDays className="mr-1 inline size-3.5 text-ink-300" aria-hidden />
            {ipo.status === "Listed" && ipo.listingDate
              ? formatShortDate(ipo.listingDate)
              : `${formatShortDate(ipo.openDate)} – ${formatShortDate(ipo.closeDate)}`}
          </dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        {ipo.status === "Listed" && ipo.currentPrice ? (
          <div className="flex items-center justify-between rounded-xl bg-ink-50/70 px-3.5 py-3">
            <div>
              <p className="text-xs text-ink-400">Current price</p>
              <p className="tnum mt-0.5 text-sm font-semibold text-ink-900">
                {formatCurrency(ipo.currentPrice)}
              </p>
            </div>
            {listingGain !== null && (
              <div className="text-right">
                <p className="text-xs text-ink-400">Vs issue price</p>
                <p className={cn("tnum mt-0.5 text-sm font-semibold", trendClass(listingGain))}>
                  {listingGain > 0 ? "+" : ""}
                  {listingGain.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        ) : ipo.subscriptionTimes ? (
          <div className="rounded-xl bg-ink-50/70 px-3.5 py-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <TrendingUp className="size-3.5" aria-hidden />
                Subscription
              </p>
              <p className="tnum text-sm font-semibold text-up-600">
                {ipo.subscriptionTimes.toFixed(1)}x
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
              <span
                className="block h-full rounded-full bg-up-500"
                style={{ width: `${Math.min((ipo.subscriptionTimes / 50) * 100, 100)}%` }}
                aria-hidden
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-200 px-3.5 py-3 text-center text-xs text-ink-400">
            Subscription opens {formatShortDate(ipo.openDate)}
          </div>
        )}
      </div>
    </article>
  );
}
