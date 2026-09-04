import type { CalculatorMeta, EcosystemProduct } from "@/types";

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: "sip", slug: "sip", name: "SIP Calculator", icon: "TrendingUp", accent: "#4a3fdc",
    tagline: "Project a monthly investment plan",
    description: "See what a fixed monthly investment could grow into, with a year-by-year breakdown of contributions and returns.",
  },
  {
    id: "emi", slug: "emi", name: "EMI Calculator", icon: "Landmark", accent: "#0fa968",
    tagline: "Work out a loan repayment",
    description: "Calculate the monthly instalment, total interest and total outflow for any loan amount, rate and tenure.",
  },
  {
    id: "fd", slug: "fd", name: "FD Calculator", icon: "PiggyBank", accent: "#d9a441",
    tagline: "Estimate a deposit maturity",
    description: "Find the maturity value and interest earned on a fixed deposit compounded quarterly.",
  },
  {
    id: "compound-interest", slug: "compound-interest", name: "Compound Interest Calculator", icon: "Sigma", accent: "#12a5a5",
    tagline: "See compounding at work",
    description: "Model how a one-time investment grows over time at a chosen rate and compounding frequency.",
  },
  {
    id: "retirement", slug: "retirement", name: "Retirement Calculator", icon: "Sunrise", accent: "#e14b4b",
    tagline: "Size the corpus you will need",
    description: "Estimate the retirement corpus your expenses require, and the monthly investment needed to reach it.",
  },
];

export const ECOSYSTEM: EcosystemProduct[] = [
  {
    id: "stocks", name: "Stocks", icon: "LineChart", href: "/stocks", accent: "#4a3fdc",
    description: "Screen listed companies, compare fundamentals and follow price action across sectors.",
    stat: "28", statLabel: "companies covered",
  },
  {
    id: "mutual-funds", name: "Mutual Funds", icon: "Layers", href: "/mutual-funds", accent: "#0fa968",
    description: "Compare equity, debt, hybrid and index schemes on returns, risk, cost and fund size.",
    stat: "18", statLabel: "schemes profiled",
  },
  {
    id: "ipos", name: "IPOs", icon: "Rocket", href: "/ipo", accent: "#e14b4b",
    description: "Track upcoming, open and recently listed offerings with price bands, lot sizes and timelines.",
    stat: "12", statLabel: "offerings tracked",
  },
  {
    id: "etfs", name: "ETFs", icon: "Boxes", href: "/mutual-funds?category=Index", accent: "#5b54ec",
    description: "Explore low-cost index-tracking schemes and understand how passive exposure is constructed.",
    stat: "0.12%", statLabel: "lowest expense ratio",
  },
  {
    id: "fd", name: "Fixed Deposits", icon: "PiggyBank", href: "/tools/fd", accent: "#d9a441",
    description: "Model deposit maturity values and compare how tenure and compounding change the outcome.",
    stat: "7.4%", statLabel: "sample rate modelled",
  },
  {
    id: "gold", name: "Gold", icon: "Gem", href: "/learn/portfolio-diversification", accent: "#b8862d",
    description: "Understand where gold fits in an allocation and how it has behaved through market cycles.",
    stat: "Guide", statLabel: "allocation explained",
  },
];

export const PLATFORM_VALUES = [
  {
    id: "v1", icon: "Sparkles", title: "Simple financial insights",
    description: "Complex market information, translated into language that makes sense on the first read.",
  },
  {
    id: "v2", icon: "Radar", title: "Powerful market information",
    description: "Indices, sectors, movers and company fundamentals organised into one coherent view.",
  },
  {
    id: "v3", icon: "Calculator", title: "Smart financial tools",
    description: "Working calculators that model real outcomes for investments, loans and retirement.",
  },
  {
    id: "v4", icon: "GraduationCap", title: "Learn before you invest",
    description: "A structured education library that builds understanding before any decision is made.",
  },
];
