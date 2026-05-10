import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  /** Numbered section markers (e.g. "01") used in dossier layouts. */
  index?: number;
}

/**
 * SectionHeader — restrained section title used inside pages. Lighter
 * than `PageHeader` (no large display type), heavier than a plain `h2`.
 * Spans the section's full width and includes an optional numeric index.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  index,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-graphite-800 pb-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
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
          <h2 className="text-section font-medium text-graphite-50">{title}</h2>
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
    </div>
  );
}
