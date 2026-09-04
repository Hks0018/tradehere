import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { LearnLibrary } from "@/components/features/learning/LearnLibrary";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { LEARN_TOPICS } from "@/data/learn";
import { getLearnItems, getLearningPaths, getPathItems } from "@/services/learnService";
import type { LearnLevel } from "@/types";

export const metadata: Metadata = {
  title: "Learning Hub",
  description:
    "Plain-language lessons on stocks, mutual funds, personal finance and advanced investing, organised into structured learning paths.",
};

const LEVELS: LearnLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const requestedLevel = params.level as LearnLevel | undefined;
  const level: LearnLevel | "All" =
    requestedLevel && LEVELS.includes(requestedLevel) ? requestedLevel : "All";
  const topic =
    params.topic && (LEARN_TOPICS as readonly string[]).includes(params.topic) ? params.topic : "All";

  const [items, paths] = await Promise.all([
    getLearnItems({ level, topic }),
    getLearningPaths(),
  ]);
  const pathItems = await Promise.all(paths.map((path) => getPathItems(path)));

  return (
    <>
      <PageHeader
        eyebrow="Learning hub"
        title="Learn before you invest."
        description="Short lessons written in plain language — from what a share actually is, through analysis, to how a resilient portfolio is put together."
        showDemoBadge={false}
      >
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((item) => (
            <Link key={item} href={`/learn?level=${item}`}>
              <Badge tone="outline" className="bg-white transition-colors hover:border-brand-200 hover:text-brand-700">
                {item}
              </Badge>
            </Link>
          ))}
        </div>
      </PageHeader>

      <section id="paths" className="scroll-mt-24 py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Learning paths"
            title="Follow a sequence, not a scattergun"
            description="Each path orders its lessons so every concept builds on the one before it."
          />

          <RevealGroup className="mt-8 grid gap-4 lg:grid-cols-3">
            {paths.map((path, index) => (
              <RevealItem key={path.id} className="h-full">
                <article className="flex h-full flex-col rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <GraduationCap className="size-5" aria-hidden />
                    </span>
                    <Badge tone="neutral">{path.level}</Badge>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{path.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{path.description}</p>

                  <ol className="mt-5 flex-1 space-y-1 border-t border-ink-100 pt-4">
                    {pathItems[index].map((item, itemIndex) => (
                      <li key={item.id}>
                        <Link
                          href={`/learn/${item.slug}`}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-ink-50"
                        >
                          <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-500">
                            {itemIndex + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-ink-700 group-hover:text-brand-700">
                            {item.title}
                          </span>
                          <span className="tnum shrink-0 text-xs text-ink-400">{item.minutes}m</span>
                        </Link>
                      </li>
                    ))}
                  </ol>

                  <Link
                    href={`/learn/${path.itemSlugs[0]}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                  >
                    Start this path
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-ink-50/50 py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Library"
            title="Every lesson in one place"
            description="Filter by level, topic or format to find exactly what you need next."
          />
          <Reveal className="mt-8">
            <LearnLibrary
              initialItems={items}
              topics={[...LEARN_TOPICS]}
              initialLevel={level}
              initialTopic={topic}
            />
          </Reveal>

          <Disclaimer
            className="mt-10 bg-white"
            text="Educational content only. Nothing in the learning hub is investment, tax or legal advice, and no outcome is promised or guaranteed."
          />
        </div>
      </section>
    </>
  );
}
