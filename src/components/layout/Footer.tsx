import Link from "next/link";
import { FOOTER_NAV } from "@/data/navigation";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div aria-hidden className="th-grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl"
      />
      <div className="container-page relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo onDark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-400">
              One intelligent platform for understanding financial markets and making smarter
              financial decisions.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-pill border border-white/15 px-3 py-1.5 text-xs font-medium text-ink-300">
              <span aria-hidden className="size-1.5 rounded-full bg-gold-500" />
              Phase 1 preview · sample data
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {FOOTER_NAV.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-card border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs leading-relaxed text-ink-400">
            <span className="font-semibold text-ink-300">Important:</span> Tradehere is a market
            information and education product. All prices, indices, fund figures, IPO details and
            news on this site are sample data created for demonstration and are not live market
            data. Nothing here is investment, legal or tax advice, and no returns are promised or
            guaranteed. Investments in securities and mutual funds are subject to market risks,
            including possible loss of principal. Read all scheme-related documents carefully and
            consult a qualified adviser before investing.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tradehere. A demonstration platform.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/learn" className="transition-colors hover:text-white">Learn</Link></li>
            <li><Link href="/tools" className="transition-colors hover:text-white">Tools</Link></li>
            <li><Link href="/news" className="transition-colors hover:text-white">News</Link></li>
            <li><Link href="/markets" className="transition-colors hover:text-white">Markets</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
