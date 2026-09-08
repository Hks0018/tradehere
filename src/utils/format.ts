const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number, decimals = 2): string {
  return `₹${decimals === 0 ? inrWhole.format(value) : inr.format(value)}`;
}

/** Indian-notation compact currency: 1,20,00,00,000 -> ₹120 Cr */
export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7 * 1e5) return `₹${(value / 1e12).toFixed(2)} L Cr`;
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(value / 1e7 >= 100 ? 0 : 2)} Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${(value / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return `${value}`;
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSigned(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, decimals)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Relative time against a fixed reference so server and client render the same
 * string (mock data is authored relative to `DATA_REFERENCE_DATE`).
 */
export function formatRelative(iso: string, reference: string): string {
  const diffMs = new Date(reference).getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

/**
 * Renders a dash instead of a figure that almost certainly means "not
 * provided" rather than a genuine measurement — a P/E ratio, EPS, founding
 * year or 52-week high of exactly zero does not happen for a real, operating,
 * publicly traded company. Providers that lack a field return 0 for it rather
 * than fabricating a value (see `CompanyProfile` normalization); this is
 * where that absence is finally made visible instead of read as a real zero.
 */
export function formatOrDash(value: number, format: (value: number) => string): string {
  return value === 0 ? "—" : format(value);
}

/** String counterpart: an empty string from a provider means the same thing. */
export function textOrDash(value: string): string {
  return value.trim() === "" ? "—" : value;
}

export function trendClass(value: number): string {
  if (value > 0) return "text-up-600";
  if (value < 0) return "text-down-600";
  return "text-ink-500";
}

export function trendBgClass(value: number): string {
  if (value > 0) return "bg-up-50 text-up-700";
  if (value < 0) return "bg-down-50 text-down-700";
  return "bg-ink-50 text-ink-600";
}

export function trendColor(value: number): string {
  if (value > 0) return "#0fa968";
  if (value < 0) return "#e14b4b";
  return "#5a6880";
}
