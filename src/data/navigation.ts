export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavGroup {
  label: string;
  href: string;
  /** When present the item renders as a dropdown in the desktop navigation. */
  columns?: { title: string; links: NavLink[] }[];
  featured?: { title: string; description: string; href: string; cta: string };
}

export const PRIMARY_NAV: NavGroup[] = [
  {
    label: "Markets",
    href: "/markets",
    columns: [
      {
        title: "Overview",
        links: [
          { label: "Market Overview", href: "/markets", description: "Indices, sectors and sentiment", icon: "Activity" },
          { label: "Top Gainers", href: "/markets#movers", description: "Biggest advances today", icon: "TrendingUp" },
          { label: "Top Losers", href: "/markets#movers", description: "Biggest declines today", icon: "TrendingDown" },
          { label: "Most Active", href: "/markets#movers", description: "Highest traded volume", icon: "BarChart3" },
        ],
      },
      {
        title: "Indices",
        links: [
          { label: "NIFTY 50", href: "/markets#indices", description: "Benchmark large-cap index", icon: "LineChart" },
          { label: "SENSEX", href: "/markets#indices", description: "30-stock benchmark", icon: "LineChart" },
          { label: "NIFTY BANK", href: "/markets#indices", description: "Banking sector index", icon: "Landmark" },
          { label: "Global Markets", href: "/markets#indices", description: "S&P 500, NASDAQ, Nikkei", icon: "Globe" },
        ],
      },
    ],
    featured: {
      title: "Sector performance",
      description: "See which parts of the market are leading and lagging in the sample session.",
      href: "/markets#sectors",
      cta: "View sectors",
    },
  },
  {
    label: "Products",
    href: "/stocks",
    columns: [
      {
        title: "Invest",
        links: [
          { label: "Stocks", href: "/stocks", description: "Screen and compare companies", icon: "LineChart" },
          { label: "Mutual Funds", href: "/mutual-funds", description: "Equity, debt, hybrid, index", icon: "Layers" },
          { label: "IPOs", href: "/ipo", description: "Upcoming, open and listed", icon: "Rocket" },
        ],
      },
      {
        title: "Explore more",
        links: [
          { label: "ETFs", href: "/mutual-funds?category=Index", description: "Low-cost index schemes", icon: "Boxes" },
          { label: "Fixed Deposits", href: "/tools/fd", description: "Model deposit maturity", icon: "PiggyBank" },
          { label: "Gold", href: "/learn/portfolio-diversification", description: "Where gold fits in a portfolio", icon: "Gem" },
        ],
      },
    ],
    featured: {
      title: "One place for every decision",
      description: "Every product on the platform shares the same data model and the same clear presentation.",
      href: "/stocks",
      cta: "Browse stocks",
    },
  },
  {
    label: "Learn",
    href: "/learn",
    columns: [
      {
        title: "By level",
        links: [
          { label: "Beginner", href: "/learn?level=Beginner", description: "Start from first principles", icon: "Sprout" },
          { label: "Intermediate", href: "/learn?level=Intermediate", description: "Analysis and portfolios", icon: "BookOpen" },
          { label: "Advanced", href: "/learn?level=Advanced", description: "Cycles, risk, strategy", icon: "GraduationCap" },
        ],
      },
      {
        title: "Popular lessons",
        links: [
          { label: "What are stocks?", href: "/learn/what-are-stocks", icon: "FileText" },
          { label: "What is a mutual fund?", href: "/learn/what-is-a-mutual-fund", icon: "FileText" },
          { label: "Fundamental analysis", href: "/learn/fundamental-analysis", icon: "FileText" },
          { label: "Risk and return", href: "/learn/understanding-risk-and-return", icon: "FileText" },
        ],
      },
    ],
    featured: {
      title: "Learning paths",
      description: "Structured sequences that take you from the basics to portfolio construction.",
      href: "/learn#paths",
      cta: "See paths",
    },
  },
  {
    label: "Tools",
    href: "/tools",
    columns: [
      {
        title: "Calculators",
        links: [
          { label: "SIP Calculator", href: "/tools/sip", description: "Project a monthly plan", icon: "TrendingUp" },
          { label: "EMI Calculator", href: "/tools/emi", description: "Loan repayment breakdown", icon: "Landmark" },
          { label: "FD Calculator", href: "/tools/fd", description: "Deposit maturity value", icon: "PiggyBank" },
        ],
      },
      {
        title: "Planning",
        links: [
          { label: "Compound Interest", href: "/tools/compound-interest", description: "Growth of a lump sum", icon: "Sigma" },
          { label: "Retirement", href: "/tools/retirement", description: "Size the corpus you need", icon: "Sunrise" },
          { label: "All tools", href: "/tools", description: "The full directory", icon: "Wrench" },
        ],
      },
    ],
  },
  {
    label: "Explore",
    href: "/news",
    columns: [
      {
        title: "News",
        links: [
          { label: "Market News", href: "/news", description: "Latest across the market", icon: "Newspaper" },
          { label: "Economy", href: "/news?category=Economy", description: "Macro and policy", icon: "Building2" },
          { label: "Personal Finance", href: "/news?category=Personal+Finance", description: "Money, explained", icon: "Wallet" },
        ],
      },
      {
        title: "Discover",
        links: [
          { label: "Trending Stocks", href: "/stocks?category=trending", description: "What is moving", icon: "Flame" },
          { label: "Popular Stocks", href: "/stocks?category=popular", description: "Widely followed names", icon: "Star" },
          { label: "IPO Centre", href: "/ipo", description: "The primary market", icon: "Rocket" },
        ],
      },
    ],
  },
];

export const FOOTER_NAV = [
  {
    title: "Markets",
    links: [
      { label: "Market Overview", href: "/markets" },
      { label: "Indices", href: "/markets#indices" },
      { label: "Sector Performance", href: "/markets#sectors" },
      { label: "Market Movers", href: "/markets#movers" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Stocks", href: "/stocks" },
      { label: "Mutual Funds", href: "/mutual-funds" },
      { label: "IPOs", href: "/ipo" },
      { label: "ETFs", href: "/mutual-funds?category=Index" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "SIP Calculator", href: "/tools/sip" },
      { label: "EMI Calculator", href: "/tools/emi" },
      { label: "FD Calculator", href: "/tools/fd" },
      { label: "Retirement Calculator", href: "/tools/retirement" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Learning Hub", href: "/learn" },
      { label: "Beginner Guides", href: "/learn?level=Beginner" },
      { label: "Learning Paths", href: "/learn#paths" },
      { label: "Market News", href: "/news" },
    ],
  },
];
