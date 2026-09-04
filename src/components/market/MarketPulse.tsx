"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { MarketPulseData, SectorPulse } from "@/types";
import { Delta } from "@/components/ui/Delta";
import { useRevealed } from "@/hooks/useRevealed";
import { cn } from "@/utils/cn";

/**
 * MARKET PULSE — the platform's signature visualisation.
 *
 * Sectors orbit a central mood reading. Position carries meaning:
 *   • angle  — performance rank, strongest at twelve o'clock, running clockwise
 *   • radius — momentum; the further out, the larger the move
 *   • size   — share of total market capitalisation
 *   • colour — direction, always doubled by an arrow and a signed number
 *
 * Every node is a real button, so the whole figure is keyboard operable and
 * announced properly; below `md` it collapses to a ranked list carrying the
 * same four dimensions without the geometry.
 *
 * Phase 2: swap `getMarketPulse()`'s source. This component only ever sees
 * `MarketPulseData`.
 */

const SHORT_NAMES: Record<string, string> = {
  financials: "Financials",
  it: "IT",
  energy: "Energy",
  fmcg: "FMCG",
  auto: "Auto",
  healthcare: "Health",
  "capital-goods": "Capital",
  metals: "Metals",
  utilities: "Utilities",
  "consumer-services": "Consumer",
  telecom: "Telecom",
};

function shortName(sector: SectorPulse) {
  return SHORT_NAMES[sector.id] ?? sector.name.split(" ")[0];
}

interface Placed {
  sector: SectorPulse;
  x: number;
  y: number;
  size: number;
}

