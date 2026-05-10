import { cn } from "@/lib/utils/cn";

interface XScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function tone(score: number): { ring: string; text: string; label: string } {
  if (score >= 80)
    return {
      ring: "border-accent-700 bg-accent-900/40",
      text: "text-accent-100",
      label: "Strong",
    };
  if (score >= 65)
    return {
      ring: "border-accent-800 bg-accent-900/25",
      text: "text-accent-200",
      label: "Promising",
    };
  if (score >= 50)
    return {
      ring: "border-graphite-700 bg-graphite-900",
      text: "text-graphite-100",
      label: "Moderate",
    };
  return {
    ring: "border-amber-700/40 bg-amber-900/30",
    text: "text-amber-200",
    label: "Speculative",
  };
}

const SIZE_STYLES = {
  sm: "h-6 px-2 text-eyebrow",
  md: "h-7 px-2.5 text-caption",
  lg: "h-9 px-3 text-body",
};

/**
 * XScoreBadge — flat institutional pill that reads as a scientific
 * indicator, not a marketing badge.
 */
export function XScoreBadge({
  score,
  size = "md",
  className,
}: XScoreBadgeProps) {
  const t = tone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sharp border font-mono text-mono-tab",
        t.ring,
        SIZE_STYLES[size],
        className,
      )}
      data-numeric=""
    >
      <span className="text-graphite-400">X-Score</span>
      <span className={cn("font-semibold", t.text)}>{Math.round(score)}</span>
      <span className="text-graphite-600">·</span>
      <span className="text-eyebrow text-graphite-400">{t.label}</span>
    </span>
  );
}
