import type { Metadata } from "next";
import { IpoBoard } from "@/components/features/ipos/IpoBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Badge } from "@/components/ui/Badge";
import { getIposGrouped } from "@/services/ipoService";

export const metadata: Metadata = {
  title: "IPOs",
  description:
    "Track sample upcoming, open and recently listed public offerings with price bands, lot sizes, issue sizes and timelines.",
};

export default async function IpoPage() {
  const grouped = await getIposGrouped();

  return (
    <>
      <PageHeader
        eyebrow="IPO centre"
        title="The primary market, tracked end to end"
        description="Offerings that are open now, those that are coming, and how recent listings have traded since — with the details that matter before an application."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="up">{grouped.Open.length} open</Badge>
          <Badge tone="brand">{grouped.Upcoming.length} upcoming</Badge>
          <Badge tone="neutral">{grouped.Listed.length} recently listed</Badge>
        </div>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <Reveal>
            <IpoBoard grouped={grouped} />
          </Reveal>

          <Disclaimer
            className="mt-10"
            text="Company names, price bands, dates and subscription figures on this page are sample data created for demonstration and do not describe real offerings. Public offerings carry the risk of capital loss and listing gains are never assured. Always read the offer document before applying."
          />
        </div>
      </section>
    </>
  );
}
