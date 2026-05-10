import Link from "next/link";
import type { Candidate } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { XScoreBadge } from "@/components/XScoreBadge";
import { cn } from "@/lib/utils/cn";

interface CandidateCardProps {
  candidate: Candidate;
  href?: string;
  className?: string;
}

/**
 * CandidateCard — research record card. Used only for the small grid of
 * recently generated candidates in the Generator's result panel; the
 * primary listing surface elsewhere is `CandidateTable`.
 *
 * Visually flat: hairline border, square corners, no shadow, no
 * decorative elements.
 */
export function CandidateCard({
  candidate,
  href,
  className,
}: CandidateCardProps) {
  const target =
    href ?? `/candidates/${encodeURIComponent(candidate.candidate_id)}`;
  return (
    <Link
      href={target}
      className={cn(
        "focus-ring panel block transition-colors hover:border-graphite-700",
        className,
      )}
    >
      <div className="hairline-b flex items-baseline justify-between gap-3 px-5 py-3">
        <p className="text-eyebrow">{candidate.chemical_family}</p>
        <XScoreBadge score={candidate.x_score} size="sm" />
      </div>

      <div className="px-5 pt-3">
        <h3 className="text-body font-medium tracking-tightish text-graphite-50">
          {candidate.name}
        </h3>
        <p className="mt-1 font-mono text-eyebrow text-graphite-400">
          {candidate.proposed_composition}
        </p>
      </div>

      <p className="mt-3 px-5 line-clamp-3 text-caption leading-relaxed text-graphite-300">
        {candidate.structural_hypothesis}
      </p>

      <dl className="mt-3 grid grid-cols-2 divide-x divide-graphite-800 border-t border-graphite-800">
        <div className="px-5 py-2">
          <dt className="text-eyebrow">Pressure</dt>
          <dd
            className="mt-0.5 font-mono text-mono-tab text-caption text-graphite-100"
            data-numeric=""
          >
            {candidate.target_pressure_range}
          </dd>
        </div>
        <div className="px-5 py-2">
          <dt className="text-eyebrow">Status</dt>
          <dd className="mt-0.5">
            <StatusBadge status={candidate.status} />
          </dd>
        </div>
      </dl>

      <div className="hairline-b" />
      <div className="flex items-center justify-between gap-3 px-5 py-2 text-eyebrow text-graphite-500">
        <span className="font-mono text-mono-tab" data-numeric="">
          {candidate.candidate_id}
        </span>
        <span>{formatStableTimestamp(candidate.created_at)}</span>
      </div>
    </Link>
  );
}

/**
 * Deterministic UTC formatter so server and client render identical text
 * (avoids hydration mismatch).
 */
function formatStableTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const month = d.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hour = String(d.getUTCHours()).padStart(2, "0");
  const minute = String(d.getUTCMinutes()).padStart(2, "0");
  return `${month} ${day} · ${hour}:${minute} UTC`;
}
