import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { LearnCard } from "@/components/features/learning/LearnLibrary";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { Reveal } from "@/components/ui/Reveal";
import { getLearnItemBySlug, getLearnItems, getLearnSlugs } from "@/services/learnService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getLearnSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getLearnItemBySlug(slug);
  if (!item) return { title: "Lesson not found" };
  return { title: item.title, description: item.excerpt };
}

export default async function LearnItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getLearnItemBySlug(slug);
  if (!item) notFound();

  const related = (await getLearnItems({ topic: item.topic })).filter((i) => i.slug !== slug).slice(0, 3);

  return (
    <>
      <article>
        <header
          className="border-b border-ink-100 pt-26 pb-10 sm:pt-30"
          style={{ background: `linear-gradient(160deg, ${item.accent}12, transparent 70%)` }}
        >
          <div className="container-page max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1 text-sm text-ink-400">
                <li><Link href="/learn" className="transition-colors hover:text-ink-700">Learn</Link></li>
                <li aria-hidden><ChevronRight className="size-3.5" /></li>
                <li>
                  <Link
                    href={`/learn?topic=${encodeURIComponent(item.topic)}`}
                    className="transition-colors hover:text-ink-700"
                  >
                    {item.topic}
                  </Link>
                </li>
              </ol>
            </nav>

            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{item.level}</Badge>
                <Badge tone="outline" className="bg-white">{item.format}</Badge>
                <span className="flex items-center gap-1.5 text-xs text-ink-400">
                  <Clock className="size-3.5" aria-hidden />
                  {item.minutes} min
                </span>
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink-900 text-balance-tight sm:text-4xl">
                {item.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">{item.excerpt}</p>
            </Reveal>
          </div>
        </header>

        <div className="py-12 sm:py-16">
          <div className="container-page max-w-3xl">
            {item.body.map((section, index) => (
              <Reveal key={section.heading} delay={index * 0.04} className="mb-10 last:mb-0">
                <section>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.015em] text-ink-900">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph, i) => (
                      <p key={i} className="leading-[1.75] text-ink-700">{paragraph}</p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}

            <Disclaimer
              className="mt-12"
              text="Educational content only. This lesson is not investment, tax or legal advice, and no outcome is promised or guaranteed. Investments are subject to market risks."
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-ink-50/50 py-14">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-xl font-semibold text-ink-900">More on {item.topic}</h2>
              <Link href="/learn" className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700">
                All lessons →
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry) => (
                <li key={entry.id}>
                  <LearnCard item={entry} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
