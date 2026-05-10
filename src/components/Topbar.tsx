"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LogomarkLockup } from "@/components/Logomark";

interface TopbarProps {
  demoMode?: boolean;
  className?: string;
}

export function Topbar({ demoMode = true, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-graphite-800 bg-graphite-950/95 px-6 backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-sharp"
          aria-label="X-Hydride Lab home"
        >
          <LogomarkLockup hideTextOnMobile />
        </Link>
        <span className="hidden h-4 w-px bg-graphite-800 sm:block" />
        <span className="hidden text-eyebrow sm:inline">
          Research Console
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="hidden font-mono text-eyebrow text-graphite-500 sm:inline"
          data-numeric=""
        >
          v0.1.0
        </span>
        <span className="hidden h-4 w-px bg-graphite-800 sm:block" />
        <ProviderPill demoMode={demoMode} />
      </div>
    </header>
  );
}

export function ProviderPill({ demoMode }: { demoMode: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sharp border px-2 py-0.5 text-eyebrow",
        demoMode
          ? "border-graphite-700 bg-graphite-900 text-graphite-300"
          : "border-accent-700 bg-accent-900/40 text-accent-200",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          demoMode ? "bg-graphite-400" : "bg-accent-300",
        )}
      />
      <span>{demoMode ? "Demo Mode" : "xAI Grok · live"}</span>
    </div>
  );
}

