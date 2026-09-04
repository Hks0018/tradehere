import type { Ipo } from "@/types";
import { Delta } from "@/components/ui/Delta";
import { cn } from "@/utils/cn";
import { formatCompactCurrency, formatCurrency, formatShortDate } from "@/utils/format";

const STATUS_STYLE = {
  Open: "text-up-600",
  Upcoming: "text-brand-600",
  Listed: "text-ink-500",
} as const;

/**
 * One offering, set as an editorial entry: status and company first, the
 * numbers as a mono spec row beneath, and the single most useful signal
 * (subscription or performance since listing) given the closing weight.
 */
export function IpoEntry({ ipo, index }: { ipo: Ipo; index: number }) {
  const listingGain =
    ipo.currentPrice != null
      ? ((ipo.currentPrice - ipo.priceBand.max) / ipo.priceBand.max) * 100
      : null;

  return (
    <article className="grid gap-x-10 gap-y-6 border-t border-ink-200 py-8 lg:grid-cols-[3rem_minmax(0,1.5fr)_minmax(0,1fr)] first:border-ink-900">
      <p className="tnum hidden font-mono text-xs text-ink-300 lg:block">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="min-w-0">
        <p className={cn("eyebrow flex items-center gap-2", STATUS_STYLE[ipo.status])}>
          {ipo.status === "Open" && (
            <span aria-hidden className="size-1.5 rounded-full bg-up-500" />
          )}
          {ipo.status}
          <span aria-hidden className="text-ink-200">/</span>
          <span className="text-ink-400">{ipo.sector}</span>
        </p>

        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-[-0.028em] text-ink-900">
          {ipo.company}
        </h3>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-600">{ipo.summary}</p>

        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {[
            { label: "Price band", value: `₹${ipo.priceBand.min}–${ipo.priceBand.max}` },
            { label: "Lot size", value: `${ipo.lotSize} shares` },
            { label: "Issue size", value: formatCompactCurrency(ipo.issueSize) },
            {
              label: ipo.status === "Listed" ? "Listed" : "Open — close",
              value:
                ipo.status === "Listed" && ipo.listingDate
                  ? formatShortDate(ipo.listingDate)
                  : `${formatShortDate(ipo.openDate)} – ${formatShortDate(ipo.closeDate)}`,
            },
          ].map((item) => (
            <div key={item.label}>
              <dt className="eyebrow text-ink-400">{item.label}</dt>
              <dd className="tnum mt-1.5 font-mono text-sm text-ink-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="lg:border-l lg:border-ink-100 lg:pl-10">
        {ipo.status === "Listed" && ipo.currentPrice != null ? (
          <div>
            <p className="eyebrow text-ink-400">Since issue price</p>
            <p className="mt-3">
              <Delta value={listingGain ?? 0} size="lg" className="font-display text-3xl" />
            </p>
            <p className="tnum mt-4 font-mono text-sm text-ink-600">
              Now {formatCurrency(ipo.currentPrice)}
              {ipo.listingPrice != null && ` · listed at ${formatCurrency(ipo.listingPrice)}`}
            </p>
          </div>
        ) : ipo.subscriptionTimes != null ? (
          <div>
            <p className="eyebrow text-ink-400">Subscribed</p>
            <p className="tnum mt-3 font-display text-3xl font-semibold text-up-600">
              {ipo.subscriptionTimes.toFixed(1)}×
            </p>
            <div className="mt-4 h-px w-full bg-ink-200">
              <span
                className="block h-px bg-up-500"
                style={{ width: `${Math.min((ipo.subscriptionTimes / 50) * 100, 100)}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-3 font-mono text-[0.6875rem] text-ink-400">
              Closes {formatShortDate(ipo.closeDate)}
            </p>
          </div>
        ) : (
          <div>
            <p className="eyebrow text-ink-400">Status</p>
            <p className="mt-3 font-display text-xl font-semibold text-ink-900">
              Opens {formatShortDate(ipo.openDate)}
            </p>
            <p className="mt-3 font-mono text-[0.6875rem] text-ink-400">
              Subscription figures publish once the issue opens
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
