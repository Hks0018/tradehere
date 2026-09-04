import type { FundCategory, MutualFund, RiskLevel } from "@/types";
import { generateSeries } from "@/utils/series";

/**
 * DEMO DATA — fictional fund names and figures created for this prototype.
 * These are not real schemes and must not be used for investment decisions.
 */
interface FundSeed {
  id: string;
  name: string;
  house: string;
  category: FundCategory;
  subCategory: string;
  risk: RiskLevel;
  nav: number;
  /** Assets under management in ₹ crore. */
  aumCr: number;
  expenseRatio: number;
  minSip: number;
  rating: number;
  y1: number;
  y3: number;
  y5: number;
}

const SEED: FundSeed[] = [
  { id: "mf-01", name: "Northwind Bluechip Growth Fund", house: "Northwind AMC", category: "Equity", subCategory: "Large Cap", risk: "High", nav: 148.62, aumCr: 42800, expenseRatio: 0.94, minSip: 500, rating: 5, y1: 22.4, y3: 17.8, y5: 16.2 },
  { id: "mf-02", name: "Meridian Emerging Leaders Fund", house: "Meridian Investments", category: "Equity", subCategory: "Mid Cap", risk: "Very High", nav: 96.34, aumCr: 18640, expenseRatio: 1.12, minSip: 500, rating: 4, y1: 31.6, y3: 24.1, y5: 21.4 },
  { id: "mf-03", name: "Cobalt Small Cap Opportunities", house: "Cobalt Asset Co.", category: "Equity", subCategory: "Small Cap", risk: "Very High", nav: 74.18, aumCr: 9420, expenseRatio: 1.38, minSip: 1000, rating: 4, y1: 36.2, y3: 27.4, y5: 24.8 },
  { id: "mf-04", name: "Harborline Flexi Cap Fund", house: "Harborline AMC", category: "Equity", subCategory: "Flexi Cap", risk: "High", nav: 122.9, aumCr: 26310, expenseRatio: 0.88, minSip: 500, rating: 5, y1: 24.8, y3: 19.6, y5: 17.9 },
  { id: "mf-05", name: "Vantage Focused 25 Fund", house: "Vantage Capital", category: "Equity", subCategory: "Focused", risk: "Very High", nav: 88.46, aumCr: 7180, expenseRatio: 1.24, minSip: 1000, rating: 3, y1: 18.9, y3: 15.2, y5: 15.8 },
  { id: "mf-06", name: "Silverline Dividend Yield Fund", house: "Silverline AMC", category: "Equity", subCategory: "Dividend Yield", risk: "High", nav: 64.72, aumCr: 4260, expenseRatio: 1.04, minSip: 500, rating: 4, y1: 19.4, y3: 18.1, y5: 15.4 },
  { id: "mf-07", name: "Northwind Corporate Bond Fund", house: "Northwind AMC", category: "Debt", subCategory: "Corporate Bond", risk: "Low", nav: 34.28, aumCr: 21400, expenseRatio: 0.36, minSip: 500, rating: 5, y1: 7.9, y3: 6.8, y5: 7.1 },
  { id: "mf-08", name: "Meridian Short Duration Fund", house: "Meridian Investments", category: "Debt", subCategory: "Short Duration", risk: "Low", nav: 28.94, aumCr: 12680, expenseRatio: 0.32, minSip: 500, rating: 4, y1: 7.4, y3: 6.2, y5: 6.6 },
  { id: "mf-09", name: "Harborline Gilt Fund", house: "Harborline AMC", category: "Debt", subCategory: "Gilt", risk: "Moderate", nav: 41.16, aumCr: 3820, expenseRatio: 0.48, minSip: 1000, rating: 3, y1: 8.6, y3: 6.4, y5: 6.9 },
  { id: "mf-10", name: "Cobalt Liquid Advantage Fund", house: "Cobalt Asset Co.", category: "Debt", subCategory: "Liquid", risk: "Low", nav: 3624.8, aumCr: 38200, expenseRatio: 0.18, minSip: 500, rating: 5, y1: 6.9, y3: 5.8, y5: 5.4 },
  { id: "mf-11", name: "Vantage Balanced Advantage Fund", house: "Vantage Capital", category: "Hybrid", subCategory: "Balanced Advantage", risk: "Moderate", nav: 58.42, aumCr: 29840, expenseRatio: 0.76, minSip: 500, rating: 5, y1: 16.2, y3: 13.8, y5: 12.9 },
  { id: "mf-12", name: "Silverline Aggressive Hybrid Fund", house: "Silverline AMC", category: "Hybrid", subCategory: "Aggressive Hybrid", risk: "High", nav: 72.36, aumCr: 14260, expenseRatio: 0.92, minSip: 500, rating: 4, y1: 19.8, y3: 15.6, y5: 14.2 },
  { id: "mf-13", name: "Northwind Equity Savings Fund", house: "Northwind AMC", category: "Hybrid", subCategory: "Equity Savings", risk: "Moderate", nav: 32.18, aumCr: 5940, expenseRatio: 0.68, minSip: 500, rating: 3, y1: 11.4, y3: 9.8, y5: 9.2 },
  { id: "mf-14", name: "Harborline Multi Asset Allocation", house: "Harborline AMC", category: "Hybrid", subCategory: "Multi Asset", risk: "Moderate", nav: 46.84, aumCr: 8120, expenseRatio: 0.82, minSip: 1000, rating: 4, y1: 18.4, y3: 14.9, y5: 13.6 },
  { id: "mf-15", name: "Cobalt Nifty 50 Index Fund", house: "Cobalt Asset Co.", category: "Index", subCategory: "Large Cap Index", risk: "High", nav: 26.42, aumCr: 18940, expenseRatio: 0.12, minSip: 100, rating: 5, y1: 21.6, y3: 16.4, y5: 15.1 },
  { id: "mf-16", name: "Meridian Next 50 Index Fund", house: "Meridian Investments", category: "Index", subCategory: "Large Cap Index", risk: "Very High", nav: 22.18, aumCr: 6240, expenseRatio: 0.18, minSip: 100, rating: 4, y1: 27.8, y3: 20.2, y5: 17.6 },
  { id: "mf-17", name: "Vantage Sensex Index Fund", house: "Vantage Capital", category: "Index", subCategory: "Large Cap Index", risk: "High", nav: 29.86, aumCr: 9480, expenseRatio: 0.14, minSip: 100, rating: 4, y1: 20.9, y3: 16.1, y5: 14.8 },
  { id: "mf-18", name: "Silverline Midcap 150 Index Fund", house: "Silverline AMC", category: "Index", subCategory: "Mid Cap Index", risk: "Very High", nav: 24.64, aumCr: 4180, expenseRatio: 0.22, minSip: 100, rating: 4, y1: 29.4, y3: 22.8, y5: 19.4 },
];

export const MUTUAL_FUNDS: MutualFund[] = SEED.map((seed) => ({
  id: seed.id,
  name: seed.name,
  house: seed.house,
  category: seed.category,
  subCategory: seed.subCategory,
  risk: seed.risk,
  nav: seed.nav,
  aum: seed.aumCr * 1e7,
  expenseRatio: seed.expenseRatio,
  minSip: seed.minSip,
  rating: seed.rating,
  returns: { y1: seed.y1, y3: seed.y3, y5: seed.y5 },
  series: generateSeries(`fund:${seed.id}`, seed.nav, {
    points: 36,
    volatility: seed.category === "Debt" ? 0.003 : 0.014,
    drift: seed.y1 / 100 / 36,
  }),
}));

export const FUND_CATEGORIES: FundCategory[] = ["Equity", "Debt", "Hybrid", "Index"];
export const FUND_RISKS: RiskLevel[] = ["Low", "Moderate", "High", "Very High"];
export const FUND_HOUSES = Array.from(new Set(MUTUAL_FUNDS.map((f) => f.house))).sort();
