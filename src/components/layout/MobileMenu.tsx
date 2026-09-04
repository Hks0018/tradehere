"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/data/navigation";
import { Logo } from "./Logo";
import { cn } from "@/utils/cn";

/**
 * Full-height dark menu. Sections open one at a time as large type rather than
 * as a dense link list, so it reads on a phone at arm's length.
 */
export function MobileMenu({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(PRIMARY_NAV[0]?.label ?? null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="on-void fixed inset-0 z-100 flex flex-col bg-void-950 text-paper-100 lg:hidden"
          initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div aria-hidden className="th-grid-void pointer-events-none absolute inset-0 opacity-60" />

          <div className="relative flex h-18 items-center justify-between px-6">
            <Logo onDark />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex size-10 items-center justify-center text-paper-100"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative px-6 pb-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearch();
              }}
              className="flex w-full items-center gap-3 border-b border-paper-200/15 pb-4 text-left text-sm text-paper-300/70"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.6 10.6 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Search stocks, funds, lessons…
            </button>
          </div>

          <nav aria-label="Mobile" className="relative flex-1 overflow-y-auto px-6">
            <ul>
              {PRIMARY_NAV.map((group, index) => {
                const isOpen = expanded === group.label;
                return (
                  <motion.li
                    key={group.label}
                    className="border-b border-paper-200/12"
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center">
                      <Link
                        href={group.href}
                        onClick={onClose}
                        className="flex-1 py-5 font-display text-3xl font-semibold tracking-[-0.035em] text-paper-50"
                      >
                        {group.label}
                      </Link>
                      {group.columns && (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.label}`}
                          onClick={() => setExpanded(isOpen ? null : group.label)}
                          className="flex size-11 items-center justify-center text-paper-300/60"
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "block transition-transform duration-300",
                              isOpen ? "rotate-45" : "rotate-0",
                            )}
                          >
                            +
                          </span>
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && group.columns && (
                        <motion.div
                          initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <ul className="pb-5">
                            {group.columns.flatMap((column) => column.links).map((link) => (
                              <li key={link.label + link.href}>
                                <Link
                                  href={link.href}
                                  onClick={onClose}
                                  className="block py-2 text-[0.9375rem] text-paper-300/75"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <div className="relative flex items-center gap-3 px-6 py-6">
            <Link
              href="/learn"
              onClick={onClose}
              className="flex-1 rounded-pill border border-paper-200/25 py-3.5 text-center text-sm font-medium text-paper-100"
            >
              Sign In
            </Link>
            <Link
              href="/markets"
              onClick={onClose}
              className="flex-1 rounded-pill bg-paper-50 py-3.5 text-center text-sm font-medium text-void-950"
            >
              Enter the market
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
