import type { LearnItem, LearningPath } from "@/types";

/** DEMO CONTENT — educational material written for this prototype. */
export const LEARN_ITEMS: LearnItem[] = [
  {
    id: "l-01", slug: "what-are-stocks", title: "What are stocks?",
    excerpt: "A share of stock is a unit of ownership in a business. Everything else follows from that one idea.",
    level: "Beginner", format: "Article", topic: "Stock Market Basics", minutes: 6, accent: "#4a3fdc",
    body: [
      { heading: "Ownership, not a lottery ticket", paragraphs: [
        "A share of stock represents a fractional ownership claim on a company. If a business has issued one crore shares and you hold one hundred of them, you own a one-lakh-th of that business.",
        "That claim entitles you to a proportional share of whatever the company earns and eventually distributes, and to a vote on certain corporate matters.",
      ]},
      { heading: "Where the return comes from", paragraphs: [
        "Returns arrive through two channels: capital appreciation, when the market re-prices the business higher, and dividends, when the company distributes part of its profit.",
        "Over long periods, the price of a share tends to track the underlying earnings of the business. Over short periods it tracks sentiment, liquidity and news flow far more closely.",
      ]},
      { heading: "The risk you are accepting", paragraphs: [
        "Shareholders sit last in line. Lenders, suppliers and employees are paid before equity holders receive anything, which is precisely why equity carries a higher expected return than debt.",
        "That ordering also means the full loss of capital is possible. Equity investments are subject to market risk and there is no assurance of any return.",
      ]},
    ],
  },
  {
    id: "l-02", slug: "how-the-stock-market-works", title: "How does the stock market work?",
    excerpt: "Exchanges, brokers, clearing corporations and depositories — the plumbing behind a single trade.",
    level: "Beginner", format: "Article", topic: "Stock Market Basics", minutes: 7, accent: "#12a5a5",
    body: [
      { heading: "The primary and secondary markets", paragraphs: [
        "Companies raise money from investors in the primary market, typically through an initial public offering. After that, those shares change hands between investors in the secondary market.",
        "Money in a secondary-market trade moves between two investors, not into the company. This distinction explains why day-to-day price movement does not directly fund the business.",
      ]},
      { heading: "What happens when you place an order", paragraphs: [
        "An order travels from a broker to the exchange, where it is matched against an opposing order in a continuous auction. Price and time priority determine which orders match first.",
        "A clearing corporation then guarantees settlement, and a depository moves the shares into the buyer's demat account. The whole chain exists to make sure neither side has to trust the other.",
      ]},
      { heading: "Why prices move", paragraphs: [
        "Price is simply the level at which a willing buyer and a willing seller last agreed. It moves when new information, or a change in the willingness to hold risk, shifts that balance.",
      ]},
    ],
  },
  {
    id: "l-03", slug: "what-is-a-mutual-fund", title: "What is a mutual fund?",
    excerpt: "Pooled money, a professional manager, and a single NAV — how collective investing actually works.",
    level: "Beginner", format: "Article", topic: "Mutual Funds", minutes: 6, accent: "#0fa968",
    body: [
      { heading: "The pooling idea", paragraphs: [
        "A mutual fund collects money from many investors and invests it as a single portfolio according to a stated objective. Each investor holds units representing a share of that portfolio.",
        "This gives a small investor access to a diversified portfolio that would be impractical to assemble individually.",
      ]},
      { heading: "Net asset value", paragraphs: [
        "The value of one unit is the fund's total portfolio value, less expenses and liabilities, divided by the number of units outstanding. This is the net asset value, published at the end of each business day.",
        "A low NAV is not 'cheap' and a high NAV is not 'expensive'. What matters is the percentage change, not the absolute number.",
      ]},
      { heading: "What you pay", paragraphs: [
        "The expense ratio is an annual charge applied to the fund's assets. It is already reflected in the published NAV, so it is easy to overlook — and easy to underestimate over long holding periods.",
        "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.",
      ]},
    ],
  },
  {
    id: "l-04", slug: "understanding-sip", title: "Systematic investing explained",
    excerpt: "Why investing a fixed amount on a fixed date removes the hardest decision from investing.",
    level: "Beginner", format: "Video", topic: "Mutual Funds", minutes: 9, accent: "#d9a441",
    body: [
      { heading: "A rule instead of a judgement", paragraphs: [
        "A systematic investment plan commits a fixed amount at a fixed interval regardless of market level. It replaces a recurring judgement call with a rule.",
        "The practical benefit is behavioural: it removes the temptation to wait for a better entry point, which is the single most common reason investment plans stall.",
      ]},
      { heading: "Rupee cost averaging", paragraphs: [
        "Because the amount is fixed, a falling price buys more units and a rising price buys fewer. The average cost per unit therefore sits below the average price over a volatile period.",
        "This does not protect against loss in a sustained decline, and it does not outperform a lump sum in a steadily rising market. It reduces the consequence of timing, not the risk of the asset.",
      ]},
    ],
  },
  {
    id: "l-05", slug: "reading-a-balance-sheet", title: "Reading a balance sheet",
    excerpt: "Assets, liabilities and equity — and the three ratios that tell you most of what you need.",
    level: "Beginner", format: "Guide", topic: "Stock Market Basics", minutes: 8, accent: "#5b54ec",
    body: [
      { heading: "The accounting identity", paragraphs: [
        "Assets equal liabilities plus shareholders' equity. Every balance sheet is a statement of what a business controls and who has a claim on it.",
        "The income statement tells you what happened over a period; the balance sheet tells you where things stand at a point in time.",
      ]},
      { heading: "Three ratios worth memorising", paragraphs: [
        "Debt to equity shows how much of the business is funded by borrowing. Current ratio shows whether short-term assets cover short-term obligations. Return on equity shows how much profit is generated per rupee of owner capital.",
        "None of these are meaningful in isolation. They are comparative tools — against the company's own history, and against direct competitors.",
      ]},
    ],
  },
  {
    id: "l-06", slug: "fundamental-analysis", title: "Fundamental analysis",
    excerpt: "Valuing a business from its earnings power rather than its price chart.",
    level: "Intermediate", format: "Article", topic: "Advanced Investing", minutes: 10, accent: "#4a3fdc",
    body: [
      { heading: "The central question", paragraphs: [
        "Fundamental analysis asks what a business is worth based on the cash it can generate, and then compares that estimate to the price the market is asking.",
        "The inputs are revenue growth, margins, capital intensity and the cost of capital. Small changes in assumptions produce large changes in output, which is why a range matters more than a point estimate.",
      ]},
      { heading: "Multiples as shorthand", paragraphs: [
        "Price-to-earnings, EV/EBITDA and price-to-book are compressed versions of a full valuation. They are useful for comparison and dangerous when used without context.",
        "A high multiple is not automatically expensive — it may reflect durable growth. A low multiple is not automatically cheap — it may reflect a deteriorating business.",
      ]},
      { heading: "Quality of earnings", paragraphs: [
        "Reported profit and cash generated from operations should broadly track each other over time. A persistent gap between the two is worth understanding before anything else.",
      ]},
    ],
  },
  {
    id: "l-07", slug: "technical-analysis", title: "Technical analysis basics",
    excerpt: "Trend, support, resistance and volume — what price history can and cannot tell you.",
    level: "Intermediate", format: "Article", topic: "Advanced Investing", minutes: 9, accent: "#e14b4b",
    body: [
      { heading: "The premise", paragraphs: [
        "Technical analysis studies price and volume history on the assumption that market behaviour repeats often enough to be useful.",
        "It makes no claim about what a business is worth. It is a framework for describing what participants are currently doing.",
      ]},
      { heading: "Core concepts", paragraphs: [
        "Trend describes the general direction of price over a chosen window. Support and resistance are levels where price has historically stalled. Volume indicates the conviction behind a move.",
        "Moving averages smooth noise to make trend visible. They lag by construction, which is the trade-off for removing short-term variability.",
      ]},
      { heading: "The honest limitation", paragraphs: [
        "Patterns are far easier to identify after the fact than in real time, and no pattern has a guaranteed outcome. Technical signals are probabilistic and should never be treated as assurances.",
      ]},
    ],
  },
  {
    id: "l-08", slug: "portfolio-diversification", title: "Portfolio diversification",
    excerpt: "Reducing the damage any single holding can do — without diluting the portfolio into an index.",
    level: "Intermediate", format: "Guide", topic: "Personal Finance", minutes: 8, accent: "#0fa968",
    body: [
      { heading: "What diversification actually does", paragraphs: [
        "Diversification reduces exposure to risks specific to one company or sector. It does not reduce market risk, which affects all holdings together.",
        "The benefit comes from combining assets whose returns are not perfectly correlated, not from simply owning more things.",
      ]},
      { heading: "Where investors go wrong", paragraphs: [
        "Holding six funds from the same category is a common mistake. If they own substantially the same securities, the portfolio's true concentration has not changed.",
        "The opposite error is over-diversification, where a portfolio holds so many positions that it approximates an index while paying active fees.",
      ]},
      { heading: "Rebalancing", paragraphs: [
        "Allocations drift as assets perform differently. Periodic rebalancing restores the intended risk profile and enforces the discipline of trimming what has run and adding to what has lagged.",
      ]},
    ],
  },
  {
    id: "l-09", slug: "understanding-risk-and-return", title: "Risk and return",
    excerpt: "Volatility, drawdown and permanent loss are three different things. Confusing them is expensive.",
    level: "Intermediate", format: "Article", topic: "Personal Finance", minutes: 7, accent: "#12a5a5",
    body: [
      { heading: "Three different risks", paragraphs: [
        "Volatility is how much a price fluctuates. Drawdown is how far it falls from a previous peak. Permanent loss is capital that does not come back.",
        "Only the third is unambiguously bad. For a long-horizon investor, volatility is the price of admission rather than the danger itself.",
      ]},
      { heading: "Matching horizon to asset", paragraphs: [
        "The practical rule is that money needed within a short window should not sit in a volatile asset, regardless of expected return.",
        "The reason is not statistical but behavioural: a forced sale during a drawdown converts a temporary decline into a permanent loss.",
      ]},
    ],
  },
  {
    id: "l-10", slug: "market-cycles", title: "Market cycles",
    excerpt: "Expansion, peak, contraction and trough — and why positioning for a cycle is harder than describing one.",
    level: "Advanced", format: "Article", topic: "Advanced Investing", minutes: 11, accent: "#5b54ec",
    body: [
      { heading: "The four phases", paragraphs: [
        "Markets move through recognisable phases: expansion, peak, contraction and trough. Different sectors tend to lead at different points.",
        "Cyclical sectors such as metals and industrials typically show the largest swings, while consumer staples and utilities are comparatively defensive.",
      ]},
      { heading: "Why timing is hard", paragraphs: [
        "Phases are only clearly identifiable in retrospect. The signals that appear obvious on a historical chart are ambiguous while they are forming.",
        "This is why most disciplined frameworks favour a policy allocation with modest tactical tilts, rather than large all-or-nothing positioning calls.",
      ]},
    ],
  },
  {
    id: "l-11", slug: "risk-management", title: "Risk management frameworks",
    excerpt: "Position sizing, correlation awareness and predefined exits — the operational side of investing.",
    level: "Advanced", format: "Guide", topic: "Advanced Investing", minutes: 10, accent: "#d9a441",
    body: [
      { heading: "Position sizing first", paragraphs: [
        "How much is allocated to a position matters more to portfolio outcomes than whether that particular view proves correct.",
        "A framework that caps single-position exposure means no individual mistake can materially impair the portfolio.",
      ]},
      { heading: "Correlation, not just count", paragraphs: [
        "Twelve positions that all depend on the same macro variable behave as one position when that variable moves. Risk should be measured at the factor level, not the holding level.",
      ]},
      { heading: "Decide the exit in advance", paragraphs: [
        "Defining the conditions under which a position will be reduced or closed — before entering it — removes the hardest judgement from the most emotionally charged moment.",
      ]},
    ],
  },
  {
    id: "l-12", slug: "investment-strategies", title: "Common investment strategies",
    excerpt: "Value, growth, quality and momentum — what each approach is actually betting on.",
    level: "Advanced", format: "Article", topic: "Advanced Investing", minutes: 9, accent: "#4a3fdc",
    body: [
      { heading: "Four families", paragraphs: [
        "Value buys assets priced below an estimate of intrinsic worth. Growth pays for expected future expansion. Quality favours durable returns on capital. Momentum follows established price trends.",
        "Each has produced long-run excess returns in academic literature, and each has endured multi-year periods of underperformance.",
      ]},
      { heading: "The real constraint", paragraphs: [
        "The binding constraint is rarely the strategy — it is whether the investor can hold it through the period when it does not work.",
        "A strategy that is a poor fit for the holder's temperament will be abandoned at the worst possible moment, which is why self-knowledge is a legitimate input to strategy selection.",
      ]},
    ],
  },
  {
    id: "l-13", slug: "building-an-emergency-fund", title: "Building an emergency fund",
    excerpt: "The unglamorous foundation that keeps every other financial decision intact.",
    level: "Beginner", format: "Guide", topic: "Personal Finance", minutes: 5, accent: "#0fa968",
    body: [
      { heading: "How much", paragraphs: [
        "Three to six months of essential expenses is the common benchmark. Households with variable income or single-earner dependence should sit at the higher end.",
        "Count only essentials — housing, food, utilities, insurance premiums and loan obligations — not discretionary spending.",
      ]},
      { heading: "Where to keep it", paragraphs: [
        "The requirement is availability, not return. A savings account or a liquid fund fits; a volatile asset does not, because emergencies do not wait for a recovery.",
      ]},
    ],
  },
  {
    id: "l-14", slug: "taxes-on-investments", title: "How investment income is taxed",
    excerpt: "Holding period changes the tax treatment more than the amount does.",
    level: "Intermediate", format: "Video", topic: "Personal Finance", minutes: 8, accent: "#e14b4b",
    body: [
      { heading: "Holding period drives everything", paragraphs: [
        "Capital gains are classified as short-term or long-term based on how long the asset was held, and each class is taxed differently.",
        "The thresholds differ by asset class, so the same holding period can produce different treatment for equity and debt instruments.",
      ]},
      { heading: "Plan, do not react", paragraphs: [
        "Tax treatment is worth understanding before a sale rather than after. Tax rules change, so confirm current provisions with a qualified professional before acting.",
        "This material is educational and is not tax or investment advice.",
      ]},
    ],
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "p-01", title: "Start investing from zero", level: "Beginner",
    description: "Five short lessons covering what shares are, how the market operates, and how pooled investing works.",
    itemSlugs: ["what-are-stocks", "how-the-stock-market-works", "what-is-a-mutual-fund", "understanding-sip", "building-an-emergency-fund"],
  },
  {
    id: "p-02", title: "Analyse a company", level: "Intermediate",
    description: "Move from headlines to statements — read a balance sheet and value a business on its fundamentals.",
    itemSlugs: ["reading-a-balance-sheet", "fundamental-analysis", "technical-analysis", "understanding-risk-and-return"],
  },
  {
    id: "p-03", title: "Build a resilient portfolio", level: "Advanced",
    description: "Allocation, cycles and risk frameworks for investors managing a multi-asset portfolio.",
    itemSlugs: ["portfolio-diversification", "market-cycles", "risk-management", "investment-strategies"],
  },
];

export const LEARN_TOPICS = [
  "Stock Market Basics",
  "Mutual Funds",
  "Personal Finance",
  "Advanced Investing",
] as const;
