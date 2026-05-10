"use client";

import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import {
  AuditRecordCard,
  buildAuditMarkdown,
} from "@/components/AuditRecordCard";
import { EmptyState } from "@/components/EmptyState";
import { LedgerTable, type LedgerColumn } from "@/components/LedgerTable";
import { LoadingState } from "@/components/LoadingState";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import { upsertAudit, useLabState } from "@/lib/store/labStore";
import type { AuditLog, SimulationBundle } from "@/types";

export default function AuditLogPage() {
  const state = useLabState();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  const sortedAudits = useMemo(
    () =>
      [...state.audits].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [state.audits],
  );

  const activeAudit = useMemo(
    () => state.audits.find((a) => a.audit_id === activeAuditId) ?? null,
    [state.audits, activeAuditId],
  );

  async function generateForCandidate(candidateId: string) {
    setGeneratingId(candidateId);
    setError(null);
    try {
      const candidate = state.candidates.find(
        (c) => c.candidate_id === candidateId,
      );
      if (!candidate) throw new Error("Candidate not found.");
      const report = state.reports.find((r) => r.candidate_id === candidateId);
      const simResp = await fetch("/api/generate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      if (!simResp.ok) throw new Error(`Simulation failed (${simResp.status})`);
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
        throw new Error(`Audit failed (${auditResp.status})`);
      const auditData = (await auditResp.json()) as { audit: AuditLog };
      upsertAudit(auditData.audit);
      setActiveAuditId(auditData.audit.audit_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingId(null);
    }
  }

  function exportAll(kind: "json" | "md") {
    if (typeof navigator === "undefined" || sortedAudits.length === 0) return;
    const text =
      kind === "json"
        ? JSON.stringify(sortedAudits, null, 2)
        : sortedAudits.map(buildAuditMarkdown).join("\n---\n");
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  const columns: LedgerColumn<AuditLog>[] = [
    {
      key: "audit_id",
      header: "Audit ID",
      mono: true,
      cell: (a) => a.audit_id,
    },
    {
      key: "candidate_id",
      header: "Candidate",
      mono: true,
      cell: (a) => a.candidate_id,
    },
    {
      key: "input_hash",
      header: "Input",
      mono: true,
      cell: (a) => `${a.input_hash.slice(0, 12)}…`,
    },
    {
      key: "output_hash",
      header: "Output",
      mono: true,
      cell: (a) => `${a.output_hash.slice(0, 12)}…`,
    },
    {
      key: "report_hash",
      header: "Report",
      mono: true,
      cell: (a) => `${a.report_hash.slice(0, 12)}…`,
    },
    {
      key: "simulation_hash",
      header: "Simulation",
      mono: true,
      cell: (a) => `${a.simulation_hash.slice(0, 12)}…`,
    },
    {
      key: "model",
      header: "Model",
      cell: (a) => (
        <span className="text-caption text-graphite-300">{a.model_name}</span>
      ),
    },
    {
      key: "chain",
      header: "Chain",
      align: "right",
      cell: (a) => (
        <span
          className={
            "rounded-sharp border px-2 py-0.5 text-eyebrow " +
            (a.chain_status === "anchored"
              ? "border-accent-700 bg-accent-900/40 text-accent-200"
              : a.chain_status === "pending"
                ? "border-amber-700/40 bg-amber-900/30 text-amber-200"
                : "border-graphite-800 bg-graphite-900 text-graphite-300")
          }
        >
          {a.chain_status}
        </span>
      ),
    },
  ];

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="06 · Audit Log"
        title="Provenance ledger"
        description="Each row is a SHA-256 digest of input, output, report, and simulation artifacts tied to a candidate. On-chain anchoring is staged for a future revision."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportAll("json")}
              disabled={sortedAudits.length === 0}
            >
              Copy all (JSON)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportAll("md")}
              disabled={sortedAudits.length === 0}
            >
              Copy all (Markdown)
            </Button>
            <LinkButton href="/candidates" size="sm">
              Generate candidates
            </LinkButton>
          </>
        }
      />

      <div className="flex flex-col gap-12">
        {/* Pending section */}
        <section>
          <SectionHeader
            index={1}
            eyebrow="Pending"
            title="Candidates without audit records"
            description="Generate an audit entry — input/output/report/simulation will be SHA-256 hashed deterministically (timestamps and ids excluded)."
            className="mb-3"
          />
          {state.candidates.length === 0 ? (
            <EmptyState
              title="No candidates"
              description="Generate candidates first."
              action={
                <LinkButton href="/candidates" size="sm">
                  Open Candidate Generator
                </LinkButton>
              }
            />
          ) : (
            <ol className="panel divide-y divide-graphite-800">
              {state.candidates.map((c, i) => {
                const hasAudit = state.audits.some(
                  (a) => a.candidate_id === c.candidate_id,
                );
                return (
                  <li
                    key={c.candidate_id}
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
                        {c.name}
                      </p>
                      <p className="font-mono text-eyebrow text-graphite-500">
                        {c.candidate_id}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={hasAudit ? "secondary" : "primary"}
                      onClick={() => generateForCandidate(c.candidate_id)}
                      loading={generatingId === c.candidate_id}
                    >
                      {hasAudit ? "Regenerate" : "Generate"}
                    </Button>
                  </li>
                );
              })}
            </ol>
          )}
          {error ? (
            <div className="mt-3 border border-red-700/40 bg-red-900/20 px-4 py-3 text-caption text-red-100">
              {error}
            </div>
          ) : null}
          {generatingId ? (
            <div className="mt-3">
              <LoadingState
                label="Computing audit hashes"
                detail="Hashing input, output, report, and simulation artifacts…"
              />
            </div>
          ) : null}
        </section>

        {/* Ledger table */}
        <section>
          <SectionHeader
            index={2}
            eyebrow="Ledger"
            title="Audit records"
            description="Click a row to inspect full hashes and copy export artifacts."
            className="mb-3"
          />
          <LedgerTable
            columns={columns}
            rows={sortedAudits}
            rowKey={(a) => a.audit_id}
            onRowClick={(a) => setActiveAuditId(a.audit_id)}
            empty={
              <div className="text-center">
                <p className="text-body text-graphite-200">
                  No audit records yet.
                </p>
                <p className="mt-1 text-caption text-graphite-500">
                  Generate an audit record from the panel above.
                </p>
              </div>
            }
          />
        </section>

        {/* Active audit detail */}
        {activeAudit ? (
          <section>
            <SectionHeader
              index={3}
              eyebrow="Detail"
              title="Selected audit record"
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveAuditId(null)}
                >
                  Close
                </Button>
              }
              className="mb-3"
            />
            <AuditRecordCard audit={activeAudit} />
          </section>
        ) : null}

        <ScientificDisclaimer />
      </div>
    </AppShell>
  );
}
