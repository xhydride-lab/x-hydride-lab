import { NextResponse } from "next/server";
import { buildAuditHashes } from "@/lib/audit/hash";
import type { AuditLog, Candidate } from "@/types";
import {
  CreateAuditLogRequestSchema,
  validateBody,
} from "@/lib/api/validators";
import {
  anchorPayload,
  anchorEnabled,
  buildAuditMemo,
  buildExplorerUrl,
} from "@/lib/anchor/solana";
import { recordActivity } from "@/lib/store/activityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/create-audit-log
 *
 * Computes deterministic SHA-256 hashes for input/output/report/simulation
 * artifacts and, when a Solana payer key is configured, additionally anchors
 * the hash payload via a Memo-program transaction. The resulting AuditLog
 * record carries `chain_status: "anchored"` and a Solscan-resolvable
 * `tx_hash` when on-chain anchoring succeeds.
 *
 * Anchoring is optional and best-effort: if the network call fails the audit
 * log is still returned with `chain_status: "off-chain"` and the caller can
 * retry later.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = validateBody(CreateAuditLogRequestSchema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, issues: parsed.issues },
      { status: 400 },
    );
  }

  const { candidate, report, simulation, inputContext } = parsed.value;
  const candidateTyped = candidate as Candidate;

  const hashes = buildAuditHashes({
    candidateInput:
      inputContext ?? {
        candidate_id: candidateTyped.candidate_id,
        chemical_family: candidateTyped.chemical_family,
        target_pressure_range: candidateTyped.target_pressure_range,
        proposed_composition: candidateTyped.proposed_composition,
      },
    candidateOutput: candidateTyped,
    reportPayload: report ?? { report: null },
    simulationPayload: simulation ?? { simulation: null },
  });

  const apiKeyConfigured = Boolean(process.env.XAI_API_KEY);
  const audit_id = `xh-audit-${candidateTyped.candidate_id}-${Date.now().toString(36)}`;
  const audit: AuditLog = {
    audit_id,
    candidate_id: candidateTyped.candidate_id,
    timestamp: new Date().toISOString(),
    input_hash: hashes.input_hash,
    output_hash: hashes.output_hash,
    report_hash: hashes.report_hash,
    simulation_hash: hashes.simulation_hash,
    model_provider: "xAI Grok",
    model_name: process.env.XAI_MODEL || "grok-4.3",
    version: "0.1.0",
    chain_status: "off-chain",
    tx_hash: null,
  };

  let explorerUrl: string | undefined;
  let anchorError: string | undefined;

  if (anchorEnabled()) {
    audit.chain_status = "pending";
    const memo = buildAuditMemo({
      audit_id: audit.audit_id,
      candidate_id: audit.candidate_id,
      input_hash: audit.input_hash,
      output_hash: audit.output_hash,
      report_hash: audit.report_hash,
      simulation_hash: audit.simulation_hash,
      model_name: audit.model_name,
      version: audit.version,
    });
    const result = await anchorPayload(memo);
    if (result.signature) {
      audit.tx_hash = result.signature;
      audit.chain_status = "anchored";
      explorerUrl = result.explorerUrl ?? buildExplorerUrl(
        result.signature,
        result.network ?? "mainnet-beta",
      );
    } else if (result.error) {
      anchorError = result.error;
      audit.chain_status = "off-chain";
    } else if (result.available === false) {
      audit.chain_status = "off-chain";
    }
  }

  recordActivity({
    type: "audit_anchored",
    candidate_id: audit.candidate_id,
    candidate_name: candidateTyped.name,
    x_score: candidateTyped.x_score,
    chemical_family: candidateTyped.chemical_family,
    hash: audit.output_hash,
    tx_signature: audit.tx_hash ?? undefined,
  });

  return NextResponse.json(
    {
      audit,
      demoMode: !apiKeyConfigured,
      anchor: audit.chain_status === "anchored"
        ? { signature: audit.tx_hash, explorerUrl }
        : anchorError
        ? { error: anchorError }
        : undefined,
    },
    { status: 200 },
  );
}
