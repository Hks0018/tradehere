import { cn } from "@/utils/cn";

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  xs: "text-[0.6875rem]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

function tone(value: number, onVoid: boolean) {
  if (value > 0) return onVoid ? "text-up-400" : "text-up-600";
  if (value < 0) return onVoid ? "text-down-400" : "text-down-600";
  return onVoid ? "text-paper-300/70" : "text-ink-500";
}

/**
 * Percentage movement. Direction is carried by an arrow glyph and an explicit
 * sign as well as by colour, so it survives greyscale and colour blindness.
 */
export function Delta({
  value,
  size = "md",
  onVoid = false,
  showArrow = true,
  suffix = "%",
  className,
}: {
  value: number;
  size?: Size;
  onVoid?: boolean;
  showArrow?: boolean;
  suffix?: string;
  className?: string;
}) {
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const label = value > 0 ? "up" : value < 0 ? "down" : "unchanged";

  return (
    <span
      className={cn("tnum inline-flex items-baseline gap-1 font-mono font-medium", SIZES[size], tone(value, onVoid), className)}
    >
      {showArrow && (
        <span aria-hidden className="not-italic">
          {arrow}
        </span>
      )}
      <span className="sr-only">{label} </span>
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}
