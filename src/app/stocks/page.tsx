import type { Metadata } from "next";
import { StockScreener } from "@/components/features/stocks/StockScreener";
import { PageHeader } from "@/components/ui/PageHeader";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { getSectorList, getStocks, type StockCategory } from "@/services/stockService";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Search, filter and sort a sample universe of listed companies by category, sector, price, market capitalisation and volume.",
};

const VALID_CATEGORIES: StockCategory[] = ["all", "popular", "trending", "large", "mid", "small"];

export default async function StocksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const requested = params.category as StockCategory | undefined;
  const category: StockCategory =
    requested && VALID_CATEGORIES.includes(requested) ? requested : "all";

  const [stocks, sectors] = await Promise.all([
    getStocks({ category, sortKey: "marketCap", sortDirection: "desc" }),
    getSectorList(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Stocks"
        title="Find companies worth understanding"
        description="Screen a sample universe of listed companies by category and sector, then sort by price, market capitalisation or traded volume."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <Reveal>
            <StockScreener initialStocks={stocks} sectors={sectors} initialCategory={category} />
          </Reveal>
          <Disclaimer className="mt-10" />
        </div>
      </section>
    </>
  );
}
