import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Eyebrow } from "./Eyebrow";
import { MaskedHeading } from "./MaskedHeading";
import { Reveal } from "./Reveal";

/**
 * Editorial section opener: numbered marker, masked display headline, and an
 * optional standfirst set beside rather than beneath it.
 */
export function SectionIntro({
  index,
  eyebrow,
  lines,
  standfirst,
  action,
  onVoid = false,
  align = "split",
  size = "display-3",
  className,
}: {
  index?: string;
  eyebrow: string;
  lines: string[];
  standfirst?: ReactNode;
  action?: ReactNode;
  onVoid?: boolean;
  align?: "split" | "stack";
  size?: "display-2" | "display-3";
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal y={12}>
        <Eyebrow index={index} onVoid={onVoid}>
          {eyebrow}
        </Eyebrow>
      </Reveal>

      <div
        className={cn(
          "mt-6 gap-x-12 gap-y-6",
          align === "split" ? "grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end" : "",
        )}
      >
        <MaskedHeading
          lines={lines}
          className={cn(
            "font-display text-balance-tight",
            size === "display-2" ? "text-display-2" : "text-display-3",
            onVoid ? "text-paper-50" : "text-ink-900",
          )}
        />

        {(standfirst || action) && (
          <Reveal delay={0.12} y={14} className={align === "split" ? "lg:pb-2" : "mt-6 max-w-xl"}>
            {standfirst && (
              <p
                className={cn(
                  "text-base leading-relaxed sm:text-lg",
                  onVoid ? "text-paper-200/70" : "text-ink-600",
                )}
              >
                {standfirst}
              </p>
            )}
            {action && <div className="mt-6">{action}</div>}
          </Reveal>
        )}
      </div>
    </div>
  );
}
