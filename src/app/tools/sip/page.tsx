import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SipCalculator } from "@/components/calculators/SipCalculator";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getCalculatorBySlug } from "@/services/toolService";

export const metadata: Metadata = {
  title: "SIP Calculator",
  description: "Project a monthly investment plan with a year-by-year breakdown of contributions and returns.",
};

export default async function Page() {
  const meta = await getCalculatorBySlug("sip");
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
            <SipCalculator />
          </Reveal>
        </div>
      </section>
    </>
  );
}
