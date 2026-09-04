import type { PricePoint } from "@/types";
import { cn } from "@/utils/cn";
import { trendColor } from "@/utils/format";

interface SparklineProps {
  data: PricePoint[];
  trend?: number;
  width?: number;
  height?: number;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
  /** Unique per instance — SVG gradient ids must not collide on a page. */
  id: string;
}

/**
 * Dependency-free inline sparkline. Rendered on the server, so list views with
 * dozens of charts stay cheap; Recharts is reserved for full-size charts.
 */
export function Sparkline({
  data,
  trend = 0,
  width = 120,
  height = 40,
  className,
  filled = true,
  strokeWidth = 1.75,
  id,
}: SparklineProps) {
  if (data.length < 2) return <div className={className} style={{ width, height }} />;

  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = strokeWidth;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  const color = trendColor(trend);
  const gradientId = `spark-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label={`Price trend, ${trend >= 0 ? "up" : "down"} over the period`}
      preserveAspectRatio="none"
    >
      {filled && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
