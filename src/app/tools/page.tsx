import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
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
        title={["Run the numbers", "yourself."]}
        description="Five working instruments. Change any input and the projection, the chart and the year-by-year breakdown recalculate immediately."
        showDemoBadge={false}
      >
        <p className="eyebrow text-ink-400">{calculators.length} calculators</p>
      </PageHeader>

      <section className="section-y bg-white">
        <div className="container-page">
          <ul className="border-t border-ink-900">
            {calculators.map((calculator, index) => (
              <Reveal key={calculator.id} delay={index * 0.06} y={16} className="block">
                <li className="border-b border-ink-100">
                  <Link
                    href={`/tools/${calculator.slug}`}
                    className="group/tool grid items-baseline gap-x-10 gap-y-4 py-9 lg:grid-cols-[3rem_auto_minmax(0,1fr)_auto]"
                  >
                    <span className="tnum hidden font-mono text-xs text-ink-300 lg:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex items-center gap-4">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-card transition-transform duration-300 group-hover/tool:scale-110"
                        style={{ background: `${calculator.accent}14`, color: calculator.accent }}
                      >
                        <Icon name={calculator.icon} className="size-[1.125rem]" />
                      </span>
                      <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900 transition-colors group-hover/tool:text-brand-600 sm:text-3xl">
                        {calculator.name.replace(" Calculator", "")}
                      </span>
                    </span>

                    <span className="max-w-xl leading-relaxed text-ink-600">
                      {calculator.description}
                    </span>

                    <span
                      aria-hidden
                      className="hidden text-ink-300 transition-all duration-300 group-hover/tool:translate-x-1 group-hover/tool:text-brand-600 lg:block"
                    >
                      →
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>

          <Disclaimer
            className="mt-16"
            text="Calculators are illustrations based on the inputs and assumed constant rates you provide. Actual returns, loan terms and deposit rates vary and are never guaranteed."
          />
        </div>
      </section>
    </>
  );
}
