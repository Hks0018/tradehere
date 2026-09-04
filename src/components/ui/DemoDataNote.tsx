import { cn } from "@/utils/cn";

/** Inline marker making clear that figures on screen are not live. */
export function DemoBadge({ className, label = "Sample data" }: { className?: string; label?: string }) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-2 text-ink-400", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
      {label}
    </span>
  );
}

/**
 * Standing disclaimer. Set as a hairline note rather than a tinted box — it
 * should read as a footnote, not as another card.
 */
export function Disclaimer({
  className,
  onVoid = false,
  text = "Market data shown is sample data for informational and demonstration purposes only. It is not live, not investment advice, and investments are subject to market risks.",
}: {
  className?: string;
  onVoid?: boolean;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 border-t pt-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8",
        onVoid ? "border-paper-200/15" : "border-ink-200",
        className,
      )}
    >
      <p className={cn("eyebrow", onVoid ? "text-paper-300/50" : "text-ink-400")}>Disclaimer</p>
      <p
        className={cn(
          "max-w-3xl text-xs leading-relaxed",
          onVoid ? "text-paper-300/60" : "text-ink-500",
        )}
      >
        {text}
      </p>
    </div>
  );
}
