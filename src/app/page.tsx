import { Hero } from "@/components/sections/Hero";
import { ValueSection } from "@/components/sections/ValueSection";
import { MarketSnapshot } from "@/components/sections/MarketSnapshot";
import { EcosystemSection } from "@/components/sections/EcosystemSection";
import { InsightsSection } from "@/components/sections/InsightsSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { getAllMovers, getIndexById, getIndices, getSentiment, getSnapshotIndices } from "@/services/marketService";
import { getStocks } from "@/services/stockService";
import { getLearnItems } from "@/services/learnService";
import { getCalculators, getEcosystem } from "@/services/toolService";

export default async function HomePage() {
  const [
    heroIndex,
    snapshot,
    ticker,
    movers,
    sentiment,
    watchlist,
    ecosystem,
    learnItems,
    calculators,
  ] = await Promise.all([
    getIndexById("nifty-50"),
    getSnapshotIndices(),
    getIndices(),
    getAllMovers(6),
    getSentiment(),
    getStocks({ category: "popular", limit: 3 }),
    getEcosystem(),
    getLearnItems({ limit: 4 }),
    getCalculators(),
  ]);

  return (
    <>
      {heroIndex && (
        <Hero
          index={heroIndex}
          watchlist={watchlist}
          breadth={{ advancers: sentiment.advancers, decliners: sentiment.decliners }}
        />
      )}
      <ValueSection />
      <MarketSnapshot snapshot={snapshot} ticker={ticker} />
      <EcosystemSection products={ecosystem} />
      <InsightsSection movers={movers} />
      <LearningSection items={learnItems} />
      <ToolsSection calculators={calculators.slice(0, 6)} />
      <FinalCta />
    </>
  );
}