export function MarketPulse({
  pulse,
  className,
}: {
  pulse: MarketPulseData;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(pulse.sectors[0]?.id ?? "");
  const reduceMotion = useReducedMotion();
  const figureRef = useRef<HTMLDivElement>(null);
  const { revealed, instant } = useRevealed(figureRef, { margin: "-60px" });
  const timing = (duration: number, delay: number) =>
    instant ? { duration: 0 } : { duration, delay, ease: [0.16, 1, 0.3, 1] as const };

  const placed = useMemo<Placed[]>(() => {
    const count = pulse.sectors.length;
    const maxShare = Math.max(...pulse.sectors.map((s) => s.marketCapShare), 1);

    return pulse.sectors.map((sector, index) => {
      const angle = ((-90 + (index * 360) / count) * Math.PI) / 180;
      const radius = 29 + 13 * sector.momentum;
      return {
        sector,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        size: 0.55 + 0.45 * Math.sqrt(sector.marketCapShare / maxShare),
      };
    });
  }, [pulse.sectors]);

  const active = pulse.sectors.find((s) => s.id === activeId) ?? pulse.sectors[0];

  return (
    <div className={cn("grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16", className)}>
      {/* ---- The constellation (md and up) ------------------------------- */}
      <div ref={figureRef} className="relative mx-auto hidden w-full max-w-[36rem] md:block">
        <div className="relative aspect-square w-full">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            <defs>
              <radialGradient id="pulse-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.42" />
                <stop offset="55%" stopColor="var(--color-brand-600)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--color-brand-700)" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="50" cy="50" r="44" fill="url(#pulse-core)" className={reduceMotion ? "" : "th-breathe"} />

            {[20, 30, 40].map((r, i) => (
              <motion.circle
                key={r}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="0.15"
                strokeDasharray="0.8 1.6"
                initial={reduceMotion ? false : { scale: 0.82, opacity: 0 }}
                animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.82, opacity: 0 }}
                transition={timing(1, 0.1 + i * 0.08)}
                style={{ transformOrigin: "50px 50px" }}
              />
            ))}

            {placed.map(({ sector, x, y }, index) => {
              const isActive = sector.id === activeId;
              return (
                <motion.line
                  key={sector.id}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke={
                    isActive
                      ? "rgba(255,255,255,0.5)"
                      : sector.direction === "up"
                        ? "rgba(52,211,153,0.28)"
                        : "rgba(255,122,114,0.26)"
                  }
                  strokeWidth={isActive ? 0.32 : 0.16}
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={revealed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={timing(0.7, 0.35 + index * 0.045)}
                />
              );
            })}
          </svg>

          {/* Central mood reading */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex size-[31%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-paper-200/15 bg-void-900/70 backdrop-blur-sm"
            initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
            animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.86, opacity: 0 }}
            transition={timing(0.75, 0)}
          >
            <span className="eyebrow text-paper-300/50">Mood</span>
            <span className="tnum mt-1 font-display text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-paper-50">
              {pulse.score}
            </span>
            <span className="mt-1.5 max-w-[9ch] text-center text-[0.6875rem] font-medium leading-tight text-brand-300">
              {pulse.label}
            </span>
          </motion.div>

          {/* Sector nodes */}
          {placed.map(({ sector, x, y, size }, index) => {
            const isActive = sector.id === activeId;
            const up = sector.direction === "up";
            return (
              <motion.button
                key={sector.id}
                type="button"
                onMouseEnter={() => setActiveId(sector.id)}
                onFocus={() => setActiveId(sector.id)}
                onClick={() => setActiveId(sector.id)}
                aria-pressed={isActive}
                aria-label={`${sector.name}, rank ${sector.rank} of ${pulse.sectors.length}, ${
                  up ? "up" : "down"
                } ${Math.abs(sector.changePercent).toFixed(2)} percent`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                transition={timing(0.5, 0.5 + index * 0.045)}
              >
                <span
                  className={cn(
                    "flex flex-col items-center gap-1.5",
                    !reduceMotion && "th-drift",
                  )}
                  style={{ animationDelay: `${index * 0.55}s` }}
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      up ? "bg-up-400" : "bg-down-400",
                      isActive ? "ring-4" : "ring-0",
                      up ? "ring-up-400/20" : "ring-down-400/20",
                    )}
                    style={{
                      width: `${0.5 + size * 0.75}rem`,
                      height: `${0.5 + size * 0.75}rem`,
                      opacity: isActive ? 1 : 0.55 + sector.momentum * 0.3,
                    }}
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap font-mono text-[0.625rem] font-medium tracking-wide transition-colors duration-300",
                      isActive ? "text-paper-50" : "text-paper-300/55",
                    )}
                  >
                    {shortName(sector)}
                    <span className={cn("ml-1", up ? "text-up-400" : "text-down-400")} aria-hidden>
                      {up ? "↑" : "↓"}
                    </span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ---- Mobile: same data, ranked ----------------------------------- */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between border-b border-paper-200/15 pb-5">
          <div>
            <p className="eyebrow text-paper-300/50">Market mood</p>
            <p className="tnum mt-2 font-display text-display-2 font-semibold leading-none text-paper-50">
              {pulse.score}
            </p>
          </div>
          <p className="text-sm font-medium text-brand-300">{pulse.label}</p>
        </div>
        <ul className="mt-2">
          {pulse.sectors.map((sector) => {
            const up = sector.direction === "up";
            return (
              <li key={sector.id} className="border-b border-paper-200/10 py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="tnum font-mono text-[0.6875rem] text-paper-300/40">
                      {String(sector.rank).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-paper-100">{sector.name}</span>
                  </span>
                  <Delta value={sector.changePercent} size="sm" onVoid />
                </div>
                <div className="mt-2.5 h-px w-full bg-paper-200/10">
                  <span
                    className={cn("block h-px", up ? "bg-up-400" : "bg-down-400")}
                    style={{ width: `${Math.max(sector.momentum * 100, 6)}%` }}
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---- Readout rail ------------------------------------------------ */}
      <div className="flex flex-col justify-center">
        <div aria-live="polite" className="border-b border-paper-200/15 pb-8">
          <p className="eyebrow text-paper-300/50">
            Rank {String(active.rank).padStart(2, "0")} · sector
          </p>
          <p className="mt-4 font-display text-display-3 font-semibold leading-none text-paper-50">
            {active.name}
          </p>
          <p className="mt-5 flex items-baseline gap-4">
            <Delta value={active.changePercent} size="lg" onVoid />
            <span className="font-mono text-xs text-paper-300/50">
              {active.advancers}↑ {active.decliners}↓
            </span>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-paper-200/65">
            {active.marketCapShare.toFixed(1)}% of total market capitalisation, with{" "}
            {(active.momentum * 100).toFixed(0)}% of the session&apos;s strongest sector move.
          </p>
        </div>

        <dl className="mt-8 space-y-5">
          <div>
            <dt className="eyebrow text-paper-300/50">Breadth</dt>
            <dd className="mt-3">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-paper-200/10">
                <span
                  className="bg-up-500"
                  style={{ width: `${pulse.breadth.advancePercent}%` }}
                  aria-hidden
                />
                <span className="flex-1 bg-down-500" aria-hidden />
              </div>
              <p className="tnum mt-3 flex justify-between font-mono text-xs text-paper-300/60">
                <span className="text-up-400">↑ {pulse.breadth.advancers.toLocaleString("en-IN")} advancing</span>
                <span className="text-down-400">{pulse.breadth.decliners.toLocaleString("en-IN")} declining ↓</span>
              </p>
            </dd>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-paper-200/15 pt-6">
            <div>
              <dt className="eyebrow text-up-400">Leading</dt>
              <dd className="mt-3 space-y-1.5">
                {pulse.leaders.map((s) => (
                  <p key={s.id} className="text-sm text-paper-200/80">
                    {s.name}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-down-400">Lagging</dt>
              <dd className="mt-3 space-y-1.5">
                {pulse.laggards.map((s) => (
                  <p key={s.id} className="text-sm text-paper-200/80">
                    {s.name}
                  </p>
                ))}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
