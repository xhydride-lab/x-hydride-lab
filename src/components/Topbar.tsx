"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LogomarkLockup } from "@/components/Logomark";
import { XLink } from "@/components/XLink";

interface TopbarProps {
  /** Reserved for future demo/live signaling. Currently not rendered. */
  demoMode?: boolean;
  className?: string;
}

/**
 * Topbar — minimal launch chrome.
 *
 * Left:  X-Hydride Lab lockup (logo + wordmark).
 * Right: lightweight contextual actions.
 *
 * The previous "Research Console" eyebrow, version chip, and provider
 * pill have been removed for a cleaner product feel.
 */
export function Topbar({ className }: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-graphite-800/80 bg-graphite-950/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-graphite-950/60",
        className,
      )}
    >
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-md"
          aria-label="X-Hydride Lab home"
        >
          <LogomarkLockup hideTextOnMobile />
        </Link>
      </div>

      <nav
        aria-label="Primary actions"
        className="flex items-center gap-1"
      >
        <span className="hidden sm:contents">
          <TopbarLink href="/overview">Overview</TopbarLink>
          <TopbarLink href="/candidates">Generate</TopbarLink>
          <TopbarLink href="/audit">Provenance</TopbarLink>
        </span>
        <XLink className="ml-1" />
      </nav>
    </header>
  );
}

function TopbarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="focus-ring rounded-full px-3 py-1.5 text-[13px] font-medium tracking-tightish text-graphite-300 transition-colors hover:bg-white/[0.04] hover:text-graphite-50"
    >
      {children}
    </Link>
  );
}

/**
 * Backwards-compat export. Older imports still pull `ProviderPill` from
 * Topbar; we keep the symbol but render nothing so removing the pill is
 * safe across pages without code changes.
 */
export function ProviderPill(_: { demoMode?: boolean }) {
  return null;
}
