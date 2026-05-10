"use client";

import { useMemo } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CandidateTable } from "@/components/CandidateTable";
import { MetricStrip } from "@/components/MetricStrip";
import { WorkflowStrip } from "@/components/WorkflowStrip";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { LinkButton } from "@/components/Button";
import { AuditRecordCard } from "@/components/AuditRecordCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useLabState } from "@/lib/store/labStore";

const PIPELINE_STEPS = [
  { label: "Input", description: "Research request" },
  { label: "Generation", description: "Grok strict-JSON" },
  { label: "Scoring", description: "Eight subscores" },
  { label: "Simulation", description: "Template bundle" },
  { label: "Documentation", description: "Cautious draft" },
  { label: "Provenance", description: "SHA-256 ledger" },
];

export default function OverviewPage() {
  const state = useLabState();

  const metrics = useMemo(() => {
    const total = state.candidates.length;
    const scores = state.candidates.map((c) => c.x_score);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const max = scores.length ? Math.max(...scores) : 0;
    const pending = state.candidates.filter(
      (c) => c.status !== "Experimental validation required",
    ).length;
    return { total, avg, max, pending };
  }, [state.candidates]);

  const queue = useMemo(
    () =>
      state.candidates
        .filter((c) => c.status !== "Experimental validation required")
        .slice(0, 5),
    [state.candidates],
  );

  const recentCandidates = state.candidates.slice(0, 8);
  const recentAudits = state.audits.slice(0, 2);

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="01 · Overview"
        title="Research Console"
        description="Live view of candidate generation, scoring, and audit activity for the current X-Hydride Lab session."
        actions={
          <>
            <LinkButton href="/candidates" size="sm">
              New candidates
            </LinkButton>
            <LinkButton href="/x-score" size="sm" variant="secondary">
              X-Score Lab
            </LinkButton>
          </>
        }
      />

      <div className="flex flex-col gap-12">
        {/* Metric strip */}
        <MetricStrip
          metrics={[
            { label: "Total candidates", value: metrics.total, hint: "Generated this session" },
            { label: "Average X-Score", value: metrics.avg, hint: "Weighted overall" },
            { label: "Highest X-Score", value: metrics.max, hint: "Best ranked candidate" },
            { label: "Awaiting validation", value: metrics.pending, hint: "Open computational gates" },
          ]}
        />

        {/* Pipeline strip */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            index={2}
            eyebrow="Pipeline"
            title="Discovery pipeline status"
            description="Current session is in the scoring phase. Subsequent steps unlock as artifacts are produced."
          />
          <WorkflowStrip steps={PIPELINE_STEPS} activeIndex={2} />
        </section>

        {/* Two-column: validation queue + recent audits */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              index={3}
              eyebrow="Queue"
              title="Validation queue"
              description="Candidates awaiting the next computational gate."
              actions={
                <LinkButton href="/candidates" size="sm" variant="secondary">
                  View all
                </LinkButton>
              }
              className="mb-3"
            />
            {queue.length === 0 ? (
              <div className="panel px-6 py-10 text-caption text-graphite-400">
                No candidates currently awaiting validation. Generate a new
                batch from the Candidate Generator.
              </div>
            ) : (
              <ol className="panel divide-y divide-graphite-800">
                {queue.map((candidate, i) => (
                  <li
                    key={candidate.candidate_id}
                    className="flex items-baseline gap-4 px-5 py-3"
                  >
                    <span
                      className="w-6 font-mono text-mono-tab text-eyebrow text-graphite-500"
                      data-numeric=""
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="text-body font-medium tracking-tightish text-graphite-50">
                        {candidate.name}
                      </p>
                      <p className="font-mono text-eyebrow text-graphite-500">
                        {candidate.proposed_composition} · {candidate.target_pressure_range}
                      </p>
                    </div>
                    <span className="rounded-sharp border border-accent-700 bg-accent-900/30 px-2 py-0.5 text-eyebrow text-accent-200">
                      {candidate.status}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeader
              index={4}
              eyebrow="Provenance"
              title="Recent audits"
              actions={
                <LinkButton href="/audit" size="sm" variant="secondary">
                  Open ledger
                </LinkButton>
              }
              className="mb-3"
            />
            {recentAudits.length === 0 ? (
              <div className="panel px-5 py-6 text-caption text-graphite-400">
                No audit records yet. Audit entries are produced when a
                candidate report and simulation bundle are generated.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentAudits.map((audit) => (
                  <AuditRecordCard key={audit.audit_id} audit={audit} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent candidates table */}
        <section>
          <SectionHeader
            index={5}
            eyebrow="Registry"
            title="Recent candidates"
            description="Last eight candidates generated in this session, sorted by creation time."
            className="mb-3"
          />
          <CandidateTable
            candidates={recentCandidates}
            emptyLabel="No candidates yet — generate your first batch from the Candidate Generator."
          />
        </section>

        {/* Disclaimer */}
        <ScientificDisclaimer variant="banner" />
      </div>
    </AppShell>
  );
}
