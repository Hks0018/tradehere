import { LEARNING_PATHS, LEARN_ITEMS } from "@/data/learn";
import type { LearnFormat, LearnItem, LearnLevel, LearningPath } from "@/types";

export interface LearnQuery {
  level?: LearnLevel | "All";
  topic?: string | "All";
  format?: LearnFormat | "All";
  search?: string;
  limit?: number;
}

export async function getLearnItems(query: LearnQuery = {}): Promise<LearnItem[]> {
  const { level = "All", topic = "All", format = "All", search = "", limit } = query;
  let results = [...LEARN_ITEMS];
  const term = search.trim().toLowerCase();

  if (level !== "All") results = results.filter((i) => i.level === level);
  if (topic !== "All") results = results.filter((i) => i.topic === topic);
  if (format !== "All") results = results.filter((i) => i.format === format);
  if (term) {
    results = results.filter(
      (i) => i.title.toLowerCase().includes(term) || i.excerpt.toLowerCase().includes(term),
    );
  }

  return limit ? results.slice(0, limit) : results;
}

export async function getLearnItemBySlug(slug: string): Promise<LearnItem | undefined> {
  return LEARN_ITEMS.find((i) => i.slug === slug);
}

export async function getLearnSlugs(): Promise<string[]> {
  return LEARN_ITEMS.map((i) => i.slug);
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  return LEARNING_PATHS;
}

export async function getPathItems(path: LearningPath): Promise<LearnItem[]> {
  return path.itemSlugs
    .map((slug) => LEARN_ITEMS.find((i) => i.slug === slug))
    .filter((i): i is LearnItem => Boolean(i));
}
