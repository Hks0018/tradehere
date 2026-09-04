"use client";

import { useId } from "react";
import { cn } from "@/utils/cn";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
  accent?: string;
}

/**
 * Native range input styled with an accent-filled track — keeps full keyboard
 * and screen-reader support for free.
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  className,
  accent = "var(--color-brand-600)",
}: SliderProps) {
  const id = useId();
  const percent = ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100;

  return (
    <>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("th-slider w-full", className)}
        style={
          {
            "--fill": `${percent}%`,
            "--accent": accent,
          } as React.CSSProperties
        }
      />
    </>
  );
}
