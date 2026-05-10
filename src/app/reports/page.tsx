"use client";

import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";
import { DocumentShell } from "@/components/DocumentShell";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ResearchPanel } from "@/components/ResearchPanel";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { upsertReport, useLabState } from "@/lib/store/labStore";
import type { Candidate, ResearchReport } from "@/types";

const SECTIONS: Array<{ key: keyof ResearchReport; label: string }> = [
  { key: "introduction", label: "Introduction" },
  { key: "candidate_structure", label: "Candidate Structure" },
  { key: "computational_methods", label: "Computational Methods" },
  { key: "expected_electronic_properties", label: "Expected Electronic Properties" },
  { key: "expected_phonon_epc_behavior", label: "Expected Phonon / EPC Behavior" },
  { key: "validation_plan", label: "Validation Plan" },
  { key: "experimental_pathway", label: "Experimental Pathway" },
  { key: "limitations", label: "Limitations" },
  { key: "conclusion", label: "Conclusion" },
];

export default function ReportsPage() {
  const state = useLabState();
  const [selected, setSelected] = useState<string>(
    state.reports[0]?.candidate_id ?? state.candidates[0]?.candidate_id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidate = useMemo(
    () => state.candidates.find((c) => c.candidate_id === selected),
    [state.candidates, selected],
  );
  const report = useMemo(
    () => state.reports.find((r) => r.candidate_id === selected),
    [state.reports, selected],
  );

  async function handleGenerate(target: Candidate) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: target }),
      });
      if (!response.ok)
        throw new Error(`Request failed (${response.status})`);
      const data = (await response.json()) as { report: ResearchReport };
      upsertReport(data.report);
      setSelected(target.candidate_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="05 · Research Reports"
        title="Cautious academic-style notes"
        description="Reports always frame their findings as exploratory hypotheses requiring computational and experimental validation. The model is constrained to scientific tone via system prompt and JSON-schema response formatting."
        actions={
          <LinkButton href="/candidates" size="sm" variant="secondary">
            Open Candidate Generator
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <p className="text-eyebrow">Candidates</p>
          {state.candidates.length === 0 ? (
            <EmptyState
              title="No candidates available"
              description="Generate candidates from the Candidate Generator first."
              action={
                <LinkButton href="/candidates" size="sm">
                  Open Candidate Generator
                </LinkButton>
              }
            />
          ) : (
            <ol className="mt-3 panel divide-y divide-graphite-800">
              {state.candidates.map((c, i) => {
                const hasReport = state.reports.some(
                  (r) => r.candidate_id === c.candidate_id,
                );
                const active = selected === c.candidate_id;
                return (
                  <li key={c.candidate_id}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.candidate_id)}
                      className={
                        "focus-ring flex w-full items-baseline gap-3 px-4 py-3 text-left transition-colors " +
                        (active
                          ? "bg-graphite-900 text-graphite-50"
                          : "text-graphite-300 hover:bg-graphite-900/60 hover:text-graphite-100")
                      }
                    >
                      <span
                        className="w-6 font-mono text-mono-tab text-eyebrow text-graphite-500"
                        data-numeric=""
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">
                        <p className="truncate text-body font-medium tracking-tightish">
                          {c.name}
                        </p>
                        <p className="truncate text-eyebrow normal-case tracking-normal text-graphite-500">
                          {c.chemical_family}
                        </p>
                      </span>
                      <span
                        className={
                          "rounded-sharp border px-2 py-0.5 text-eyebrow " +
                          (hasReport
                            ? "border-accent-700 bg-accent-900/30 text-accent-200"
                            : "border-graphite-700 bg-graphite-900 text-graphite-400")
                        }
                      >
                        {hasReport ? "Note" : "—"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>

        <div>
          {loading ? (
            <LoadingState
              label="Drafting cautious research note"
              detail="Provider must use cautious tone and frame results as exploratory."
            />
          ) : null}
          {error ? (
            <div className="mt-3 border border-red-700/40 bg-red-900/20 px-4 py-3 text-caption text-red-100">
              {error}
            </div>
          ) : null}

          {!candidate ? (
            <EmptyState
              title="No candidate selected"
              description="Pick a candidate from the list to generate or view its research note."
            />
          ) : !report ? (
            <ResearchPanel
              eyebrow="No note yet"
              title={candidate.name}
              description="Generate a cautious academic-style note for this candidate."
              actions={
                <Button onClick={() => handleGenerate(candidate)} size="sm">
                  Generate note
                </Button>
              }
            >
              <p className="text-caption leading-relaxed text-graphite-400">
                The provider is constrained to scientific, cautious language.
                Output uses words like &quot;candidate&quot;, &quot;hypothesis&quot;,
                and &quot;requires validation&quot;. Sensational language is
                suppressed.
              </p>
            </ResearchPanel>
          ) : (
            <DocumentShell
              eyebrow={`Research note · ${report.report_id}`}
              title={report.title}
              byline={
                <span>
                  Generated by xAI Grok · candidate{" "}
                  <span className="font-mono text-graphite-300">
                    {report.candidate_id}
                  </span>{" "}
                  · {report.generated_at}
                </span>
              }
              abstract={<p>{report.abstract}</p>}
              toolbar={
                <Button
                  onClick={() => handleGenerate(candidate)}
                  size="sm"
                  variant="secondary"
                >
                  Regenerate note
                </Button>
              }
              sections={SECTIONS.map(({ key, label }) => ({
                id: String(key),
                label,
                content: (
                  <p className="whitespace-pre-line">{String(report[key] ?? "")}</p>
                ),
              }))}
              footnote={
                <span>
                  AI-generated research note. Treat all statements as exploratory
                  hypotheses pending DFT, DFPT, EPW, Eliashberg, RPA, and
                  experimental validation.
                </span>
              }
            />
          )}

          {report ? (
            <div className="mt-8">
              <CodeBlock
                language="markdown"
                filename={`${report.report_id}.md`}
                maxHeightClass="max-h-72"
                code={buildMarkdown(report)}
              />
            </div>
          ) : null}

          <div className="mt-10">
            <ScientificDisclaimer />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function buildMarkdown(report: ResearchReport): string {
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
