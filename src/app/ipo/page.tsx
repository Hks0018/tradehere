import type { Metadata } from "next";
import { IpoBoard } from "@/components/features/ipos/IpoBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { getIposGrouped } from "@/services/ipoService";

export const metadata: Metadata = {
  title: "IPOs",
  description:
    "Sample upcoming, open and recently listed public offerings with price bands, lot sizes, issue sizes and how listings have traded since.",
};

export default async function IpoPage() {
  const grouped = await getIposGrouped();

  return (
    <>
      <PageHeader
        eyebrow="IPO centre"
        title={["The primary market,", "tracked end to end."]}
        description="What is open now, what is coming, and how recent listings have actually traded since — with the details that matter before an application."
      >
        <p className="eyebrow text-up-600">{grouped.Open.length} open</p>
        <p className="eyebrow text-brand-600">{grouped.Upcoming.length} upcoming</p>
        <p className="eyebrow text-ink-400">{grouped.Listed.length} recently listed</p>
      </PageHeader>

      <section className="section-y bg-white">
        <div className="container-page">
          <Reveal y={18}>
            <IpoBoard grouped={grouped} />
          </Reveal>

          <Disclaimer
            className="mt-16"
            text="Company names, price bands, dates and subscription figures on this page are sample data created for demonstration and do not describe real offerings. Public offerings carry the risk of capital loss and listing gains are never assured. Always read the offer document before applying."
          />
        </div>
      </section>
    </>
  );
}
