import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Mono section marker — an optional two-digit index, a hairline, and a label.
 * Used at the top of every major section to number the narrative.
 */
export function Eyebrow({
  children,
  index,
  onVoid = false,
  className,
}: {
  children: ReactNode;
  index?: string;
  onVoid?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "eyebrow flex items-center gap-3",
        onVoid ? "text-paper-300/70" : "text-ink-500",
        className,
      )}
    >
      {index && (
        <span className={onVoid ? "text-brand-300" : "text-brand-600"}>{index}</span>
      )}
      <span
        aria-hidden
        className={cn("h-px w-8", onVoid ? "bg-paper-300/30" : "bg-ink-200")}
      />
      <span>{children}</span>
    </p>
  );
}
