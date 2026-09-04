"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Set by `RevealGroup` so its items snap instead of tweening when forced. */
const InstantContext = createContext(false);

/**
 * Reveals content when it scrolls into view.
 *
 * Two fail-safes matter here, because sections carry the page's actual content:
 * if the document is not visible (background tab, print, prerender) the
 * intersection observer never fires, so we reveal on a short timer instead; and
 * the `data-reveal` hook lets the no-script stylesheet in the root layout
 * unhide everything when JavaScript is unavailable.
 */
function useRevealState(ref: React.RefObject<HTMLElement | null>, once: boolean) {
  const inView = useInView(ref, { once, margin: "-80px" });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      if (document.visibilityState !== "visible") setForced(true);
    };
    const timer = window.setTimeout(check, 600);
    return () => window.clearTimeout(timer);
  }, []);

  // When the reveal is forced (document not visible) rAF is throttled, so the
  // tween would freeze part-way — snap to the end state instead.
  return { show: inView || forced, instant: forced && !inView };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled during the entrance, in pixels. */
  y?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 18, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { show, instant } = useRevealState(ref, once);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className} data-reveal>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      data-reveal
      initial={{ opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={instant ? { duration: 0 } : { duration: 0.62, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children on scroll. Pair with `RevealItem`. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { show, instant } = useRevealState(ref, true);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className} data-reveal>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      data-reveal
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: instant
          ? { transition: { staggerChildren: 0, delayChildren: 0 } }
          : { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      <InstantContext.Provider value={instant}>{children}</InstantContext.Provider>
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const instant = useContext(InstantContext);

  if (reduceMotion) {
    return (
      <div className={className} data-reveal>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      data-reveal
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: instant ? { duration: 0 } : { duration: 0.6, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
