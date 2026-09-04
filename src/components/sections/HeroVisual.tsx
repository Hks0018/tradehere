"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Bell, Sparkles } from "lucide-react";
import type { MarketIndex, Stock } from "@/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/cn";
import { formatCurrency, formatPercent, trendClass } from "@/utils/format";

/**
 * The animated dashboard collage in the hero. Every layer is real markup
 * driven by the same mock data the rest of the platform uses — no screenshots.
 */
export function HeroVisual({
  index,
  watchlist,
  breadth,
}: {
  index: MarketIndex;
  watchlist: Stock[];
  breadth: { advancers: number; decliners: number };
}) {
  const reduceMotion = useReducedMotion();
  const total = breadth.advancers + breadth.decliners;

  const float = (delay: number) =>
    reduceMotion
      ? {}
      : {
          animate: { y: [0, -9, 0] },
          transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-200/45 via-transparent to-up-100/50 blur-3xl"
      />

      {/* Primary index panel */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative overflow-hidden rounded-[1.375rem] border border-ink-100 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(11,18,32,0.28)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="th-pulse-ring absolute inline-flex size-full rounded-full bg-up-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-up-500" />
              </span>
              <p className="text-sm font-semibold text-ink-900">{index.name}</p>
            </div>
            <p className="mt-3 tnum font-display text-3xl font-semibold tracking-[-0.025em] text-ink-900 sm:text-[2.25rem]">
              <AnimatedNumber value={index.value} />
            </p>
            <p className={cn("mt-1 tnum text-sm font-medium", trendClass(index.changePercent))}>
              +{index.change.toFixed(2)} ({formatPercent(index.changePercent)}) today
            </p>
          </div>
          <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
            <span className="rounded-pill border border-ink-100 bg-ink-50 px-2.5 py-1 text-[0.6875rem] font-medium text-ink-500">
              Sample session
            </span>
          </div>
        </div>

        <div className="mt-5">
          <AnimatedSparkline data={index.series.map((p) => p.v)} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4">
          {[
            { label: "Advancing", value: breadth.advancers, tone: "text-up-600" },
            { label: "Declining", value: breadth.decliners, tone: "text-down-600" },
            { label: "Breadth", value: `${Math.round((breadth.advancers / total) * 100)}%`, tone: "text-ink-900" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[0.6875rem] uppercase tracking-wider text-ink-400">{item.label}</p>
              <p className={cn("tnum mt-0.5 text-sm font-semibold", item.tone)}>{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating watchlist */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 28, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
        className="absolute -top-10 right-0 hidden w-60 sm:block lg:-right-6"
      >
        <motion.div
          {...float(0.4)}
          className="rounded-[1.125rem] border border-ink-100 bg-white/95 p-4 shadow-[0_18px_44px_-18px_rgba(11,18,32,0.3)] backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Watchlist</p>
            <Bell className="size-3.5 text-ink-300" aria-hidden />
          </div>
          <ul className="mt-3 space-y-2.5">
            {watchlist.slice(0, 3).map((stock) => (
              <li key={stock.symbol} className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-[0.625rem] font-bold text-ink-500">
                  {stock.symbol.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink-900">
                    {stock.symbol}
                  </span>
                  <span className="tnum block text-[0.6875rem] text-ink-400">
                    {formatCurrency(stock.price)}
                  </span>
                </span>
                <span className={cn("tnum text-xs font-semibold", trendClass(stock.changePercent))}>
                  {formatPercent(stock.changePercent)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Floating SIP projection */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -24, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.48 }}
        className="absolute bottom-16 -left-4 hidden w-56 sm:block lg:-left-12"
      >
        <motion.div
          {...float(1.4)}
          className="rounded-[1.125rem] border border-ink-100 bg-white/95 p-4 shadow-[0_18px_44px_-18px_rgba(11,18,32,0.3)] backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            <p className="text-xs font-semibold text-ink-900">SIP projection</p>
          </div>
          <p className="mt-3 tnum font-display text-xl font-semibold text-ink-900">
            <AnimatedNumber value={3222522} decimals={0} prefix="₹" duration={1.4} />
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-ink-400">
            ₹10,000/month · 12% · 12 years
          </p>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-ink-100">
            <span className="w-[51%] bg-ink-300" aria-hidden />
            <span className="flex-1 bg-brand-500" aria-hidden />
          </div>
          <div className="mt-2 flex justify-between text-[0.625rem] text-ink-400">
            <span>Invested</span>
            <span>Returns</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Small floating gain pill */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
        className="absolute -bottom-6 right-8 hidden lg:block"
      >
        <motion.div
          {...float(2.2)}
          className="flex items-center gap-1.5 rounded-pill bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white shadow-lift"
        >
          <ArrowUpRight className="size-3.5 text-up-500" aria-hidden />
          Banking index +1.12%
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Area chart whose stroke draws itself in on mount. */
function AnimatedSparkline({ data }: { data: number[] }) {
  const reduceMotion = useReducedMotion();
  const width = 520;
  const height = 132;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 6 - ((v - min) / range) * (height - 24);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${points.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  const lastPoint = points[points.length - 1].split(",").map(Number);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Sample intraday movement for the index"
    >
      <defs>
        <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-up-500)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-up-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="var(--color-ink-100)"
          strokeDasharray="4 5"
        />
      ))}
      <motion.path
        d={area}
        fill="url(#hero-area)"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--color-up-500)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      />
      <motion.circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="4.5"
        fill="var(--color-up-500)"
        stroke="#fff"
        strokeWidth="2.5"
        initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.6 }}
      />
    </svg>
  );
}
