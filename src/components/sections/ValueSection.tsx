import { Icon } from "@/components/ui/Icon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PLATFORM_VALUES } from "@/data/tools";

export function ValueSection() {
  return (
    <section className="border-y border-ink-100 bg-ink-50/50 py-16 sm:py-20">
      <div className="container-page">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_VALUES.map((value) => (
            <RevealItem key={value.id}>
              <div className="group h-full rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={value.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{value.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
