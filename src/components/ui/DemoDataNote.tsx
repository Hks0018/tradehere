import { Info } from "lucide-react";
import { cn } from "@/utils/cn";

/** Small inline label making clear that figures on screen are not live. */
export function DemoBadge({ className, label = "Demo Data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-ink-200 bg-ink-50 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
      {label}
    </span>
  );
}

export function Disclaimer({
  className,
  text = "Market data shown is sample data for informational and demonstration purposes only. It is not live, not investment advice, and investments are subject to market risks.",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border border-ink-100 bg-ink-50 px-4 py-3.5 text-sm text-ink-500",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
