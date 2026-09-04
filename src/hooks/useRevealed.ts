"use client";

import { useInView, type UseInViewOptions } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";

interface RevealedState {
  /** True once the element should be shown. */
  revealed: boolean;
  /** True when revealing without an intersection — animate with duration 0. */
  instant: boolean;
}

/**
 * Scroll-reveal state with a fail-safe.
 *
 * Sections carry the page's actual content, so they must never be stranded at
 * opacity 0. When the document is not visible — a background tab, a print, a
 * prerender — the intersection observer never fires and `requestAnimationFrame`
 * is throttled, so we reveal on a short timer and snap to the end state instead
 * of starting a tween that would freeze part-way.
 */
export function useRevealed(
  ref: RefObject<Element | null>,
  { once = true, margin = "-80px" }: { once?: boolean; margin?: UseInViewOptions["margin"] } = {},
): RevealedState {
  const inView = useInView(ref, { once, margin });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") setForced(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  return { revealed: inView || forced, instant: forced && !inView };
}
