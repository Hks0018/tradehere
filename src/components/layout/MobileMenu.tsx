"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/data/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { cn } from "@/utils/cn";

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
        <div className="fixed inset-0 z-100 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-ink-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-lift"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex size-10 items-center justify-center rounded-pill border border-ink-200 text-ink-700"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="border-b border-ink-100 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="flex w-full items-center gap-2.5 rounded-pill border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-400"
              >
                <Search className="size-4" aria-hidden />
                Search stocks, funds, news…
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-1">
                {PRIMARY_NAV.map((group, index) => {
                  const isOpen = expanded === group.label;
                  return (
                    <motion.li
                      key={group.label}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-center">
                        <Link
                          href={group.href}
                          onClick={onClose}
                          className="flex-1 rounded-xl px-3 py-3 text-base font-medium text-ink-900"
                        >
                          {group.label}
                        </Link>
                        {group.columns && (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.label}`}
                            onClick={() => setExpanded(isOpen ? null : group.label)}
                            className="flex size-10 items-center justify-center rounded-xl text-ink-400"
                          >
                            <ChevronDown
                              className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && group.columns && (
                          <motion.div
                            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <ul className="mb-2 ml-3 space-y-0.5 border-l border-ink-100 pl-3">
                              {group.columns.flatMap((column) => column.links).map((link) => (
                                <li key={link.label + link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={onClose}
                                    className="block rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-50 hover:text-ink-900"
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

            <div className="grid grid-cols-2 gap-3 border-t border-ink-100 px-5 py-4">
              <Button href="/learn" variant="secondary" onClick={onClose}>
                Sign In
              </Button>
              <Button href="/markets" onClick={onClose}>
                Get Started
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
