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
        title={["Compare schemes", "on the same terms."]}
        description="Eighteen schemes across equity, debt, hybrid and index strategies — ranked by the return you care about, with cost and risk always in view."
      >
        <p className="eyebrow text-ink-400">{funds.length} schemes</p>
        <p className="eyebrow text-ink-400">{filters.houses.length} fund houses</p>
      </PageHeader>

      <section className="section-y bg-white">
        <div className="container-page">
          <Reveal y={18}>
            <FundExplorer
              initialFunds={funds}
              categories={[...filters.categories]}
              risks={[...filters.risks]}
              initialCategory={category}
            />
          </Reveal>

          <Disclaimer
            className="mt-16"
            text="Fund names, NAVs, returns and fund sizes shown here are fictional sample data created for this demonstration. They do not describe real schemes. Mutual fund investments are subject to market risks; read all scheme-related documents carefully."
          />
        </div>
      </section>
    </>
  );
}
