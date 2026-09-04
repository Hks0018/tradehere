import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ChartContainerProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ChartContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: ChartContainerProps) {
  return (
    <section className={cn("rounded-card border border-ink-100 bg-white shadow-soft", className)}>
      {(title || actions) && (
        <header className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold text-ink-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
