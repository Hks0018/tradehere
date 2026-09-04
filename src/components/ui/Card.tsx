import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
  as?: "div" | "article" | "section" | "li";
}

/**
 * Retained for the few places where genuine containment aids comprehension.
 * Flat by default — a hairline, no shadow. Prefer rules and typography.
 */
export function Card({
  children,
  className,
  interactive = false,
  padded = true,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-ink-200 bg-white",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ink-900",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
