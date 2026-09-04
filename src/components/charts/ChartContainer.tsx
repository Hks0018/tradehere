import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Chart frame. A hairline and a label — no border box, no shadow, so the data
 * itself is the only thing with visual weight.
 */
export function ChartContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border-t border-ink-900 pt-5", className)}>
      {(title || actions) && (
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            {title && <h3 className="eyebrow text-ink-500">{title}</h3>}
            {subtitle && <p className="mt-2 text-sm text-ink-600">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
