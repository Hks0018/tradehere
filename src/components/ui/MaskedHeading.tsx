"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/utils/cn";

/**
 * Editorial headline that reveals one line at a time from behind a mask.
 *
 * Lines are authored explicitly rather than wrapped automatically so the break
 * points stay art-directed. Falls back to plain text under reduced motion, and
 * reveals without waiting when the document is not visible (background tab,
 * print) so the headline can never be stranded off-screen.
 */
export function MaskedHeading({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });
  const reduceMotion = useReducedMotion();
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") setForced(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  const show = inView || forced;

  if (reduceMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={cn("block", lineClassName)}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <span ref={ref} className="block">
        {lines.map((line, i) => (
          <span key={i} className="th-line-mask">
            <motion.span
              className={cn("block", lineClassName)}
              initial={{ y: "108%" }}
              animate={show ? { y: "0%" } : { y: "108%" }}
              transition={{
                duration: forced && !inView ? 0 : 0.82,
                delay: forced && !inView ? 0 : delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
