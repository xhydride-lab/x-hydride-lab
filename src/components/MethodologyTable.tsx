import { cn } from "@/lib/utils/cn";
import { X_SCORE_CATEGORIES, X_SCORE_WEIGHTS } from "@/lib/scoring/xScore";

interface MethodologyTableProps {
  /** Optional subscores to render alongside weights (0–100 scale). */
  subscores?: Partial<Record<keyof typeof X_SCORE_WEIGHTS, number>>;
  className?: string;
}

/**
 * MethodologyTable — institutional scoring rubric. Renders weight,
 * description, and (optionally) the current value for each subscore in
 * a flat ledger-style table. Used as the primary view of the X-Score
 * Lab page.
 */
export function MethodologyTable({
  subscores,
  className,
}: MethodologyTableProps) {
  return (
    <div className={cn("panel overflow-hidden", className)}>
      <div className="hairline-b grid grid-cols-12 px-5 py-2.5 text-eyebrow">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Subscore</span>
        <span className="col-span-1 text-right">Weight</span>
        <span className="col-span-4">Description</span>
        <span className="col-span-1 text-right">Value</span>
      </div>
      <ol>
        {X_SCORE_CATEGORIES.map((cat, i) => {
          const weight = X_SCORE_WEIGHTS[cat.key];
          const value = subscores?.[cat.key];
          return (
            <li
              key={cat.key}
              className="ledger-row grid grid-cols-12 items-baseline gap-2 px-5 py-3"
            >
              <span
                className="col-span-1 font-mono text-mono-tab text-eyebrow text-graphite-500"
                data-numeric=""
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-5 text-body text-graphite-100">
                {cat.label}
              </span>
              <span
                className="col-span-1 text-right font-mono text-mono-tab text-body text-graphite-200"
                data-numeric=""
              >
                {Math.round(weight * 100)}%
              </span>
              <span className="col-span-4 text-caption text-graphite-400">
                {cat.description}
              </span>
              <span
                className="col-span-1 text-right font-mono text-mono-tab text-body text-graphite-50"
                data-numeric=""
              >
                {value !== undefined ? value : "—"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
