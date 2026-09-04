import type { Metadata } from "next";
import { FundExplorer } from "@/components/features/mutual-funds/FundExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { getFundFilters, getFunds } from "@/services/mutualFundService";
import type { FundCategory } from "@/types";

export const metadata: Metadata = {
  title: "Mutual Funds",
  description:
    "Compare sample equity, debt, hybrid and index schemes on returns, risk, fund size and expense ratio.",
};

const CATEGORIES: FundCategory[] = ["Equity", "Debt", "Hybrid", "Index"];

export default async function MutualFundsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const requested = params.category as FundCategory | undefined;
  const category: FundCategory | "All" =
    requested && CATEGORIES.includes(requested) ? requested : "All";

  const [funds, filters] = await Promise.all([getFunds({ category }), getFundFilters()]);

  return (
    <>
      <PageHeader
        eyebrow="Mutual funds"
        title="Compare schemes on the same terms"
        description="Equity, debt, hybrid and index funds side by side — returns, risk level, fund size and cost, presented identically so comparison is straightforward."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <Reveal>
            <FundExplorer
              initialFunds={funds}
              categories={[...filters.categories]}
              risks={[...filters.risks]}
              initialCategory={category}
            />
          </Reveal>

          <Disclaimer
            className="mt-10"
            text="Fund names, NAVs, returns and fund sizes shown here are fictional sample data created for this demonstration. They do not describe real schemes. Mutual fund investments are subject to market risks; read all scheme-related documents carefully."
          />
        </div>
      </section>
    </>
  );
}
