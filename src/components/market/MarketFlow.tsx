"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { FlowChain } from "@/types";
import { useRevealed } from "@/hooks/useRevealed";
import { Delta } from "@/components/ui/Delta";
import { cn } from "@/utils/cn";

/**
 * MARKET FLOW — where momentum is rotating.
 *
 * Each chain reads left to right in order of strength, with a dashed current
 * travelling between the nodes to carry direction. Deliberately simple: two
 * sentences and two chains, readable in about three seconds.
 */
export function MarketFlow({ chains }: { chains: FlowChain[] }) {
  return (
    <div className="space-y-14 lg:space-y-16">
      {chains.map((chain, chainIndex) => (
        <Chain key={chain.id} chain={chain} index={chainIndex} />
      ))}
    </div>
  );
}

function Chain({ chain, index }: { chain: FlowChain; index: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { revealed, instant } = useRevealed(ref);
  const strong = chain.tone === "strong";

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={
        instant ? { duration: 0 } : { duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }
      }
      className="grid gap-8 border-t border-paper-200/12 pt-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12"
    >
      <div>
        <p
          className={cn(
            "eyebrow flex items-center gap-2",
            strong ? "text-up-400" : "text-down-400",
          )}
        >
          <span aria-hidden>{strong ? "↑" : "↓"}</span>
          {chain.label}
        </p>
        <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-paper-200/60">
          {chain.detail}
        </p>
      </div>

      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {chain.nodes.map((node, i) => (
          <li key={node.name} className="flex min-w-0 items-center sm:flex-1">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold tracking-[-0.025em] text-paper-50 sm:text-2xl">
                {node.name}
              </p>
              <Delta value={node.changePercent} size="sm" onVoid className="mt-1.5" />
            </div>

            {i < chain.nodes.length - 1 && (
              <Connector strong={strong} reduceMotion={Boolean(reduceMotion)} />
            )}
          </li>
        ))}
      </ol>
    </motion.div>
  );
}

function Connector({ strong, reduceMotion }: { strong: boolean; reduceMotion: boolean }) {
  const color = strong ? "var(--color-up-400)" : "var(--color-down-400)";

  return (
    <span aria-hidden className="mx-4 hidden h-6 w-16 shrink-0 items-center sm:flex lg:w-24">
      <svg viewBox="0 0 100 8" className="size-full overflow-visible" fill="none">
        <line x1="0" y1="4" x2="88" y2="4" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <motion.line
          x1="0"
          y1="4"
          x2="88"
          y2="4"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="6 10"
          initial={{ strokeDashoffset: 0 }}
          animate={reduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: -32 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: "linear" }
          }
          opacity={0.9}
        />
        <path d="M88 0.5 L96 4 L88 7.5" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
