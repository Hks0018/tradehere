import type { ReactNode } from "react";
import { Disclaimer } from "@/components/ui/DemoDataNote";

/**
 * Shared two-column calculator frame: inputs on the left, results and charts on
 * the right. Collapses to a single column below the large breakpoint.
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
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <section
          aria-label="Calculator inputs"
          className="rounded-card border border-ink-100 bg-white p-5 shadow-soft sm:p-6"
        >
          {inputs}
        </section>
        <section aria-label="Results" className="space-y-4">
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
  const tones = {
    neutral: "border-ink-100 bg-white",
    brand: "border-brand-100 bg-brand-50",
    up: "border-up-100 bg-up-50",
  } as const;

  return (
    <div className={`rounded-card border p-5 shadow-soft ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
      <p className="tnum mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
