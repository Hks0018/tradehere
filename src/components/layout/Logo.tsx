import Link from "next/link";
import { cn } from "@/utils/cn";

/**
 * Wordmark: a three-bar ascending mark set tight against the name. The mark is
 * drawn rather than boxed, so it sits comfortably on both environments.
 */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Tradehere — home"
      className={cn("group/logo inline-flex items-baseline gap-2.5", className)}
    >
      <svg viewBox="0 0 22 20" className="h-4 w-[1.375rem] shrink-0 translate-y-px" aria-hidden fill="none">
        <rect x="0" y="11" width="4.5" height="9" rx="0.5" className={onDark ? "fill-paper-300/50" : "fill-ink-300"} />
        <rect x="8.75" y="6" width="4.5" height="14" rx="0.5" className={onDark ? "fill-paper-200/80" : "fill-ink-500"} />
        <rect
          x="17.5"
          y="0"
          width="4.5"
          height="20"
          rx="0.5"
          className="fill-brand-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom group-hover/logo:scale-y-110"
        />
      </svg>
      <span
        className={cn(
          "font-display text-[1.0625rem] font-semibold tracking-[-0.03em]",
          onDark ? "text-paper-50" : "text-ink-900",
        )}
      >
        Tradehere
      </span>
    </Link>
  );
}
