import { cn } from "@/lib/utils/cn";

/**
 * FrameworkDiagram — schematic of the X-Hydride discovery pipeline
 * rendered as inline SVG. The diagram is intentionally pared down: no
 * gradients, no animation, no flourish. Boxes are flat, lines are
 * hairlines, labels are typeset like a textbook figure.
 */
export function FrameworkDiagram({ className }: { className?: string }) {
  // Pipeline boxes: each row is a horizontal step.
  const steps = [
    { id: "input", label: "Input Hypothesis", note: "Research objective" },
    { id: "gen", label: "Grok Candidate Generation", note: "Strict JSON schema" },
    { id: "score", label: "X-Score Evaluation", note: "8 weighted axes" },
    { id: "sim", label: "Simulation Template", note: "QE / DFPT / EPW" },
    { id: "report", label: "Research Note", note: "Cautious draft" },
    { id: "audit", label: "Provenance Hash", note: "SHA-256 ledger" },
  ] as const;

  // Vertical decision branches (inputs / validations) shown above the spine.
  const inputs = [
    "Composition family",
    "Target pressure",
    "Tc range",
    "Stability preference",
  ];
  // Validation gates fed back into the spine.
  const gates = [
    "DFT relaxation",
    "DFPT phonon",
    "EPW Eliashberg",
    "Experimental",
  ];

  return (
    <figure
      className={cn(
        "panel-flat overflow-hidden bg-graphite-925 px-6 py-8",
        className,
      )}
      aria-label="X-Hydride discovery framework diagram"
    >
      <figcaption className="mb-4 flex items-baseline gap-3">
        <span className="text-eyebrow">Figure 01</span>
        <span className="text-caption text-graphite-300">
          Discovery pipeline · inputs (top) feed candidate generation; validation gates (bottom) gate progression.
        </span>
      </figcaption>

      <div className="grid gap-3">
        {/* Inputs row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {inputs.map((it, i) => (
            <div
              key={it}
              className="flex items-center gap-2 border border-graphite-800 bg-graphite-900/60 px-3 py-2"
            >
              <span
                className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                data-numeric=""
              >
                I{String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-caption text-graphite-200">{it}</span>
            </div>
          ))}
        </div>

        {/* Connector */}
        <div className="flex justify-center">
          <span aria-hidden className="h-3 w-px bg-graphite-700" />
        </div>

        {/* Spine — pipeline boxes */}
        <ol className="grid grid-cols-1 gap-px overflow-hidden border border-graphite-800 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="bg-graphite-900 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-mono-tab text-eyebrow text-accent-300"
                  data-numeric=""
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-caption font-medium text-graphite-50">
                  {step.label}
                </span>
              </div>
              <p className="mt-1 text-caption text-graphite-500">{step.note}</p>
            </li>
          ))}
        </ol>

        {/* Connector */}
        <div className="flex justify-center">
          <span aria-hidden className="h-3 w-px bg-graphite-700" />
        </div>

        {/* Validation gates row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {gates.map((it, i) => (
            <div
              key={it}
              className="flex items-center gap-2 border border-graphite-800 px-3 py-2"
            >
              <span
                className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                data-numeric=""
              >
                G{String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-caption text-graphite-200">{it}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
