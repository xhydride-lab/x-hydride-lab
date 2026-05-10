import { cn } from "@/lib/utils/cn";

interface PipelineStep {
  label: string;
  description?: string;
}

const DEFAULT_STEPS: PipelineStep[] = [
  { label: "Input Hypothesis", description: "Research objective + constraints" },
  { label: "Grok Candidate Generation", description: "xAI structured JSON" },
  { label: "X-Score Evaluation", description: "Weighted subscores" },
  { label: "Simulation Template", description: "DFT / DFPT / EPW templates" },
  { label: "Research Note", description: "Cautious academic draft" },
  { label: "Audit Hash", description: "SHA-256 provenance ledger" },
];

interface PipelineStepperProps {
  activeIndex?: number;
  steps?: PipelineStep[];
  className?: string;
}

/**
 * PipelineStepper — vertical-on-mobile / horizontal-on-desktop pipeline
 * indicator. Flat surfaces, hairline dividers, no rounded card pattern.
 */
export function PipelineStepper({
  activeIndex = -1,
  steps = DEFAULT_STEPS,
  className,
}: PipelineStepperProps) {
  return (
    <ol
      className={cn(
        "panel grid grid-cols-1 divide-y divide-graphite-800 lg:grid-cols-6 lg:divide-x lg:divide-y-0",
        className,
      )}
    >
      {steps.map((step, index) => {
        const completed = activeIndex > index;
        const active = activeIndex === index;
        return (
          <li
            key={step.label}
            className={cn(
              "flex flex-col gap-2 px-4 py-3 transition-colors",
              active && "bg-graphite-900",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-sharp font-mono text-mono-tab text-[10px]",
                  active && "bg-accent-500 text-white",
                  completed && "bg-graphite-700 text-graphite-100",
                  !active && !completed &&
                    "bg-graphite-900 text-graphite-500 ring-1 ring-graphite-800",
                )}
                data-numeric=""
              >
                {String(index + 1).padStart(2, "0")}
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
              <p className="ml-7 text-eyebrow normal-case tracking-normal text-graphite-500">
                {step.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
