import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Stat({
  label,
  value,
  hint,
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 border-t border-ink-200 pt-3.5", className)}>
      <dt className="eyebrow text-ink-400">{label}</dt>
      <dd className={cn("tnum mt-2.5 truncate font-display text-xl font-semibold text-ink-900", valueClassName)}>
        {value}
      </dd>
      {hint && <p className="mt-1 font-mono text-[0.6875rem] text-ink-400">{hint}</p>}
    </div>
  );
}

export function StatGrid({
  children,
  className,
  columns = 4,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-8 gap-y-7",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {children}
    </dl>
  );
}
