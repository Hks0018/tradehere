import Link from "next/link";
import { cn } from "@/utils/cn";

/**
 * Wordmark: a bolt mark set tight against the name, with the trailing "k"
 * mirrored and carried in the same accent — a small echo of the mark rather
 * than a second logo.
 */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Sparkk — home"
      className={cn("group/logo inline-flex items-baseline gap-2", className)}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 translate-y-px" aria-hidden fill="none">
        <path
          d="M13 2L3 14H10L9 22L19 10H12L13 2Z"
          className="fill-spark-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center group-hover/logo:scale-110"
        />
      </svg>
      <span
        className={cn(
          "font-display text-[1.0625rem] font-semibold tracking-[-0.03em]",
          onDark ? "text-paper-50" : "text-ink-900",
        )}
      >
        spar
        <span className="inline-block scale-x-[-1] text-spark-500">k</span>
        k
      </span>
    </Link>
  );
}
