import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearnCard } from "@/components/features/learning/LearnLibrary";
import { Band } from "@/components/ui/Band";
import { Disclaimer } from "@/components/ui/DemoDataNote";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";
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

  const related = (await getLearnItems({ topic: item.topic }))
    .filter((i) => i.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <article>
        <header
          className="relative overflow-hidden pt-32 pb-12 sm:pt-40"
          style={{ background: `linear-gradient(170deg, ${item.accent}14, var(--color-paper-100) 65%)` }}
        >
          <div className="container-page relative">
            <nav aria-label="Breadcrumb" className="mb-10">
              <ol className="eyebrow flex items-center gap-2 text-ink-400">
                <li>
                  <Link href="/learn" className="transition-colors hover:text-ink-900">
                    Learn
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/learn?topic=${encodeURIComponent(item.topic)}`}
                    className="transition-colors hover:text-ink-900"
                  >
                    {item.topic}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <MaskedHeading
                as="h1"
                lines={[item.title]}
                className="font-display text-display-2 text-ink-900 text-balance-tight"
              />
              <Reveal delay={0.18} y={14}>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink-600">{item.excerpt}</p>
                <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-300 pt-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">
                  <span className="text-ink-700">{item.level}</span>
                  <span aria-hidden>·</span>
                  <span>{item.format}</span>
                  <span aria-hidden>·</span>
                  <span>{item.minutes} min read</span>
                </p>
              </Reveal>
            </div>
          </div>
        </header>

        <div className="bg-white py-16 sm:py-20">
          <div className="container-reading">
            {item.body.map((section, index) => (
              <Reveal key={section.heading} delay={index * 0.04} y={14} className="mb-12 block last:mb-0">
                <section>
                  <p className="tnum font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-300">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 font-display text-display-3 font-semibold leading-tight tracking-[-0.03em] text-ink-900">
                    {section.heading}
                  </h2>
                  <div className="mt-6 space-y-5">
                    {section.paragraphs.map((paragraph, i) => (
                      <p key={i} className="text-lg leading-[1.8] text-ink-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}

            <Disclaimer
              className="mt-16"
              text="Educational content only. This lesson is not investment, tax or legal advice, and no outcome is promised or guaranteed. Investments are subject to market risks."
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Band env="paper" className="section-y-sm">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-display-3 font-semibold text-ink-900">
                More on {item.topic.toLowerCase()}
              </h2>
              <ArrowLink href="/learn">All lessons</ArrowLink>
            </div>
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry) => (
                <li key={entry.id}>
                  <LearnCard item={entry} />
                </li>
              ))}
            </ul>
          </div>
        </Band>
      )}
    </>
  );
}
