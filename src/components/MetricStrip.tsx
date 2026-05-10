import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MetricItem {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Optional unit shown adjacent to the value, e.g. "K", "GPa". */
  unit?: string;
}

/**
 * MetricStrip — a single horizontal row of headline metrics. Replaces the
 * previous card-grid pattern. Values are rendered in tabular-monospace so
 * digits align across rows.
 */
export function MetricStrip({
  metrics,
  className,
}: {
  metrics: MetricItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel grid grid-cols-2 divide-x divide-graphite-800 sm:grid-cols-4",
        className,
      )}
    >
      {metrics.map((m, i) => (
        <div key={`${m.label}-${i}`} className="flex flex-col gap-2 px-6 py-5">
          <p className="text-eyebrow">{m.label}</p>
          <div className="flex items-baseline gap-1.5">
            <p
              className="font-mono text-mono-tab text-[28px] font-semibold tracking-tight text-graphite-50"
              data-numeric=""
            >
              {m.value}
            </p>
            {m.unit ? (
              <span className="font-mono text-caption text-graphite-400">
                {m.unit}
              </span>
            ) : null}
          </div>
          {m.hint ? (
            <p className="text-caption text-graphite-500">{m.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
