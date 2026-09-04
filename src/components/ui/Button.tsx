import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "sm" | "md" | "lg";

const BASE =
  "group/btn inline-flex items-center justify-center gap-2.5 font-medium rounded-pill transition-[background-color,color,border-color,transform] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink-900 text-paper-50 hover:bg-brand-600",
  secondary: "border border-ink-300 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-paper-50",
  ghost: "text-ink-600 hover:text-ink-900",
  onDark: "bg-paper-50 text-void-950 hover:bg-brand-400 hover:text-void-950",
  onDarkGhost: "border border-paper-200/25 text-paper-100 hover:border-paper-100 hover:bg-paper-50 hover:text-void-950",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-[0.9375rem]",
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

/**
 * Inline editorial link: a mono label over a rule that wipes in on hover.
 * Used instead of secondary buttons throughout the content sections.
 */
export function ArrowLink({
  href,
  children,
  onVoid = false,
  className,
}: {
  href: string;
  children: ReactNode;
  onVoid?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link relative inline-flex items-center gap-2 pb-1.5 text-sm font-medium transition-colors",
        onVoid ? "text-paper-100 hover:text-brand-300" : "text-ink-900 hover:text-brand-600",
        className,
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-1"
      >
        →
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px",
          onVoid ? "bg-paper-200/30" : "bg-ink-200",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-100",
          onVoid ? "bg-brand-300" : "bg-brand-600",
        )}
      />
    </Link>
  );
}
