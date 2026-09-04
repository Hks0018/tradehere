import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Disclaimer } from "@/components/ui/DemoDataNote";

/**
 * Two-column calculator frame: inputs on the left against a hairline, results
 * and charts on the right. No cards — the numbers are the interface.
 */
export function CalculatorLayout({
  inputs,
  results,
  breakdown,
  disclaimer,
}: {
  inputs: ReactNode;
  results: ReactNode;
  breakdown?: ReactNode;
  disclaimer?: string;
}) {
  return (
    <div className="space-y-16">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <section aria-label="Calculator inputs" className="border-t border-ink-900 pt-8">
          <h2 className="eyebrow mb-8 text-ink-400">Inputs</h2>
          {inputs}
        </section>
        <section aria-label="Results" className="space-y-14">
          {results}
        </section>
      </div>
      {breakdown}
      <Disclaimer
        text={
          disclaimer ??
          "This calculator is an illustration based on the inputs you provide and a constant assumed rate. Actual returns vary, are not guaranteed, and investments are subject to market risks."
        }
      />
    </div>
  );
}

/**
 * A single headline figure. `brand` marks the answer the user came for, and is
 * set larger than the supporting numbers.
 */
export function ResultCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "brand" | "up";
  hint?: string;
}) {
  const isPrimary = tone === "brand";

  return (
    <div
      className={cn(
        "border-t pt-4",
        isPrimary ? "border-ink-900" : "border-ink-200",
      )}
    >
      <p
        className={cn(
          "eyebrow",
          isPrimary ? "text-brand-600" : tone === "up" ? "text-up-600" : "text-ink-400",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "tnum mt-4 font-display font-semibold tracking-[-0.03em] text-ink-900",
          isPrimary ? "text-data-lg" : "text-3xl",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 font-mono text-[0.6875rem] text-ink-400">{hint}</p>}
    </div>
  );
}
