import type { CandidateStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<CandidateStatus, string> = {
  Generated: "border-graphite-700 bg-graphite-900 text-graphite-200",
  "Awaiting DFT": "border-accent-700 bg-accent-900/30 text-accent-200",
  "Awaiting DFPT": "border-accent-700 bg-accent-900/30 text-accent-200",
  "Awaiting EPW": "border-accent-700 bg-accent-900/30 text-accent-200",
  "Awaiting Eliashberg": "border-accent-700 bg-accent-900/30 text-accent-200",
  "Awaiting RPA": "border-accent-700 bg-accent-900/30 text-accent-200",
  "Experimental validation required":
    "border-amber-700/40 bg-amber-900/30 text-amber-200",
};

/**
 * StatusBadge — flat institutional badge. No icons, no rounding flourish.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: CandidateStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sharp border px-2 py-0.5 text-eyebrow",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          status === "Generated"
            ? "bg-graphite-400"
            : status === "Experimental validation required"
              ? "bg-amber-300"
              : "bg-accent-300",
        )}
      />
      {status}
    </span>
  );
}
