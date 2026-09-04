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
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {articles.length === 0 ? (
            <EmptyState title="No stories in this category yet" description="Try another category." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id}>
                  <NewsCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift"
    >
      <div
        className="relative h-28 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${article.accent}22, ${article.accent}06)` }}
      >
        <span
          aria-hidden
          className="absolute -right-8 -top-8 size-28 rounded-full opacity-20 blur-2xl transition-transform duration-500 group-hover:scale-125"
          style={{ background: article.accent }}
        />
        <span className="absolute bottom-3 left-4 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-700 backdrop-blur">
          {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{article.summary}</p>
        <p className="mt-4 flex items-center gap-2 text-xs text-ink-400">
          <span>{article.source}</span>
          <span aria-hidden>·</span>
          <span>{formatRelative(article.publishedAt, DATA_REFERENCE_DATE)}</span>
          <span aria-hidden>·</span>
          <span>{article.readMinutes} min read</span>
        </p>
      </div>
    </Link>
  );
}
