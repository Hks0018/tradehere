import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a lift-on-hover treatment for interactive cards. */
  interactive?: boolean;
  padded?: boolean;
  as?: "div" | "article" | "section" | "li";
}

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
        "rounded-card border border-ink-100 bg-white shadow-soft",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-ink-200 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
