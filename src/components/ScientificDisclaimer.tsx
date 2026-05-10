import { cn } from "@/lib/utils/cn";

interface ScientificDisclaimerProps {
  variant?: "default" | "compact" | "banner";
  className?: string;
  text?: string;
}

const DEFAULT_TEXT =
  "AI-generated research candidates are exploratory hypotheses and require DFT, DFPT, EPW, Eliashberg, RPA, and experimental validation before scientific claims can be made.";

/**
 * ScientificDisclaimer — restrained warning surface used across the
 * platform. No icons, minimal color, generous typographic emphasis.
 */
export function ScientificDisclaimer({
  variant = "default",
  className,
  text = DEFAULT_TEXT,
}: ScientificDisclaimerProps) {
  if (variant === "compact") {
    return (
      <p className={cn("text-[12px] text-graphite-500", className)}>
        <span className="text-graphite-300">Scientific notice ·</span>{" "}
        <span className="text-[12.5px] text-graphite-400">{text}</span>
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "rounded-2xl border border-amber-700/30 bg-amber-900/10 px-5 py-4",
          className,
        )}
      >
        <p className="text-eyebrow text-amber-200">Validation required</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-amber-100/85">
          {text}
        </p>
      </div>
    );
  }

  return (
    <aside
      role="note"
      className={cn(
        "panel-flat px-7 py-6",
        className,
      )}
    >
      <p className="text-eyebrow text-graphite-300">Scientific disclaimer</p>
      <p className="mt-2.5 max-w-3xl text-subtitle leading-relaxed text-graphite-200">
        {text}
      </p>
    </aside>
  );
}
