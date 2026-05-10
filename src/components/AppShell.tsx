import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: ReactNode;
  /** No longer rendered in chrome; kept for backward-compatible call sites. */
  demoMode?: boolean;
  className?: string;
}

/**
 * AppShell — generously spaced launch chrome. The Topbar is minimal,
 * the Sidebar is icon-led, and the main column gets ample breathing
 * room reminiscent of an Apple Pro application.
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            "min-h-[calc(100vh-4rem)] flex-1 px-6 pb-28 pt-12 sm:px-10 lg:px-14",
            className,
          )}
        >
          <div className="mx-auto w-full max-w-[88rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/**
 * PageHeader — large, Apple-style page title with optional eyebrow,
 * description, action row, and meta strip. Uses display type at the
 * top of every page so the section hierarchy reads instantly.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-col gap-6 border-b border-graphite-800/80 pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-3xl flex-col gap-3">
        {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
        <h1 className="text-display font-semibold text-graphite-50">
          {title}
        </h1>
        {description ? (
          <p className="text-subtitle text-graphite-400">{description}</p>
        ) : null}
        {meta ? <div className="mt-1">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
