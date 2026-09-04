import Link from "next/link";
import { BookOpen, FileText, PlayCircle } from "lucide-react";
import type { LearnItem } from "@/types";
import { LEARN_TOPICS } from "@/data/learn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const FORMAT_ICON = { Article: FileText, Video: PlayCircle, Guide: BookOpen } as const;

export function LearningSection({ items }: { items: LearnItem[] }) {
  return (
    <section className="border-y border-ink-100 bg-ink-50/50 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Learning hub"
          title="Learn before you invest."
          description="Short, plain-language lessons that build understanding — from what a share actually is to how portfolios are constructed."
          action={<Button href="/learn" variant="secondary">Open learning hub</Button>}
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {LEARN_TOPICS.map((topic) => (
            <Link key={topic} href={`/learn?topic=${encodeURIComponent(topic)}`}>
              <Badge tone="outline" className="bg-white transition-colors hover:border-brand-200 hover:text-brand-700">
                {topic}
              </Badge>
            </Link>
          ))}
        </div>

        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const FormatIcon = FORMAT_ICON[item.format];
            return (
              <RevealItem key={item.id} className="h-full">
                <Link
                  href={`/learn/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift"
                >
                  <div
                    className="relative h-24 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${item.accent}1f, ${item.accent}05)` }}
                  >
                    <span
                      aria-hidden
                      className="absolute -right-6 -top-6 size-24 rounded-full opacity-15 blur-xl transition-transform duration-500 group-hover:scale-125"
                      style={{ background: item.accent }}
                    />
                    <span
                      className="absolute bottom-3 left-4 flex size-9 items-center justify-center rounded-xl bg-white shadow-soft"
                      style={{ color: item.accent }}
                    >
                      <FormatIcon className="size-4.5" aria-hidden />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="font-medium text-ink-500">{item.level}</span>
                      <span aria-hidden>·</span>
                      <span>{item.minutes} min {item.format.toLowerCase()}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{item.excerpt}</p>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
