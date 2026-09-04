import type { MarketSentiment } from "@/types";
import { cn } from "@/utils/cn";

/** Semicircular breadth gauge for the sample session. */
export function SentimentGauge({ sentiment }: { sentiment: MarketSentiment }) {
  const radius = 78;
  const circumference = Math.PI * radius;
  const progress = (sentiment.score / 100) * circumference;
  const total = sentiment.advancers + sentiment.decliners + sentiment.unchanged;
  const advancePct = (sentiment.advancers / total) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[13rem]">
        <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`Market sentiment: ${sentiment.label}, ${sentiment.score} out of 100`}>
          <defs>
            <linearGradient id="sentiment-track" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-down-500)" />
              <stop offset="50%" stopColor="var(--color-gold-500)" />
              <stop offset="100%" stopColor="var(--color-up-500)" />
            </linearGradient>
          </defs>
          <path
            d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
            fill="none"
            stroke="var(--color-ink-100)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
            fill="none"
            stroke="url(#sentiment-track)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="tnum font-display text-3xl font-semibold text-ink-900">{sentiment.score}</p>
          <p className="text-xs font-medium text-ink-500">{sentiment.label}</p>
        </div>
      </div>

      <div className="mt-6 w-full">
        <div className="flex h-2 overflow-hidden rounded-full bg-ink-100">
          <span className="bg-up-500" style={{ width: `${advancePct}%` }} aria-hidden />
          <span
            className="bg-down-500"
            style={{ width: `${(sentiment.decliners / total) * 100}%` }}
            aria-hidden
          />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Advancing", value: sentiment.advancers, tone: "text-up-600" },
            { label: "Declining", value: sentiment.decliners, tone: "text-down-600" },
            { label: "Unchanged", value: sentiment.unchanged, tone: "text-ink-500" },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-ink-400">{item.label}</dt>
              <dd className={cn("tnum mt-0.5 text-sm font-semibold", item.tone)}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
