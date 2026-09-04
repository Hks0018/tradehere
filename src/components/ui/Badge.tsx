import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "brand" | "up" | "down" | "gold" | "outline" | "dark";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink-50 text-ink-600 border-ink-100",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  up: "bg-up-50 text-up-700 border-up-100",
  down: "bg-down-50 text-down-700 border-down-100",
  gold: "bg-gold-100 text-gold-600 border-gold-100",
  outline: "bg-transparent text-ink-600 border-ink-200",
  dark: "bg-white/10 text-white border-white/20",
};

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
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Coloured percentage pill used across market surfaces. */
export function ChangeBadge({
  value,
  className,
  showIcon = true,
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
}) {
  const tone: Tone = value > 0 ? "up" : value < 0 ? "down" : "neutral";
  return (
    <Badge tone={tone} className={cn("tnum font-semibold", className)}>
      {showIcon && (
        <span aria-hidden className="text-[0.65rem] leading-none">
          {value > 0 ? "▲" : value < 0 ? "▼" : "■"}
        </span>
      )}
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}%
    </Badge>
  );
}
