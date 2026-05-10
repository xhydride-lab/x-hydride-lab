import { cn } from "@/lib/utils/cn";

interface ScientificDisclaimerProps {
  variant?: "default" | "compact" | "banner";
  className?: string;
  text?: string;
}

const DEFAULT_TEXT =
  "AI-generated research candidates are exploratory hypotheses and require DFT, DFPT, EPW, Eliashberg, RPA, and experimental validation before scientific claims can be made.";

/**
 * ScientificDisclaimer — institutional warning surface. No icons,
 * minimal color, just structural emphasis.
 */
export function ScientificDisclaimer({
  variant = "default",
  className,
  text = DEFAULT_TEXT,
}: ScientificDisclaimerProps) {
  if (variant === "compact") {
    return (
      <p className={cn("text-eyebrow text-graphite-500", className)}>
        <span className="text-graphite-300">Scientific notice ·</span>{" "}
        <span className="normal-case tracking-normal text-caption text-graphite-400">
          {text}
        </span>
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "border border-amber-700/40 bg-amber-900/15 px-4 py-3",
          className,
        )}
      >
        <p className="text-eyebrow text-amber-200">Validation required</p>
        <p className="mt-1 text-caption leading-relaxed text-amber-100/85">
          {text}
        </p>
      </div>
    );
  }

  return (
    <aside
      role="note"
      className={cn("panel-flat px-5 py-4", className)}
    >
      <p className="text-eyebrow text-graphite-300">Scientific disclaimer</p>
      <p className="mt-2 max-w-3xl text-body leading-relaxed text-graphite-200">
        {text}
      </p>
    </aside>
  );
}
