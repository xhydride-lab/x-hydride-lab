import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: ReactNode;
  demoMode?: boolean;
  className?: string;
}

/**
 * AppShell — fixed-width institutional console layout. Renders a
 * minimal Topbar (session metadata + provider pill), a structural
 * Sidebar, and a generously spaced main content column.
 */
export function AppShell({
  children,
  demoMode = true,
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100">
      <Topbar demoMode={demoMode} />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            "min-h-[calc(100vh-3.5rem)] flex-1 px-6 pb-24 pt-10 sm:px-10 lg:px-12",
            className,
          )}
        >
          <div className="mx-auto w-full max-w-[88rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}

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
  /** Optional small key/value strip rendered under the description. */
  meta?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-graphite-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-3xl flex-col gap-2">
        {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
        <h1 className="text-display font-semibold text-graphite-50">
          {title}
        </h1>
        {description ? (
          <p className="text-body text-graphite-400">{description}</p>
        ) : null}
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
