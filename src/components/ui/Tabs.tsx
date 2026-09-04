"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/utils/cn";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  variant?: "pill" | "underline";
  className?: string;
  onVoid?: boolean;
  ariaLabel: string;
}

/**
 * Type-led tabs. The `pill` variant is now a hairline-free inline set with a
 * sliding rule beneath it — no chips, no filled backgrounds.
 */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  variant = "pill",
  className,
  onVoid = false,
  ariaLabel,
}: TabsProps<T>) {
  const layoutId = useId();
  const reduceMotion = useReducedMotion();

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
    (buttons?.[next] as HTMLButtonElement | undefined)?.focus();
  };

  const underlineTrack = variant === "underline";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar hide-scrollbar-webkit flex overflow-x-auto",
        underlineTrack && (onVoid ? "border-b border-paper-200/15" : "border-b border-ink-200"),
        size === "sm" ? "gap-6" : "gap-7",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative shrink-0 whitespace-nowrap pb-3 font-medium transition-colors",
              size === "sm" ? "text-sm" : "text-[0.9375rem]",
              onVoid
                ? active
                  ? "text-paper-50"
                  : "text-paper-300/55 hover:text-paper-100"
                : active
                  ? "text-ink-900"
                  : "text-ink-400 hover:text-ink-700",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span className="tnum ml-1.5 font-mono text-[0.6875rem] opacity-60">
                {option.count}
              </span>
            )}
            {active &&
              (reduceMotion ? (
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-0.5",
                    onVoid ? "bg-paper-50" : "bg-ink-900",
                  )}
                />
              ) : (
                <motion.span
                  layoutId={`tab-${layoutId}`}
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-0.5",
                    onVoid ? "bg-paper-50" : "bg-ink-900",
                  )}
                  transition={{ type: "spring", stiffness: 480, damping: 38 }}
                />
              ))}
          </button>
        );
      })}
    </div>
  );
}
