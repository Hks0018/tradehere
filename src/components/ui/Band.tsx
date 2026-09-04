import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type Environment = "void" | "paper" | "plain";

const ENVIRONMENTS: Record<Environment, string> = {
  void: "on-void bg-void-950 text-paper-100 selection:bg-paper-100 selection:text-void-950",
  paper: "bg-paper-100 text-ink-900",
  plain: "bg-white text-ink-900",
};

interface BandProps {
  children: ReactNode;
  env?: Environment;
  /** Faint 72px grid, tuned to the environment. */
  grid?: boolean;
  className?: string;
  id?: string;
  as?: "section" | "div" | "header" | "footer";
  ariaLabel?: string;
  /**
   * Marks this band as the dark region the navigation sits over, so the bar
   * inverts itself while the band is in view. Set it on the topmost dark
   * element of a page — never on a mid-page band, or the bar would flip as the
   * reader scrolls past it.
   */
  marksNavDark?: boolean;
}

/**
 * A full-bleed environment block. Alternating these is what gives the site its
 * rhythm — light editorial reading, dark immersive data, plain functional work.
 */
export function Band({
  children,
  env = "plain",
  grid = false,
  className,
  id,
  as: Tag = "section",
  ariaLabel,
  marksNavDark = false,
}: BandProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      data-hero-dark={marksNavDark ? "" : undefined}
      className={cn("relative isolate overflow-hidden", ENVIRONMENTS[env], className)}
    >
      {grid && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            env === "void" ? "th-grid-void" : "th-grid-paper opacity-60",
          )}
        />
      )}
      {children}
    </Tag>
  );
}
