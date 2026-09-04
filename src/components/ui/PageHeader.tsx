import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Reveal } from "./Reveal";
import { DemoBadge } from "./DemoDataNote";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  showDemoBadge?: boolean;
  className?: string;
}

/** Shared top-of-page band used by every inner route. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  showDemoBadge = true,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-ink-100 bg-ink-50/60 pt-28 pb-12 sm:pt-32 sm:pb-16",
        className,
      )}
    >
      <div aria-hidden className="th-dot-bg pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] size-[26rem] rounded-full bg-brand-100/50 blur-3xl"
      />
      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                {eyebrow}
              </p>
            )}
            {showDemoBadge && <DemoBadge />}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-ink-900 text-balance-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
              {description}
            </p>
          )}
        </Reveal>
        {children && <Reveal delay={0.08} className="mt-8">{children}</Reveal>}
      </div>
    </header>
  );
}
