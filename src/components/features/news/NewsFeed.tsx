"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { NewsArticle, NewsCategory } from "@/types";
import { getNews } from "@/services/newsService";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { DATA_REFERENCE_DATE } from "@/utils/series";
import { formatRelative } from "@/utils/format";

const CATEGORIES: (NewsCategory | "All")[] = [
  "All",
  "Markets",
  "Stocks",
  "Economy",
  "Business",
  "Personal Finance",
];

/**
 * The newsroom index. Stories are entries in a running list, sized by position
 * rather than boxed into equal tiles.
 */
export function NewsFeed({
  initialArticles,
  initialCategory = "All",
}: {
  initialArticles: NewsArticle[];
  initialCategory?: NewsCategory | "All";
}) {
  const [category, setCategory] = useState<NewsCategory | "All">(initialCategory);
  const [articles, setArticles] = useState(initialArticles);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    void getNews({ category }).then((results) => {
      if (!cancelled) setArticles(results);
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div>
      <Tabs
        ariaLabel="Filter news by category"
        variant="underline"
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        value={category}
        onChange={(value) => setCategory(value as NewsCategory | "All")}
      />

      <AnimatePresence mode="wait">
        <motion.div
          role="tabpanel"
          aria-label="News stories"
          key={category}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          {articles.length === 0 ? (
            <EmptyState title="No stories in this category yet" description="Try another category." />
          ) : (
            <ul className="border-t border-ink-900">
              {articles.map((article, index) => (
                <li key={article.id} className="border-b border-ink-100">
                  <NewsEntry article={article} index={index} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function NewsEntry({ article, index }: { article: NewsArticle; index?: number }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group/news grid items-baseline gap-x-10 gap-y-3 py-7 lg:grid-cols-[3rem_10rem_minmax(0,1fr)_8rem]"
    >
      {typeof index === "number" && (
        <span className="tnum hidden font-mono text-xs text-ink-300 lg:block">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span className="eyebrow text-brand-600">{article.category}</span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-semibold leading-snug tracking-[-0.022em] text-ink-900 transition-colors group-hover/news:text-brand-600 sm:text-2xl">
          {article.title}
        </span>
        <span className="mt-2.5 block max-w-2xl leading-relaxed text-ink-600">
          {article.summary}
        </span>
      </span>
      <span className="font-mono text-[0.6875rem] text-ink-400 lg:text-right">
        {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}
        <span className="mt-1 block">{article.readMinutes} min read</span>
      </span>
    </Link>
  );
}

/** Compact card used where a grid genuinely helps (related stories). */
export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group/card flex h-full flex-col border-t border-ink-200 pt-4 transition-colors hover:border-ink-900"
    >
      <span className="eyebrow text-brand-600">{article.category}</span>
      <span className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover/card:text-brand-600">
        {article.title}
      </span>
      <span className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{article.summary}</span>
      <span className="mt-5 font-mono text-[0.6875rem] text-ink-400">
        {formatRelative(article.publishedAt, DATA_REFERENCE_DATE)} · {article.readMinutes} min
      </span>
    </Link>
  );
}
