"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/data/navigation";
import { cn } from "@/utils/cn";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { useSearch } from "./SearchProvider";

/**
 * Editorial navigation. Type-led rather than pill-led: items are plain text
 * with a hairline indicator, and the bar inverts itself while it sits over a
 * dark hero (any page can opt in by marking that region `data-hero-dark`).
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { openSearch } = useSearch();
  const reduceMotion = useReducedMotion();

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector("[data-hero-dark]");
      const bottom = hero ? hero.getBoundingClientRect().bottom : 0;
      setOverHero(bottom > 72);
      setScrolled(window.scrollY > 8);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const inverted = overHero && !openMenu;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-200 focus:rounded-pill focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-paper-50"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-90 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          inverted && "on-void border-b border-transparent bg-transparent",
          !inverted && scrolled && "border-b border-ink-100 bg-paper-50/85 backdrop-blur-xl",
          !inverted && !scrolled && "border-b border-transparent bg-transparent",
          openMenu && "border-b border-ink-100 bg-paper-50",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-page">
          <div className="flex h-18 items-center justify-between gap-8">
            <Logo onDark={inverted} />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {PRIMARY_NAV.map((group) => {
                  const active = pathname.startsWith(group.href) && group.href !== "/";
                  const expanded = openMenu === group.label;
                  return (
                    <li key={group.label} onMouseEnter={() => setOpenMenu(group.label)}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-haspopup="true"
                        onClick={() => setOpenMenu(expanded ? null : group.label)}
                        onFocus={() => setOpenMenu(group.label)}
                        className={cn(
                          "relative py-2 text-sm font-medium transition-colors",
                          inverted
                            ? "text-paper-200/80 hover:text-paper-50"
                            : expanded || active
                              ? "text-ink-900"
                              : "text-ink-600 hover:text-ink-900",
                        )}
                      >
                        {group.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            inverted ? "bg-paper-50" : "bg-ink-900",
                            expanded || active ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search the platform"
                className={cn(
                  "hidden items-center gap-2.5 text-sm transition-colors sm:flex",
                  inverted ? "text-paper-200/70 hover:text-paper-50" : "text-ink-500 hover:text-ink-900",
                )}
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10.6 10.6 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="eyebrow hidden md:inline">Search</span>
                <kbd
                  className={cn(
                    "hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] md:block",
                    inverted ? "border-paper-200/25 text-paper-300/60" : "border-ink-200 text-ink-400",
                  )}
                >
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/learn"
                className={cn(
                  "hidden text-sm font-medium transition-colors md:block",
                  inverted ? "text-paper-200/80 hover:text-paper-50" : "text-ink-600 hover:text-ink-900",
                )}
              >
                Sign In
              </Link>

              <Link
                href="/markets"
                className={cn(
                  "group/cta hidden items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium transition-colors duration-300 md:inline-flex",
                  inverted
                    ? "bg-paper-50 text-void-950 hover:bg-brand-400"
                    : "bg-ink-900 text-paper-50 hover:bg-brand-600",
                )}
              >
                Enter the market
                <span aria-hidden className="transition-transform duration-300 group-hover/cta:translate-x-0.5">
                  →
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className={cn(
                  "flex size-10 flex-col items-center justify-center gap-1.5 lg:hidden",
                  inverted ? "text-paper-50" : "text-ink-900",
                )}
              >
                <span aria-hidden className="h-px w-5 bg-current" />
                <span aria-hidden className="h-px w-5 bg-current" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openMenu && (
            <motion.div
              key={openMenu}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-ink-100 bg-paper-50 lg:block"
            >
              <MegaMenu label={openMenu} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} onSearch={openSearch} />
    </>
  );
}

function MegaMenu({ label }: { label: string }) {
  const group = PRIMARY_NAV.find((g) => g.label === label);
  if (!group?.columns) return null;

  return (
    <div className="container-page py-12">
      <div className="grid grid-cols-12 gap-x-12 gap-y-8">
        <div className="col-span-3">
          <p className="eyebrow text-ink-400">{group.label}</p>
          <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
            {group.featured?.title ?? group.label}
          </p>
          {group.featured && (
            <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-ink-500">
              {group.featured.description}
            </p>
          )}
        </div>

        {group.columns.map((column) => (
          <div key={column.title} className="col-span-3">
            <p className="eyebrow mb-5 text-ink-400">{column.title}</p>
            <ul className="space-y-0">
              {column.links.map((link) => (
                <li key={link.label + link.href} className="border-t border-ink-100 last:border-b">
                  <Link href={link.href} className="group/item block py-3.5">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-[0.9375rem] font-medium text-ink-800 transition-colors group-hover/item:text-brand-600">
                        {link.label}
                      </span>
                      <span
                        aria-hidden
                        className="text-ink-300 transition-transform duration-300 group-hover/item:translate-x-0.5 group-hover/item:text-brand-600"
                      >
                        →
                      </span>
                    </span>
                    {link.description && (
                      <span className="mt-0.5 block text-xs text-ink-400">{link.description}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {group.featured && (
          <div className="col-span-3 flex items-end">
            <Link
              href={group.featured.href}
              className="group/feat relative flex w-full flex-col justify-end overflow-hidden rounded-card bg-void-950 p-6 text-paper-100"
            >
              <div aria-hidden className="th-grid-void absolute inset-0 opacity-70" />
              <div
                aria-hidden
                className="absolute -right-12 -top-12 size-40 rounded-full bg-brand-500/25 blur-3xl transition-transform duration-700 group-hover/feat:scale-125"
              />
              <p className="eyebrow relative text-brand-300">Featured</p>
              <p className="relative mt-3 font-display text-lg font-semibold leading-snug">
                {group.featured.title}
              </p>
              <p className="relative mt-4 inline-flex items-center gap-1.5 text-sm text-paper-300">
                {group.featured.cta}
                <span aria-hidden className="transition-transform duration-300 group-hover/feat:translate-x-1">→</span>
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
