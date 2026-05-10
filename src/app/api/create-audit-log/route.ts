import { NextResponse } from "next/server";
import { buildAuditHashes } from "@/lib/audit/hash";
import type { AuditLog, Candidate } from "@/types";
import {
  CreateAuditLogRequestSchema,
  validateBody,
} from "@/lib/api/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/create-audit-log
 *
 * Computes deterministic SHA-256 hashes for input/output/report/simulation
 * artifacts and returns an AuditLog entry. The route never mutates external
 * state and does not anchor on-chain — chain_status is always "off-chain"
 * for now.
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
  const audit: AuditLog = {
    audit_id: `xh-audit-${candidateTyped.candidate_id}-${Date.now().toString(36)}`,
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

  return NextResponse.json(
    { audit, demoMode: !apiKeyConfigured },
    { status: 200 },
  );
}
