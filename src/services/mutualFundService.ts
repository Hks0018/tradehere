import { FUND_CATEGORIES, FUND_HOUSES, FUND_RISKS, MUTUAL_FUNDS } from "@/data/mutualFunds";
import type { FundCategory, MutualFund, RiskLevel } from "@/types";

export type FundSortKey = "y1" | "y3" | "y5" | "aum" | "expenseRatio" | "name";

export interface FundQuery {
  search?: string;
  category?: FundCategory | "All";
  risks?: RiskLevel[];
  houses?: string[];
  sortKey?: FundSortKey;
  limit?: number;
}

export async function getFunds(query: FundQuery = {}): Promise<MutualFund[]> {
  const { search = "", category = "All", risks = [], houses = [], sortKey = "y3", limit } = query;

  let results = [...MUTUAL_FUNDS];
  const term = search.trim().toLowerCase();

  if (term) {
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.house.toLowerCase().includes(term) ||
        f.subCategory.toLowerCase().includes(term),
    );
  }
  if (category !== "All") results = results.filter((f) => f.category === category);
  if (risks.length) results = results.filter((f) => risks.includes(f.risk));
  if (houses.length) results = results.filter((f) => houses.includes(f.house));

  results.sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "aum") return b.aum - a.aum;
    if (sortKey === "expenseRatio") return a.expenseRatio - b.expenseRatio;
    return b.returns[sortKey] - a.returns[sortKey];
  });

  return limit ? results.slice(0, limit) : results;
}

export async function getFundById(id: string): Promise<MutualFund | undefined> {
  return MUTUAL_FUNDS.find((f) => f.id === id);
}

export async function getFundFilters() {
  return { categories: FUND_CATEGORIES, risks: FUND_RISKS, houses: FUND_HOUSES };
}
