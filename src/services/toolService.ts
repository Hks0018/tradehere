import { CALCULATORS, ECOSYSTEM, PLATFORM_VALUES } from "@/data/tools";
import type { CalculatorMeta, EcosystemProduct } from "@/types";

export async function getCalculators(): Promise<CalculatorMeta[]> {
  return CALCULATORS;
}

export async function getCalculatorBySlug(slug: string): Promise<CalculatorMeta | undefined> {
  return CALCULATORS.find((c) => c.slug === slug);
}

export async function getEcosystem(): Promise<EcosystemProduct[]> {
  return ECOSYSTEM;
}

export async function getPlatformValues() {
  return PLATFORM_VALUES;
}
