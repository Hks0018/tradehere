import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Eyebrow } from "./Eyebrow";
import { MaskedHeading } from "./MaskedHeading";
import { Reveal } from "./Reveal";
import { Band, type Environment } from "./Band";

interface PageHeaderProps {
  eyebrow?: string;
  /** An array is treated as art-directed line breaks. */
  title: string | string[];
  description?: string;
  children?: ReactNode;
  /** Renders the "Sample data" marker in the meta row. */
  showDemoBadge?: boolean;
  env?: Environment;
  className?: string;
}

/**
 * Shared page opener. Editorial rather than boxed: numbered marker, masked
 * display headline, standfirst set beside it, and a hairline meta row.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  showDemoBadge = true,
  env = "paper",
  className,
}: PageHeaderProps) {
  const lines = Array.isArray(title) ? title : [title];
  const onVoid = env === "void";

  return (
    <Band
      as="header"
      env={env}
      grid
      marksNavDark={onVoid}
      className={cn("pt-32 pb-14 sm:pt-40 sm:pb-16", className)}
    >
      {onVoid && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] -top-1/2 -z-10 size-[36rem] rounded-full bg-brand-600/15 blur-[140px]"
        />
      )}
      <div className="container-page">
        {eyebrow && <Eyebrow onVoid={onVoid}>{eyebrow}</Eyebrow>}

        <div className="mt-7 grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          <MaskedHeading
            as="h1"
            lines={lines}
            className={cn(
              "font-display text-display-2 text-balance-tight",
              onVoid ? "text-paper-50" : "text-ink-900",
            )}
          />

          {description && (
            <Reveal delay={0.15} y={14} className="lg:pb-2">
              <p
                className={cn(
                  "max-w-xl text-base leading-relaxed sm:text-lg",
                  onVoid ? "text-paper-200/70" : "text-ink-600",
                )}
              >
                {description}
              </p>
            </Reveal>
          )}
        </div>

        {(children || showDemoBadge) && (
          <Reveal delay={0.24} y={12}>
            <div
              className={cn(
                "mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-5",
                onVoid ? "border-paper-200/15" : "border-ink-200",
              )}
            >
              {showDemoBadge && (
                <p
                  className={cn(
                    "eyebrow flex items-center gap-2",
                    onVoid ? "text-paper-300/55" : "text-ink-400",
                  )}
                >
                  <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
                  Sample data
                </p>
              )}
              {children}
            </div>
          </Reveal>
        )}
      </div>
    </Band>
  );
}
