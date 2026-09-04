import type { Metadata } from "next";
import Link from "next/link";
import { LearnLibrary } from "@/components/features/learning/LearnLibrary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
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

  const [items, paths] = await Promise.all([getLearnItems({ level, topic }), getLearningPaths()]);
  const pathItems = await Promise.all(paths.map((path) => getPathItems(path)));

  return (
    <>
      <PageHeader
        env="void"
        eyebrow="Learning hub"
        title={["Learn before", "you invest."]}
        description="Fourteen short lessons in plain language — from what a share actually is, through analysis, to how a resilient portfolio is put together."
        showDemoBadge={false}
      >
        {LEVELS.map((item) => (
          <Link
            key={item}
            href={`/learn?level=${item}`}
            className="eyebrow text-paper-300/55 underline-offset-4 transition-colors hover:text-paper-50 hover:underline"
          >
            {item}
          </Link>
        ))}
      </PageHeader>

      {/* Paths */}
      <section className="section-y bg-white" id="paths">
        <div className="container-page">
          <SectionIntro
            index="01"
            eyebrow="Learning paths"
            lines={["Follow a sequence,", "not a scattergun."]}
            standfirst="Each path orders its lessons so every idea builds on the one before it."
          />

          <div className="mt-16 grid gap-x-12 gap-y-14 lg:grid-cols-3">
            {paths.map((path, index) => (
              <Reveal key={path.id} delay={index * 0.08} y={20}>
                <article className="border-t-2 border-ink-900 pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="eyebrow text-brand-600">{path.level}</p>
                    <p className="tnum font-mono text-xs text-ink-300">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-[-0.028em] text-ink-900">
                    {path.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-ink-600">{path.description}</p>

                  <ol className="mt-7">
                    {pathItems[index].map((item, itemIndex) => (
                      <li key={item.id} className="border-t border-ink-100">
                        <Link
                          href={`/learn/${item.slug}`}
                          className="group/step flex items-baseline gap-4 py-3"
                        >
                          <span className="tnum font-mono text-[0.6875rem] text-ink-300">
                            {itemIndex + 1}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-ink-700 transition-colors group-hover/step:text-brand-600">
                            {item.title}
                          </span>
                          <span className="tnum shrink-0 font-mono text-[0.6875rem] text-ink-400">
                            {item.minutes}m
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>

                  <Link
                    href={`/learn/${path.itemSlugs[0]}`}
                    className="group/start mt-7 inline-flex items-center gap-2 text-sm font-medium text-ink-900 transition-colors hover:text-brand-600"
                  >
                    Start this path
                    <span aria-hidden className="transition-transform duration-300 group-hover/start:translate-x-1">
                      →
                    </span>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Library */}
      <Band env="paper" className="section-y">
        <div className="container-page">
          <Eyebrow index="02">The library</Eyebrow>
          <h2 className="mt-7 font-display text-display-2 font-semibold text-ink-900">
            Every lesson.
          </h2>
          <Reveal delay={0.1} y={16} className="mt-12">
            <LearnLibrary
              initialItems={items}
              topics={[...LEARN_TOPICS]}
              initialLevel={level}
              initialTopic={topic}
            />
          </Reveal>

          <Disclaimer
            className="mt-16"
            text="Educational content only. Nothing in the learning hub is investment, tax or legal advice, and no outcome is promised or guaranteed."
          />
        </div>
      </Band>
    </>
  );
}
