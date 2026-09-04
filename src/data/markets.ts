import type { MarketHighlight, MarketIndex, MarketSentiment, Sector } from "@/types";
import { generateSeries } from "@/utils/series";

/** DEMO DATA — sample index levels for illustration, not live market data. */
interface IndexSeed {
  id: string;
  name: string;
  shortName: string;
  region: MarketIndex["region"];
  value: number;
  changePercent: number;
}

const INDEX_SEED: IndexSeed[] = [
  { id: "nifty-50", name: "NIFTY 50", shortName: "NIFTY", region: "India", value: 24862.35, changePercent: 0.68 },
  { id: "sensex", name: "SENSEX", shortName: "SENSEX", region: "India", value: 81428.9, changePercent: 0.54 },
  { id: "nifty-bank", name: "NIFTY BANK", shortName: "BANKNIFTY", region: "India", value: 54216.4, changePercent: 1.12 },
  { id: "nifty-midcap", name: "NIFTY MIDCAP 100", shortName: "MIDCAP", region: "India", value: 58194.75, changePercent: -0.42 },
  { id: "nifty-it", name: "NIFTY IT", shortName: "NIFTY IT", region: "India", value: 41386.2, changePercent: 1.36 },
  { id: "sp-500", name: "S&P 500", shortName: "S&P 500", region: "Global", value: 5684.12, changePercent: 0.31 },
  { id: "nasdaq", name: "NASDAQ Composite", shortName: "NASDAQ", region: "Global", value: 18642.88, changePercent: -0.24 },
  { id: "nikkei", name: "Nikkei 225", shortName: "NIKKEI", region: "Global", value: 38914.6, changePercent: 0.86 },
];

export const MARKET_INDICES: MarketIndex[] = INDEX_SEED.map((seed) => {
  const change = Number(((seed.value * seed.changePercent) / 100).toFixed(2));
  const previousClose = Number((seed.value - change).toFixed(2));
  return {
    ...seed,
    change,
    changePercent: seed.changePercent,
    previousClose,
    dayHigh: Number((seed.value * 1.0042).toFixed(2)),
    dayLow: Number((seed.value * 0.9948).toFixed(2)),
    series: generateSeries(`index:${seed.id}`, seed.value, {
      points: 48,
      volatility: 0.004,
      drift: seed.changePercent > 0 ? 0.0004 : -0.0002,
      intraday: true,
    }),
  };
});

/** The four indices highlighted on the homepage snapshot. */
export const SNAPSHOT_INDEX_IDS = ["nifty-50", "sensex", "nifty-bank", "sp-500"];

export const SECTORS: Sector[] = [
  { id: "financials", name: "Financial Services", changePercent: 1.24, marketCapShare: 33.8, advancers: 42, decliners: 14 },
  { id: "it", name: "Information Technology", changePercent: 1.36, marketCapShare: 13.1, advancers: 21, decliners: 8 },
  { id: "energy", name: "Energy", changePercent: 0.82, marketCapShare: 11.4, advancers: 16, decliners: 9 },
  { id: "fmcg", name: "FMCG", changePercent: -0.28, marketCapShare: 8.6, advancers: 11, decliners: 17 },
  { id: "auto", name: "Automobile", changePercent: 2.14, marketCapShare: 7.2, advancers: 24, decliners: 6 },
  { id: "healthcare", name: "Healthcare", changePercent: 0.46, marketCapShare: 6.4, advancers: 19, decliners: 13 },
  { id: "capital-goods", name: "Capital Goods", changePercent: -0.94, marketCapShare: 5.8, advancers: 9, decliners: 22 },
  { id: "metals", name: "Metals & Mining", changePercent: -1.86, marketCapShare: 4.1, advancers: 4, decliners: 18 },
  { id: "utilities", name: "Utilities", changePercent: 0.68, marketCapShare: 3.9, advancers: 12, decliners: 7 },
  { id: "consumer-services", name: "Consumer Services", changePercent: 1.72, marketCapShare: 3.4, advancers: 18, decliners: 9 },
  { id: "telecom", name: "Telecommunications", changePercent: 2.08, marketCapShare: 2.3, advancers: 6, decliners: 2 },
];

export const MARKET_SENTIMENT: MarketSentiment = {
  score: 64,
  label: "Cautiously Optimistic",
  advancers: 1284,
  decliners: 872,
  unchanged: 96,
  updatedLabel: "Market close · sample session",
};

export const MARKET_HIGHLIGHTS: MarketHighlight[] = [
  {
    id: "h1",
    title: "Banking leads the advance",
    detail: "Private lenders contributed the largest share of the benchmark's gain, with the banking index outpacing the broader market for a third straight session.",
    tone: "positive",
  },
  {
    id: "h2",
    title: "Metals under pressure",
    detail: "Softer international steel spreads weighed on ferrous names, making metals the weakest sector in the sample session.",
    tone: "negative",
  },
  {
    id: "h3",
    title: "Broader market lags benchmarks",
    detail: "The midcap index closed lower even as large caps advanced, pointing to selective rather than broad-based participation.",
    tone: "neutral",
  },
  {
    id: "h4",
    title: "Autos extend momentum",
    detail: "Passenger-vehicle manufacturers gained on continued utility-vehicle demand, lifting the auto index above its short-term average.",
    tone: "positive",
  },
];

export const MARKET_STATUS = {
  isOpen: false,
  label: "Sample session · closed",
  nextEvent: "Demo data refreshes on page load",
};
