"use client";

import { useId } from "react";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/utils/cn";

interface CalcFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  accent?: string;
  formatValue?: (value: number) => string;
}

/**
 * Paired number input and slider. Both edit the same value and both are
 * labelled, so keyboard and pointer users get an equivalent experience.
 */
export function CalcField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  prefix,
  suffix,
  hint,
  accent,
  formatValue,
}: CalcFieldProps) {
  const inputId = useId();

  const commit = (raw: number) => {
    if (Number.isNaN(raw)) return;
    onChange(Math.min(Math.max(raw, min), max));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 transition-colors focus-within:border-brand-300",
          )}
        >
          {prefix && <span className="text-sm text-ink-400">{prefix}</span>}
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => commit(Number(e.target.value))}
            className="tnum w-24 bg-transparent text-right text-sm font-semibold text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && <span className="text-sm text-ink-400">{suffix}</span>}
        </div>
      </div>

      <div className="mt-3">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          ariaLabel={label}
          accent={accent}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-ink-400">
        <span className="tnum">{formatValue ? formatValue(min) : `${prefix ?? ""}${min}${suffix ?? ""}`}</span>
        {hint && <span className="px-2 text-center">{hint}</span>}
        <span className="tnum">{formatValue ? formatValue(max) : `${prefix ?? ""}${max}${suffix ?? ""}`}</span>
      </div>
    </div>
  );
}
