"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/data/navigation";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { useSearch } from "./SearchProvider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Navigating away closes any open menu. Adjusting state during render is the
  // recommended alternative to a state-setting effect.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  const { openSearch } = useSearch();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-pill focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-90 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "border-b border-ink-100 bg-white/85 backdrop-blur-xl shadow-[0_1px_20px_-8px_rgba(11,18,32,0.18)]"
            : "border-b border-transparent bg-white/0",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-page">
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-all duration-300",
              scrolled ? "h-15" : "h-18",
            )}
          >
            <Logo />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-0.5">
                {PRIMARY_NAV.map((group) => {
                  const active = pathname.startsWith(group.href) && group.href !== "/";
                  const expanded = openMenu === group.label;
                  return (
                    <li key={group.label} onMouseEnter={() => setOpenMenu(group.label)}>
                      {group.columns ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-haspopup="true"
                          onClick={() => setOpenMenu(expanded ? null : group.label)}
                          onFocus={() => setOpenMenu(group.label)}
                          className={cn(
                            "flex items-center gap-1 rounded-pill px-3.5 py-2 text-[0.9375rem] font-medium transition-colors",
                            active || expanded
                              ? "text-ink-900 bg-ink-50"
                              : "text-ink-600 hover:text-ink-900 hover:bg-ink-50",
                          )}
                        >
                          {group.label}
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform duration-200",
                              expanded && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                      ) : (
                        <Link
                          href={group.href}
                          className="rounded-pill px-3.5 py-2 text-[0.9375rem] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                        >
                          {group.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search the platform"
                className="flex items-center gap-2 rounded-pill border border-ink-200 bg-white px-3 py-2 text-sm text-ink-400 transition-colors hover:border-ink-300 hover:text-ink-600 sm:pr-2"
              >
                <Search className="size-4" aria-hidden />
                <span className="hidden sm:inline">Search</span>
                <kbd className="ml-2 hidden rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[0.6875rem] font-medium md:block">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/learn"
                className="hidden rounded-pill px-3.5 py-2 text-[0.9375rem] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 md:block"
              >
                Sign In
              </Link>
              <Button href="/markets" size="sm" className="hidden md:inline-flex">
                Get Started
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className="flex size-10 items-center justify-center rounded-pill border border-ink-200 text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openMenu && (
            <motion.div
              key={openMenu}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-ink-100 bg-white/95 backdrop-blur-xl shadow-[0_24px_48px_-24px_rgba(11,18,32,0.25)] lg:block"
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
    <div className="container-page py-8">
      <div className="grid grid-cols-12 gap-8">
        {group.columns.map((column) => (
          <div key={column.title} className={group.featured ? "col-span-4" : "col-span-6"}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
              {column.title}
            </p>
            <ul className="space-y-0.5">
              {column.links.map((link) => (
                <li key={link.label + link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink-50"
                  >
                    {link.icon && (
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                        <Icon name={link.icon} className="size-4" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink-900">{link.label}</span>
                      {link.description && (
                        <span className="block text-xs text-ink-400">{link.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {group.featured && (
          <div className="col-span-4">
            <div className="relative h-full overflow-hidden rounded-card bg-ink-900 p-6">
              <div aria-hidden className="th-grid-bg absolute inset-0 opacity-70" />
              <div
                aria-hidden
                className="absolute -right-16 -top-16 size-48 rounded-full bg-brand-500/25 blur-3xl"
              />
              <div className="relative">
                <p className="font-display text-lg font-semibold text-white">{group.featured.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  {group.featured.description}
                </p>
                <Link
                  href={group.featured.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition-colors hover:text-white"
                >
                  {group.featured.cta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
