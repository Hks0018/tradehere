import Link from "next/link";
import { FOOTER_NAV } from "@/data/navigation";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="on-void relative isolate overflow-hidden bg-void-950 text-paper-200">
      <div aria-hidden className="th-grid-void pointer-events-none absolute inset-0 -z-10" />

      <div className="container-page relative pt-20 pb-10 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo onDark />
            <p className="mt-8 max-w-[26ch] font-display text-display-3 font-semibold text-paper-50">
              The market, explained.
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper-300/70">
              One platform for understanding what is moving, why it matters, and where to look next.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {FOOTER_NAV.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="eyebrow text-paper-300/50">{column.title}</h2>
                <ul className="mt-5">
                  {column.links.map((link) => (
                    <li key={link.label} className="border-t border-paper-200/10">
                      <Link
                        href={link.href}
                        className="group/f flex items-center justify-between gap-3 py-2.5 text-sm text-paper-200/75 transition-colors hover:text-paper-50"
                      >
                        {link.label}
                        <span
                          aria-hidden
                          className="translate-x-0 text-paper-300/0 transition-all duration-300 group-hover/f:translate-x-0.5 group-hover/f:text-brand-300"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-paper-200/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-paper-300/55">
            <span className="text-paper-200/80">Important.</span> Tradehere is a market information
            and education product. All prices, indices, fund figures, IPO details and news on this
            site are sample data created for demonstration and are not live market data. Nothing
            here is investment, legal or tax advice, and no returns are promised or guaranteed.
            Investments in securities and mutual funds are subject to market risks, including
            possible loss of principal. Read all scheme-related documents carefully and consult a
            qualified adviser before investing.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-xs text-paper-300/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Tradehere. A demonstration platform.</p>
            <p className="eyebrow flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
              Phase 1 · Sample data
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
