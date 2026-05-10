import type { CandidateStatus } from "@/types";
import { CANDIDATE_STATUS_OPTIONS } from "@/types";
import { cn } from "@/lib/utils/cn";

interface ValidationTimelineProps {
  current: CandidateStatus;
  className?: string;
}

/**
 * ValidationTimeline — vertical step ledger for a candidate's progression
 * through computational and experimental validation gates. Visually
 * resembles the validation track of a research dossier rather than a
 * generic stepper.
 */
export function ValidationTimeline({
  current,
  className,
}: ValidationTimelineProps) {
  const reachedIndex = CANDIDATE_STATUS_OPTIONS.indexOf(current);

  return (
    <ol
      className={cn(
        "panel divide-y divide-graphite-800",
        className,
      )}
    >
      {CANDIDATE_STATUS_OPTIONS.map((step, i) => {
        const reached = i <= reachedIndex;
        const active = i === reachedIndex;
        return (
          <li
            key={step}
            className={cn(
              "flex items-center gap-4 px-5 py-3",
              active && "bg-graphite-900",
            )}
          >
            <span
              className={cn(
                "font-mono text-mono-tab text-[11px]",
                reached ? "text-accent-300" : "text-graphite-500",
              )}
              data-numeric=""
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden
              className={cn(
                "h-3 w-px",
                reached ? "bg-accent-500" : "bg-graphite-700",
              )}
            />
            <span
              className={cn(
                "text-body",
                active
                  ? "font-medium text-graphite-50"
                  : reached
                    ? "text-graphite-200"
                    : "text-graphite-500",
              )}
            >
              {step}
            </span>
            {active ? (
              <span className="ml-auto rounded-sharp border border-accent-700/60 bg-accent-900/40 px-2 py-0.5 text-eyebrow text-accent-200">
                current
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
