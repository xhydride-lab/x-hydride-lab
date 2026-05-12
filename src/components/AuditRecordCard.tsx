"use client";

import { useState } from "react";
import type { AuditLog } from "@/types";
import { cn } from "@/lib/utils/cn";

interface AuditRecordCardProps {
  audit: AuditLog;
  className?: string;
}

/**
 * AuditRecordCard — used only on the Overview page where a small list of
 * recent audit records appears. The Audit Log page uses LedgerTable for
 * its primary view and falls back to this card for the detail drawer.
 *
 * Visually flat: hairline borders, square corners, no shadow.
 */
export function AuditRecordCard({ audit, className }: AuditRecordCardProps) {
  return (
    <article className={cn("panel", className)}>
      <header className="hairline-b flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div>
          <p className="text-eyebrow">Audit record</p>
          <p
            className="mt-1 font-mono text-caption text-graphite-100"
            data-numeric=""
          >
            {audit.audit_id}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-eyebrow">
          <span className="rounded-sharp border border-graphite-800 bg-graphite-900 px-2 py-0.5 text-graphite-300">
            {audit.model_provider}
          </span>
          <span className="rounded-sharp border border-graphite-800 bg-graphite-900 px-2 py-0.5 text-graphite-300">
            {audit.model_name}
          </span>
          <ChainStatusPill status={audit.chain_status} />
        </div>
      </header>

      <div className="grid grid-cols-2 divide-x divide-graphite-800 sm:grid-cols-4">
        <HashField label="Input" value={audit.input_hash} />
        <HashField label="Output" value={audit.output_hash} />
        <HashField label="Report" value={audit.report_hash} />
        <HashField label="Simulation" value={audit.simulation_hash} />
      </div>

      {audit.tx_hash ? (
        <div className="hairline flex flex-wrap items-baseline justify-between gap-3 px-5 py-2 text-eyebrow">
          <span className="text-graphite-500">Solana memo</span>
          <a
            href={`https://solscan.io/tx/${audit.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-md font-mono text-mono-tab text-[11px] text-accent-300 hover:text-accent-200"
            data-numeric=""
          >
            {audit.tx_hash.slice(0, 12)}…{audit.tx_hash.slice(-6)} ↗
          </a>
        </div>
      ) : null}

      <footer className="hairline flex flex-wrap items-center justify-between gap-3 px-5 py-2 text-eyebrow text-graphite-500">
        <span className="font-mono text-mono-tab" data-numeric="">
          {audit.timestamp}
        </span>
        <ExportRow audit={audit} />
      </footer>
    </article>
  );
}

function HashField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-eyebrow">{label}</p>
      <p
        className="mt-1 break-all font-mono text-[11px] leading-tight text-graphite-200"
        data-numeric=""
      >
        {value.slice(0, 24)}…
      </p>
    </div>
  );
}

function ChainStatusPill({ status }: { status: AuditLog["chain_status"] }) {
  const cls =
    status === "anchored"
      ? "border-accent-700 bg-accent-900/40 text-accent-200"
      : status === "pending"
        ? "border-amber-700/40 bg-amber-900/30 text-amber-200"
        : "border-graphite-800 bg-graphite-900 text-graphite-300";
  return (
    <span
      className={cn(
        "rounded-sharp border px-2 py-0.5 text-eyebrow",
        cls,
      )}
    >
      {status}
    </span>
  );
}

function ExportRow({ audit }: { audit: AuditLog }) {
  const [copied, setCopied] = useState<"none" | "json" | "md" | "commit">(
    "none",
  );

  const copyText = async (text: string, kind: "json" | "md" | "commit") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied("none"), 1400);
    } catch {
      setCopied("none");
    }
  };

  const json = JSON.stringify(audit, null, 2);
  const md = buildAuditMarkdown(audit);
  const commit = `Add X-Hydride candidate research artifact: ${audit.candidate_id}`;

  const btn =
    "focus-ring rounded-sharp border border-graphite-800 bg-graphite-950 px-2 py-1 text-eyebrow text-graphite-200 hover:border-graphite-600";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => copyText(json, "json")} className={btn}>
        {copied === "json" ? "Copied JSON" : "JSON"}
      </button>
      <button type="button" onClick={() => copyText(md, "md")} className={btn}>
        {copied === "md" ? "Copied Markdown" : "Markdown"}
      </button>
      <button type="button" onClick={() => copyText(commit, "commit")} className={btn}>
        {copied === "commit" ? "Copied Commit Note" : "Commit"}
      </button>
    </div>
  );
}

export function buildAuditMarkdown(audit: AuditLog): string {
  return [
    `# X-Hydride Lab — Audit Record`,
    "",
    `- **audit_id**: \`${audit.audit_id}\``,
    `- **candidate_id**: \`${audit.candidate_id}\``,
    `- **timestamp**: ${audit.timestamp}`,
    `- **model_provider**: ${audit.model_provider}`,
    `- **model_name**: ${audit.model_name}`,
    `- **version**: ${audit.version}`,
    `- **chain_status**: ${audit.chain_status}`,
    `- **tx_hash**: ${audit.tx_hash ?? "n/a"}`,
    "",
    `## Hashes`,
    "",
    `| Artifact | Hash |`,
    `| --- | --- |`,
    `| Input | \`${audit.input_hash}\` |`,
    `| Output | \`${audit.output_hash}\` |`,
    `| Report | \`${audit.report_hash}\` |`,
    `| Simulation | \`${audit.simulation_hash}\` |`,
    "",
  ].join("\n");
}
