import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Delta } from "./Delta";

type Tone = "neutral" | "brand" | "up" | "down" | "gold" | "outline" | "dark";

const TONES: Record<Tone, string> = {
  neutral: "border-ink-200 text-ink-600",
  brand: "border-brand-200 text-brand-700",
  up: "border-up-100 text-up-700",
  down: "border-down-100 text-down-700",
  gold: "border-gold-100 text-gold-600",
  outline: "border-ink-200 text-ink-500",
  dark: "border-paper-200/25 text-paper-200",
};

/** Flat hairline tag. No fills, no shadows — it should sit quietly in text. */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[0.6875rem] leading-none tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Kept for compatibility with existing call sites; now renders as a `Delta`. */
export function ChangeBadge({
  value,
  className,
  showIcon = true,
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
}) {
  return <Delta value={value} size="sm" showArrow={showIcon} className={className} />;
}
