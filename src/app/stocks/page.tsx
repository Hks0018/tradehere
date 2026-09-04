import type { Metadata } from "next";
import Link from "next/link";
import { StockScreener } from "@/components/features/stocks/StockScreener";
import { StockCard } from "@/components/market/StockCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Band } from "@/components/ui/Band";
import { getSectorList, getStocks, type StockCategory } from "@/services/stockService";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Search, filter and rank a sample universe of listed companies by category, sector, price, market capitalisation and volume.",
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

  const [stocks, sectors, featured] = await Promise.all([
    getStocks({ category, sortKey: "marketCap", sortDirection: "desc" }),
    getSectorList(),
    getStocks({ category: "trending", limit: 4 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Stocks"
        title={["Discover", "what's moving."]}
        description="Twenty-eight companies across twelve sectors. Search them, filter them, rank them — then read the ones worth understanding."
      >
        <p className="eyebrow text-ink-400">{stocks.length} companies</p>
        <p className="eyebrow text-ink-400">{sectors.length} sectors</p>
      </PageHeader>

      {/* Featured strip */}
      <Band env="paper" className="section-y-sm">
        <div className="container-page">
          <SectionIntro
            eyebrow="Drawing attention"
            lines={["Trending now."]}
            standfirst="The names with the largest moves in the sample session."
          />
          <Reveal delay={0.1} y={18} className="mt-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </Reveal>
        </div>
      </Band>

      <section className="section-y bg-white" id="screener">
        <div className="container-page">
          <SectionIntro
            eyebrow="Screener"
            lines={["The full universe."]}
            standfirst="Filter by category and sector, then sort any column."
            action={
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: "Popular", href: "/stocks?category=popular" },
                  { label: "Large cap", href: "/stocks?category=large" },
                  { label: "Mid cap", href: "/stocks?category=mid" },
                  { label: "Small cap", href: "/stocks?category=small" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            }
          />

          <Reveal delay={0.1} y={18} className="mt-14">
            <StockScreener initialStocks={stocks} sectors={sectors} initialCategory={category} />
          </Reveal>

          <Disclaimer className="mt-16" />
        </div>
      </section>
    </>
  );
}
