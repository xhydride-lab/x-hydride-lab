import { cn } from "@/lib/utils/cn";

interface LoadingStateProps {
  label?: string;
  detail?: string;
  className?: string;
}

/**
 * LoadingState — institutional "computation in progress" indicator.
 * No spinner-as-decoration; just a tabular progress mark plus label.
 */
export function LoadingState({
  label = "Running scientific computation",
  detail = "Preparing structured candidate output…",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn("panel flex items-center gap-4 px-5 py-3", className)}
      role="status"
      aria-live="polite"
    >
      <ComputationIndicator />
      <div className="min-w-0">
        <p className="text-eyebrow">{label}</p>
        <p className="mt-1 truncate text-caption text-graphite-200">{detail}</p>
      </div>
    </div>
  );
}

function ComputationIndicator() {
  return (
    <span
      aria-hidden
      className="relative grid h-7 w-7 place-items-center border border-graphite-800 bg-graphite-900"
    >
      <span className="absolute inset-1 border border-graphite-700/60" />
      <span className="relative h-1.5 w-1.5 animate-pulse bg-accent-300" />
    </span>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3 w-3 animate-spin rounded-full border border-graphite-700 border-t-accent-300 align-[-2px]",
        className,
      )}
    />
  );
}
