import {
  Activity, BarChart3, BookOpen, Boxes, Building2, Calculator, FileText, Flame, Gem, Globe,
  GraduationCap, Landmark, Layers, LineChart, Newspaper, PiggyBank, Radar, Rocket, Sigma,
  Sparkles, Sprout, Star, Sunrise, TrendingDown, TrendingUp, Wallet, Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit registry so data files can reference icons by name without pulling
 * the whole icon set into the bundle.
 */
const REGISTRY: Record<string, LucideIcon> = {
  Activity, BarChart3, BookOpen, Boxes, Building2, Calculator, FileText, Flame, Gem, Globe,
  GraduationCap, Landmark, Layers, LineChart, Newspaper, PiggyBank, Radar, Rocket, Sigma,
  Sparkles, Sprout, Star, Sunrise, TrendingDown, TrendingUp, Wallet, Wrench,
};

export function Icon({
  name,
  className,
  fallback = Activity,
}: {
  name: string;
  className?: string;
  fallback?: LucideIcon;
}) {
  const Component = REGISTRY[name] ?? fallback;
  return <Component className={className} aria-hidden />;
}
