import { SearchX } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-soft">
        <SearchX className="size-5 text-ink-400" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
