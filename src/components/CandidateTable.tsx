import Link from "next/link";
import type { Candidate } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { XScoreBadge } from "@/components/XScoreBadge";

interface CandidateTableProps {
  candidates: Candidate[];
  emptyLabel?: string;
  caption?: string;
}

/**
 * CandidateTable — institutional registry view of candidates. Replaces
 * the previous decorative card grid as the primary listing surface.
 */
export function CandidateTable({
  candidates,
  emptyLabel = "No candidates yet.",
  caption,
}: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="panel px-6 py-12 text-center text-caption text-graphite-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      {caption ? (
        <div className="hairline-b px-5 py-3 text-eyebrow">{caption}</div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="hairline-b bg-graphite-900/60 text-eyebrow">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">#</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Candidate</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Family</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Pressure</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
              <th
                scope="col"
                className="px-5 py-2.5 text-right font-medium"
              >
                X-Score
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, i) => (
              <tr
                key={candidate.candidate_id}
                className="ledger-row align-middle transition-colors hover:bg-graphite-900/40"
              >
                <td
                  className="px-5 py-3 font-mono text-mono-tab text-eyebrow text-graphite-500"
                  data-numeric=""
                >
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/candidates/${encodeURIComponent(candidate.candidate_id)}`}
                    className="focus-ring inline-flex flex-col gap-0.5 rounded-sharp text-graphite-50"
                  >
                    <span className="text-body font-medium tracking-tightish">
                      {candidate.name}
                    </span>
                    <span className="font-mono text-eyebrow text-graphite-400">
                      {candidate.proposed_composition}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-caption text-graphite-300">
                  {candidate.chemical_family}
                </td>
                <td
                  className="px-5 py-3 font-mono text-mono-tab text-caption text-graphite-200"
                  data-numeric=""
                >
                  {candidate.target_pressure_range}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={candidate.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <XScoreBadge score={candidate.x_score} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
