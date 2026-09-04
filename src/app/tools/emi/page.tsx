import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { EmiCalculator } from "@/components/calculators/EmiCalculator";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getCalculatorBySlug } from "@/services/toolService";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description: "Calculate the monthly instalment, total interest and total outflow on any loan.",
};

export default async function Page() {
  const meta = await getCalculatorBySlug("emi");
  if (!meta) notFound();

  return (
    <>
      <PageHeader eyebrow="Financial tools" title={meta.name} description={meta.description} showDemoBadge={false}>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm text-ink-400">
            <li><Link href="/tools" className="transition-colors hover:text-ink-700">All tools</Link></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li aria-current="page" className="font-medium text-ink-700">{meta.name}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <Reveal>
            <EmiCalculator />
          </Reveal>
        </div>
      </section>
    </>
  );
}
