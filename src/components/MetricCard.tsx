import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  hint?: string;
}

/**
 * @deprecated Prefer `MetricStrip` for headline metrics. Kept for
 * backward compatibility with one-off panels.
 */
export function MetricCard({ label, value, delta, hint }: MetricCardProps) {
  return (
    <div className="panel flex flex-col gap-1.5 px-5 py-4">
      <p className="text-eyebrow">{label}</p>
      <p
        className={cn("font-mono text-mono-tab text-2xl text-graphite-50")}
        data-numeric=""
      >
        {value}
      </p>
      <div className="mt-1 flex items-center justify-between text-eyebrow text-graphite-500">
        <span>{hint}</span>
        {delta ? (
          <span className="rounded-sharp border border-graphite-800 bg-graphite-900 px-2 py-0.5 text-eyebrow text-graphite-300">
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
