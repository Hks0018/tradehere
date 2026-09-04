import type { Metadata } from "next";
import Link from "next/link";
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
      <PageHeader eyebrow="Financial tools" title={meta.name.replace(" Calculator", " calculator.")} description={meta.description} showDemoBadge={false}>
        <nav aria-label="Breadcrumb">
          <ol className="eyebrow flex items-center gap-2 text-ink-400">
            <li>
              <Link href="/tools" className="transition-colors hover:text-ink-900">
                All tools
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink-700">{meta.name}</li>
          </ol>
        </nav>
      </PageHeader>

      <section className="section-y bg-white">
        <div className="container-page">
          <Reveal>
            <RetirementCalculator />
          </Reveal>
        </div>
      </section>
    </>
  );
}
