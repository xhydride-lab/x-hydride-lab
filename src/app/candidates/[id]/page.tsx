"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ResearchPanel } from "@/components/ResearchPanel";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { XScoreBadge } from "@/components/XScoreBadge";
import { XScoreRadar } from "@/components/XScoreRadar";
import { ValidationTimeline } from "@/components/ValidationTimeline";
import { MetadataStrip, type MetadataItem } from "@/components/MetadataStrip";
import { AuditRecordCard } from "@/components/AuditRecordCard";
import {
  estimateBreakdownFromHeadline,
  nextValidationStep,
  riskFlagsFor,
  X_SCORE_CATEGORIES,
} from "@/lib/scoring/xScore";
import { HYDRIDE_DOMAIN_CHECKLIST } from "@/lib/data/domainChecklist";
import {
  findAuditsForCandidate,
  findReport,
  upsertAudit,
  upsertReport,
  useLabState,
} from "@/lib/store/labStore";
import type {
  AuditLog,
  Candidate,
  ResearchReport,
  SimulationBundle,
} from "@/types";

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? "");
  const state = useLabState();
  const candidate = state.candidates.find((c) => c.candidate_id === id);

  if (!candidate) {
    return (
      <AppShell demoMode>
        <PageHeader
          eyebrow="Candidate"
          title="Candidate not found"
          description="The candidate may have been cleared from local storage. Generate a new batch from the Candidate Generator."
        />
        <EmptyState
          title="No candidate matches that identifier"
          description="Use the Candidate Generator to create a new exploratory hypothesis."
          action={
            <LinkButton href="/candidates" size="sm">
              Open Candidate Generator
            </LinkButton>
          }
        />
      </AppShell>
    );
  }

  return <CandidateDetailContent candidate={candidate} />;
}

