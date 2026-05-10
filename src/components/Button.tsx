"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Apple-style buttons: pill-shaped CTAs, hairline secondary, soft ghost.
 * Hover and pressed states use background + transform shifts rather than
 * heavy color changes.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "border border-accent-500/40 bg-accent-500 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] hover:bg-accent-400 active:scale-[0.99]",
  secondary:
    "border border-graphite-700 bg-white/[0.04] text-graphite-100 hover:bg-white/[0.07] hover:border-graphite-600 active:scale-[0.99]",
  ghost:
    "border border-transparent bg-transparent text-graphite-300 hover:bg-white/[0.05] hover:text-graphite-50",
  danger:
    "border border-red-700/40 bg-red-900/30 text-red-100 hover:bg-red-900/50 hover:border-red-600/60",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[12.5px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-11 px-5 text-[14px]",
};

const COMMON =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60";

export const Button = forwardRef<
  HTMLButtonElement,
  BaseProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(COMMON, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {loading ? <Spinner /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight ? iconRight : null}
    </button>
  );
});

interface LinkButtonProps extends BaseProps {
  href: string;
  external?: boolean;
}

export function LinkButton({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
}: LinkButtonProps) {
  const classes = cn(COMMON, VARIANTS[variant], SIZES[size], className);

  if (external) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer">
        {iconLeft}
        <span>{children}</span>
        {iconRight}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </Link>
  );
}

function Spinner() {
  return (
    <span
      className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white"
      aria-hidden
    />
  );
}
