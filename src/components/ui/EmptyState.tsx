import type { ReactNode } from "react";

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters or search term.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-t border-ink-900 py-20 text-center">
      <p className="eyebrow text-ink-400">Nothing here</p>
      <h3 className="mt-4 font-display text-headline font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
