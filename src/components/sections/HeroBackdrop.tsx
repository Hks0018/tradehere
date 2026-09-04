"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { PricePoint } from "@/types";

/**
 * The hero's living background: the session's real index series, normalised and
 * layered as drawn lines. Nothing here is decorative noise — every curve is a
 * market in the dataset, which is why it reads as alive rather than as a
 * generic particle field.
 */
export function HeroBackdrop({ series }: { series: PricePoint[][] }) {
  const reduceMotion = useReducedMotion();

  const paths = useMemo(() => {
    const width = 1200;
    const height = 520;

    return series.slice(0, 5).map((points, layer) => {
      const values = points.map((p) => p.v);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      // Each layer sits lower and swings less, building depth.
      const amplitude = 118 - layer * 15;
      const baseline = height * (0.42 + layer * 0.1);

      const d = values
        .map((v, i) => {
          const x = (i / (values.length - 1)) * width;
          const y = baseline - ((v - min) / range - 0.5) * amplitude;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

      return { d, layer };
    });
  }, [series]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="th-grid-void absolute inset-0 opacity-70" />

      <div className="absolute -right-[15%] -top-[25%] size-[46rem] rounded-full bg-brand-600/18 blur-[140px]" />
      <div className="absolute -bottom-[35%] -left-[10%] size-[40rem] rounded-full bg-up-500/10 blur-[150px]" />

      <svg
        viewBox="0 0 1200 520"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[70%] w-full"
      >
        <defs>
          <linearGradient id="hero-line-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="18%" stopColor="#fff" stopOpacity="1" />
            <stop offset="82%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="hero-mask">
            <rect width="1200" height="520" fill="url(#hero-line-fade)" />
          </mask>
        </defs>

        <g mask="url(#hero-mask)">
          {paths.map(({ d, layer }) => (
            <motion.path
              key={layer}
              d={d}
              fill="none"
              stroke={layer === 0 ? "var(--color-up-400)" : "#ffffff"}
              strokeWidth={layer === 0 ? 1.6 : 1}
              strokeOpacity={layer === 0 ? 0.55 : 0.16 - layer * 0.025}
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2.4,
                delay: 0.3 + layer * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void-950" />
    </div>
  );
}
