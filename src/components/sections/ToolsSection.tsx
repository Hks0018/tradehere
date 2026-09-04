import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CalculatorMeta } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function ToolsSection({ calculators }: { calculators: CalculatorMeta[] }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Financial tools"
          title="Numbers you can actually run"
          description="Every calculator here works. Change an input and the projection, the chart and the year-by-year breakdown update immediately."
          action={<Button href="/tools" variant="secondary">See all tools</Button>}
        />

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calculator) => (
            <RevealItem key={calculator.id} className="h-full">
              <Link
                href={`/tools/${calculator.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-400 group-hover:scale-x-100"
                  style={{ background: calculator.accent }}
                />
                <div className="flex items-start justify-between">
                  <span
                    className="flex size-11 items-center justify-center rounded-xl"
                    style={{ background: `${calculator.accent}14`, color: calculator.accent }}
                  >
                    <Icon name={calculator.icon} className="size-5" />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-600"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink-900">{calculator.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                  {calculator.description}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
