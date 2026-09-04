import Link from "next/link";
import { cn } from "@/utils/cn";

/** Original wordmark: an ascending bar motif inside a rounded tile. */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Tradehere — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[0.625rem] bg-brand-600 shadow-[0_4px_14px_-4px_rgba(74,63,220,0.7)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none">
          <rect x="4" y="13" width="3.4" height="7" rx="1.2" fill="white" fillOpacity="0.55" />
          <rect x="10.3" y="9" width="3.4" height="11" rx="1.2" fill="white" fillOpacity="0.8" />
          <rect x="16.6" y="4" width="3.4" height="16" rx="1.2" fill="white" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[1.0625rem] font-semibold tracking-[-0.02em]",
          onDark ? "text-white" : "text-ink-900",
        )}
      >
        Tradehere
      </span>
    </Link>
  );
}
