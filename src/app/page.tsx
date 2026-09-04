import { Hero } from "@/components/sections/Hero";
import { TodaysMarket } from "@/components/sections/TodaysMarket";
import { MarketPulseSection } from "@/components/sections/MarketPulseSection";
import { WhatsMoving } from "@/components/sections/WhatsMoving";
import { MarketFlowSection } from "@/components/sections/MarketFlowSection";
import { UnderstandTheMove } from "@/components/sections/UnderstandTheMove";
import { EcosystemSection } from "@/components/sections/EcosystemSection";
import { LearnSection } from "@/components/sections/LearnSection";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { FinalCta } from "@/components/sections/FinalCta";
import {
  getAllMovers,
  getHighlights,
  getIndexById,
  getIndices,
  getMarketFlow,
  getMarketNarrative,
  getMarketPulse,
} from "@/services/marketService";
import { getLearnItems, getLearningPaths } from "@/services/learnService";
import { getCalculators, getEcosystem } from "@/services/toolService";

export default async function HomePage() {
  const [
    indices,
    headlineIndex,
    narrative,
    pulse,
    flow,
    movers,
    highlights,
    ecosystem,
    learnItems,
    paths,
    calculators,
  ] = await Promise.all([
    getIndices(),
    getIndexById("nifty-50"),
    getMarketNarrative(),
    getMarketPulse(),
    getMarketFlow(),
    getAllMovers(7),
    getHighlights(),
    getEcosystem(),
    getLearnItems({ limit: 5 }),
    getLearningPaths(),
    getCalculators(),
  ]);

  const [featuredLesson, ...restLessons] = learnItems;
  const secondaryIndices = indices.filter((i) => i.id !== "nifty-50").slice(0, 3);

  return (
    <>
      <Hero indices={indices} narrative={narrative} />

      {headlineIndex && (
        <TodaysMarket
          narrative={narrative}
          headline={headlineIndex}
          secondary={secondaryIndices}
        />
      )}

      <MarketPulseSection pulse={pulse} />

      <WhatsMoving movers={movers} leadSector={narrative.leadSector} />

      <MarketFlowSection chains={flow} />

      <UnderstandTheMove highlights={highlights} />

      <EcosystemSection products={ecosystem} />

      <LearnSection featured={featuredLesson} items={restLessons} paths={paths} />

      <ToolsSection calculators={calculators} />

      <FinalCta />
    </>
  );
}
