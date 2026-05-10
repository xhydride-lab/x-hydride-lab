import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ResearchPanelProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Numbered section index used in dossier layouts. */
  index?: number;
}

/**
 * ResearchPanel — flat institutional surface. Squared corners, hairline
 * borders, no decorative shadow. Use ResearchPanel for content blocks
 * that act as a discrete research record (a candidate's risk panel,
 * an X-Score breakdown, a methodology table). For non-record content
 * blocks, use plain HTML with hairline dividers instead.
 */
export function ResearchPanel({
  title,
  eyebrow,
  description,
  actions,
  children,
  className,
  bodyClassName,
  index,
}: ResearchPanelProps) {
  const showHeader = Boolean(title || eyebrow || actions || description);

  return (
    <section className={cn("panel overflow-hidden", className)}>
      {showHeader ? (
        <header className="hairline-b flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-baseline gap-3">
            {typeof index === "number" ? (
              <span
                className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                data-numeric=""
              >
                {String(index).padStart(2, "0")}
              </span>
            ) : null}
            <div>
              {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h2 className="text-section font-medium text-graphite-50">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 max-w-2xl text-caption text-graphite-400">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PanelField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="border border-graphite-800 bg-graphite-900/40 px-3 py-2">
      <p className="text-eyebrow">{label}</p>
      <div
        className={cn(
          "mt-1 text-body leading-relaxed text-graphite-100",
          mono && "font-mono text-mono-tab text-caption",
        )}
        data-numeric={mono ? "" : undefined}
      >
        {value}
      </div>
    </div>
  );
}
