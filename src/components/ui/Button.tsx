import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-pill transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_6px_20px_-6px_rgba(74,63,220,0.65)] hover:bg-brand-700 hover:shadow-[0_10px_28px_-8px_rgba(74,63,220,0.8)]",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-50 shadow-soft",
  ghost: "text-ink-700 hover:text-ink-900 hover:bg-ink-50",
  onDark: "bg-white text-ink-900 hover:bg-ink-100 shadow-lift",
  onDarkGhost: "text-white border border-white/25 hover:bg-white/10 hover:border-white/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AnchorProps = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">;

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorProps } = rest as AnchorProps;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { href: _ignored, ...buttonProps } = rest as ButtonProps;
  void _ignored;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
