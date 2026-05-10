import { cn } from "@/lib/utils/cn";

export interface WorkflowStep {
  label: string;
  description?: string;
}

interface WorkflowStripProps {
  steps: WorkflowStep[];
  /** Index of the step that is currently active. -1 = none active. */
  activeIndex?: number;
  className?: string;
}

/**
 * WorkflowStrip — a numbered horizontal sequence used at the top of the
 * Overview and Landing pages to show pipeline state. Replaces the larger
 * decorative `PipelineStepper` for headline contexts.
 */
export function WorkflowStrip({
  steps,
  activeIndex = -1,
  className,
}: WorkflowStripProps) {
  return (
    <ol
      className={cn(
        "panel-flat grid grid-cols-2 divide-x divide-graphite-800 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {steps.map((step, i) => {
        const completed = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li
            key={step.label}
            className={cn(
              "flex flex-col gap-1.5 px-4 py-3",
              active && "bg-graphite-900",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-sharp font-mono text-mono-tab text-[10px]",
                  active &&
                    "bg-accent-500 text-white",
                  completed && "bg-graphite-700 text-graphite-100",
                  !active && !completed &&
                    "bg-graphite-900 text-graphite-500 ring-1 ring-graphite-800",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-caption font-medium",
                  active ? "text-graphite-50" : "text-graphite-200",
                )}
              >
                {step.label}
              </span>
            </div>
            {step.description ? (
              <p className="ml-7 text-caption text-graphite-500">
                {step.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