function CandidateDetailContent({ candidate }: { candidate: Candidate }) {
  const breakdown = useMemo(
    () => estimateBreakdownFromHeadline(candidate.x_score, candidate.candidate_id),
    [candidate.candidate_id, candidate.x_score],
  );
  const flags = useMemo(() => riskFlagsFor(breakdown), [breakdown]);
  const nextStep = useMemo(() => nextValidationStep(breakdown), [breakdown]);
  const report = findReport(candidate.candidate_id);
  const audits = findAuditsForCandidate(candidate.candidate_id);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  async function generateReport() {
    setReportLoading(true);
    setReportError(null);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const data = (await response.json()) as { report: ResearchReport };
      upsertReport(data.report);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : String(err));
    } finally {
      setReportLoading(false);
    }
  }

  async function generateAudit() {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const simResp = await fetch("/api/generate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      if (!simResp.ok)
        throw new Error(`Simulation request failed (${simResp.status})`);
      const simData = (await simResp.json()) as { bundle: SimulationBundle };

      const auditResp = await fetch("/api/create-audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          report: report ?? null,
          simulation: simData.bundle,
        }),
      });
      if (!auditResp.ok)
        throw new Error(`Audit request failed (${auditResp.status})`);
      const auditData = (await auditResp.json()) as { audit: AuditLog };
      upsertAudit(auditData.audit);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuditLoading(false);
    }
  }

  const metadata: MetadataItem[] = [
    { label: "Identifier", value: candidate.candidate_id, mono: true },
    { label: "Family", value: candidate.chemical_family },
    { label: "Composition", value: candidate.proposed_composition, mono: true },
    { label: "Pressure target", value: candidate.target_pressure_range, mono: true },
    { label: "Status", value: <StatusBadge status={candidate.status} /> },
    { label: "X-Score", value: <XScoreBadge score={candidate.x_score} size="sm" /> },
    { label: "Created", value: <span className="font-mono text-mono-tab">{candidate.created_at}</span> },
    { label: "Next gate", value: nextStep },
  ];

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="02 · Candidate dossier"
        title={candidate.name}
        description={candidate.structural_hypothesis}
        actions={
          <>
            <LinkButton href="/candidates" size="sm" variant="secondary">
              Back to generator
            </LinkButton>
            <LinkButton
              href={`/simulation?id=${encodeURIComponent(candidate.candidate_id)}`}
              size="sm"
            >
              Open Simulation Builder
            </LinkButton>
          </>
        }
      />

      <div className="flex flex-col gap-12">
        {/* Metadata strip */}
        <section>
          <SectionHeader
            index={1}
            eyebrow="Frontmatter"
            title="Dossier metadata"
            className="mb-3"
          />
          <div className="panel">
            <MetadataStrip items={metadata} layout="grid" />
          </div>
        </section>

        {/* Hypothesis + Risks */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <SectionHeader
              index={2}
              eyebrow="Hypothesis"
              title="Structural hypothesis & rationale"
              className="mb-3"
            />
            <article className="panel divide-y divide-graphite-800">
              <DossierField label="Structural hypothesis" value={candidate.structural_hypothesis} />
              <DossierField label="Expected EPC potential" value={candidate.expected_epc_potential} />
              <DossierField label="Tc rationale" value={candidate.expected_tc_rationale} />
              <DossierField label="Synthesis pathway" value={candidate.synthesis_pathway} />
            </article>
          </div>

          <div>
            <SectionHeader
              index={3}
              eyebrow="Risks"
              title="Stability & limitations"
              className="mb-3"
            />
            <article className="panel divide-y divide-graphite-800">
              <DossierField label="Stability risk" value={candidate.stability_risk} />
              <DossierField label="Phonon stability risk" value={candidate.phonon_stability_risk} />
              <div className="border border-amber-700/40 bg-amber-900/15 px-5 py-4">
                <p className="text-eyebrow text-amber-200">Limitations</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-caption leading-relaxed text-amber-100/85">
                  {candidate.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </section>

        {/* X-Score evidence */}
        <section>
          <SectionHeader
            index={4}
            eyebrow="Evidence"
            title="X-Score evidence panel"
            description={`Recommended next validation step: ${nextStep}.`}
            actions={<XScoreBadge score={candidate.x_score} size="md" />}
            className="mb-3"
          />
          <div className="panel grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
            <div className="border-b border-graphite-800 lg:border-b-0 lg:border-r">
              <div className="hairline-b grid grid-cols-12 px-5 py-2.5 text-eyebrow">
                <span className="col-span-1">#</span>
                <span className="col-span-7">Subscore</span>
                <span className="col-span-2 text-right">Weight</span>
                <span className="col-span-2 text-right">Value</span>
              </div>
              <ol>
                {X_SCORE_CATEGORIES.map((cat, i) => {
                  const value = breakdown[cat.key];
                  return (
                    <li
                      key={cat.key}
                      className="ledger-row grid grid-cols-12 items-baseline gap-2 px-5 py-2.5"
                    >
                      <span
                        className="col-span-1 font-mono text-mono-tab text-eyebrow text-graphite-500"
                        data-numeric=""
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="col-span-7 text-body text-graphite-100">
                        {cat.label}
                      </span>
                      <span
                        className="col-span-2 text-right font-mono text-mono-tab text-caption text-graphite-300"
                        data-numeric=""
                      >
                        {Math.round(
                          {
                            thermodynamic_stability: 0.15,
                            phonon_stability: 0.15,
                            epc_potential: 0.2,
                            dos_fermi_relevance: 0.1,
                            pressure_feasibility: 0.15,
                            synthesis_feasibility: 0.1,
                            novelty: 0.05,
                            validation_readiness: 0.1,
                          }[cat.key] * 100,
                        )}
                        %
                      </span>
                      <span
                        className="col-span-2 text-right font-mono text-mono-tab text-body text-graphite-50"
                        data-numeric=""
                      >
                        {value}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="flex flex-col gap-4 px-5 py-5">
              <XScoreRadar breakdown={breakdown} size={300} />
              <div>
                <p className="text-eyebrow">Risk flags</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-caption leading-relaxed text-graphite-200">
                  {flags.map((f, i) => (
                    <li
                      key={i}
                      className="border border-graphite-800 bg-graphite-900/40 px-3 py-2"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Validation timeline + checklist */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeader
              index={5}
              eyebrow="Pipeline"
              title="Validation timeline"
              description="Each gate must produce reproducible computational artifacts before progression."
              className="mb-3"
            />
            <ValidationTimeline current={candidate.status} />
          </div>
          <div>
            <SectionHeader
              index={6}
              eyebrow="Checklist"
              title="Hydride-domain validation checklist"
              description="Items the candidate must address before any quantitative claim is attempted."
              className="mb-3"
            />
            <ul className="panel divide-y divide-graphite-800">
              {HYDRIDE_DOMAIN_CHECKLIST.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 px-5 py-2.5 text-body text-graphite-100"
                >
                  <span
                    className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                    data-numeric=""
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 panel-flat px-4 py-3">
              <p className="text-eyebrow">Recommended validation steps</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-caption text-graphite-300">
                {candidate.validation_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Workflow actions: report, simulation, audit */}
        <section>
          <SectionHeader
            index={7}
            eyebrow="Workflow"
            title="Documentation & provenance"
            description="Generate the cautious research note, simulation bundle, and audit record in order."
            className="mb-3"
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResearchPanel
              eyebrow="Report"
              title={report ? "Generated note" : "No research note yet"}
              actions={
                <Button onClick={generateReport} loading={reportLoading} size="sm">
                  {report ? "Regenerate note" : "Generate note"}
                </Button>
              }
            >
              {reportError ? (
                <div className="mb-3 border border-red-700/40 bg-red-900/20 px-3 py-2 text-caption text-red-100">
                  {reportError}
                </div>
              ) : null}
              {reportLoading ? (
                <LoadingState
                  label="Drafting research note"
                  detail="Calling xAI Grok with strict cautious tone constraints…"
                />
              ) : report ? (
                <ReportPreview report={report} />
              ) : (
                <p className="text-caption text-graphite-400">
                  Click{" "}
                  <span className="font-medium text-graphite-200">
                    Generate note
                  </span>{" "}
                  to produce a research-grade summary. Output falls back to a
                  demo report when no API key is configured.
                </p>
              )}
            </ResearchPanel>

            <ResearchPanel
              eyebrow="Audit"
              title="Audit log entries"
              description={
                audits.length === 0
                  ? "Generate an audit record once a simulation bundle has been created."
                  : `${audits.length} audit record(s) tied to this candidate.`
              }
              actions={
                <Button onClick={generateAudit} loading={auditLoading} size="sm">
                  Generate audit
                </Button>
              }
            >
              {auditError ? (
                <div className="mb-3 border border-red-700/40 bg-red-900/20 px-3 py-2 text-caption text-red-100">
                  {auditError}
                </div>
              ) : null}
              {audits.length === 0 ? (
                <p className="text-caption text-graphite-400">
                  Audit records contain SHA-256 hashes of input, output,
                  report, and simulation artifacts so provenance is preserved
                  across DeSci workflows.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {audits.map((audit) => (
                    <AuditRecordCard key={audit.audit_id} audit={audit} />
                  ))}
                </div>
              )}
            </ResearchPanel>
          </div>
        </section>

        <ScientificDisclaimer />
      </div>

      <p className="mt-6 text-caption text-graphite-500">
        <Link className="focus-ring rounded-sharp underline" href="/audit">
          See all audit records →
        </Link>
      </p>
    </AppShell>
  );
}

function DossierField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-eyebrow">{label}</p>
      <p className="mt-1.5 text-body leading-relaxed text-graphite-100">
        {value}
      </p>
    </div>
  );
}

function ReportPreview({ report }: { report: ResearchReport }) {
  const fullMarkdown = buildReportMarkdown(report);
  return (
    <div className="flex flex-col gap-3">
      <div className="border border-graphite-800 bg-graphite-900/40 px-4 py-3">
        <p className="text-eyebrow">{report.title}</p>
        <p className="mt-2 text-caption leading-relaxed text-graphite-200">
          {report.abstract}
        </p>
      </div>
      <CodeBlock
        code={fullMarkdown}
        language="markdown"
        filename={`${report.report_id}.md`}
        maxHeightClass="max-h-72"
      />
    </div>
  );
}

function buildReportMarkdown(report: ResearchReport): string {
  return [
    `# ${report.title}`,
    "",
    `## Abstract`,
    report.abstract,
    "",
    `## Introduction`,
    report.introduction,
    "",
    `## Candidate Structure`,
    report.candidate_structure,
    "",
    `## Computational Methods`,
    report.computational_methods,
    "",
    `## Expected Electronic Properties`,
    report.expected_electronic_properties,
    "",
    `## Expected Phonon / EPC Behavior`,
    report.expected_phonon_epc_behavior,
    "",
    `## Validation Plan`,
    report.validation_plan,
    "",
    `## Experimental Pathway`,
    report.experimental_pathway,
    "",
    `## Limitations`,
    report.limitations,
    "",
    `## Conclusion`,
    report.conclusion,
    "",
  ].join("\n");
}
