import Link from "next/link";
import { cn } from "@/utils/cn";

/**
 * Wordmark: an S struck from two mirrored bolt strokes, so it reads as both
 * the initial and a spark. The mark and the trailing "k" it echoes shift
 * between a light-on-void and a deep-on-paper tone as the navbar crosses
 * between environments, rather than sitting fixed against every background.
 *
 * `size="large"` is the navbar's own corner mark — big enough to run past
 * the header's height on purpose, which is why the navbar keeps its
 * dividing line off the logo's column rather than drawing it underneath.
 */
export function Logo({
  onDark = false,
  size = "default",
  className,
}: {
  onDark?: boolean;
  size?: "default" | "large";
  className?: string;
}) {
  const large = size === "large";

  return (
    <Link
      href="/"
      aria-label="Sparkk — home"
      className={cn("group/logo inline-flex items-center", large ? "gap-2" : "gap-1", className)}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("shrink-0", large ? "h-16 w-16" : "h-6 w-6")}
        aria-hidden
        fill="none"
      >
        <path
          d="M19 4H11L5 12H12L5 20H13L19 12H12Z"
          className={cn(
            "transition-[fill,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center group-hover/logo:scale-125",
            onDark ? "fill-spark-400" : "fill-spark-600",
          )}
        />
      </svg>
      <span
        className={cn(
          "font-display font-bold tracking-[-0.03em]",
          large ? "text-[3.25rem]" : "text-[1.1875rem]",
          onDark ? "text-paper-50" : "text-ink-900",
        )}
      >
        spar
        <span
          className={cn(
            "inline-block scale-x-[-1] transition-colors duration-500",
            onDark ? "text-spark-400" : "text-spark-600",
          )}
        >
          k
        </span>
        k
      </span>
    </Link>
  );
}
