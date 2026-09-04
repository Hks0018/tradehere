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
  ariaLabel: string;
}

/**
 * Accessible tab list. Arrow keys move between tabs; the active indicator is a
 * shared layout element so it glides rather than jumps.
 */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  variant = "pill",
  className,
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

  if (variant === "underline") {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn("no-scrollbar hide-scrollbar-webkit flex gap-1 overflow-x-auto border-b border-ink-100", className)}
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
                "relative shrink-0 px-4 pb-3 pt-2 text-sm font-medium transition-colors",
                active ? "text-ink-900" : "text-ink-500 hover:text-ink-700",
                size === "sm" && "text-[0.8125rem] px-3",
              )}
            >
              {option.label}
              {typeof option.count === "number" && (
                <span className="ml-1.5 text-xs text-ink-400">{option.count}</span>
              )}
              {active &&
                (reduceMotion ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                ) : (
                  <motion.span
                    layoutId={`underline-${layoutId}`}
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ))}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar hide-scrollbar-webkit inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-ink-100 bg-ink-50 p-1",
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
              "relative shrink-0 rounded-pill font-medium transition-colors",
              size === "sm" ? "px-3.5 py-1.5 text-[0.8125rem]" : "px-4.5 py-2 text-sm",
              active ? "text-ink-900" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {active &&
              (reduceMotion ? (
                <span className="absolute inset-0 rounded-pill bg-white shadow-soft" />
              ) : (
                <motion.span
                  layoutId={`pill-${layoutId}`}
                  className="absolute inset-0 rounded-pill bg-white shadow-soft"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ))}
            <span className="relative flex items-center gap-1.5">
              {option.label}
              {typeof option.count === "number" && (
                <span className={cn("text-xs", active ? "text-ink-400" : "text-ink-400")}>
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
