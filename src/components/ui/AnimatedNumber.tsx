"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  /** Formats the tweened value; defaults to Indian-locale grouping. */
  format?: (value: number) => string;
}

/**
 * Counts up to `value` when scrolled into view.
 *
 * The tween writes straight into the DOM node rather than through React state,
 * so a 60fps count-up costs no re-renders. The server (and reduced-motion)
 * output is the final value, which keeps the markup correct for crawlers and
 * assistive technology.
 */
export function AnimatedNumber({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  duration = 1.1,
  className,
  format,
}: AnimatedNumberProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapperRef, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();

  const formatValue = (input: number) =>
    format
      ? format(input)
      : new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(input);

  useEffect(() => {
    const node = valueRef.current;
    if (!node) return;

    const write = (input: number) => {
      node.textContent = format
        ? format(input)
        : new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(input);
    };

    if (reduceMotion || !inView) {
      write(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: write,
    });
    return () => controls.stop();
  }, [value, inView, reduceMotion, duration, decimals, format]);

  return (
    <span ref={wrapperRef} className={cn("tnum", className)}>
      {prefix}
      <span ref={valueRef}>{formatValue(value)}</span>
      {suffix}
    </span>
  );
}
