import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { RetirementCalculator } from "@/components/calculators/RetirementCalculator";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getCalculatorBySlug } from "@/services/toolService";

export const metadata: Metadata = {
  title: "Retirement Calculator",
  description: "Estimate the corpus your retirement expenses require and the monthly investment needed.",
};

export default async function Page() {
  const meta = await getCalculatorBySlug("retirement");
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
            <RetirementCalculator />
          </Reveal>
        </div>
      </section>
    </>
  );
}
