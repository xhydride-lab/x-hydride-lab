import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — flat, typographic. No decorative icon block.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "panel flex flex-col items-start gap-2 px-6 py-10",
        className,
      )}
    >
      <p className="text-eyebrow">No record</p>
      <h3 className="text-section font-medium tracking-tightish text-graphite-100">
        {title}
      </h3>
      {description ? (
        <p className="max-w-prose text-caption text-graphite-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
