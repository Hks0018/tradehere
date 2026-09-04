import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { getCalculators } from "@/services/toolService";

export const metadata: Metadata = {
  title: "Financial Tools",
  description:
    "Working SIP, EMI, FD, compound interest and retirement calculators with charts and year-by-year breakdowns.",
};

export default async function ToolsPage() {
  const calculators = await getCalculators();

  return (
    <>
      <PageHeader
        eyebrow="Financial tools"
        title="Run the numbers yourself"
        description="Five working calculators. Change any input and the projection, chart and year-by-year breakdown update immediately."
        showDemoBadge={false}
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <span
                    className="flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `${calculator.accent}14`, color: calculator.accent }}
                  >
                    <Icon name={calculator.icon} className="size-5.5" />
                  </span>
                  <h2 className="mt-5 font-display text-lg font-semibold text-ink-900">
                    {calculator.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium" style={{ color: calculator.accent }}>
                    {calculator.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {calculator.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900">
                    Open calculator
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Disclaimer
            className="mt-10"
            text="Calculators are illustrations based on the inputs and assumed constant rates you provide. Actual returns, loan terms and deposit rates vary and are never guaranteed."
          />
        </div>
      </section>
    </>
  );
}
