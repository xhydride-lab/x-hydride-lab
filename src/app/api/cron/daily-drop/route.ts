import { NextResponse } from "next/server";
import { generateHydrideCandidates } from "@/lib/ai/generateHydrideCandidates";
import { buildAuditHashes } from "@/lib/audit/hash";
import {
  anchorPayload,
  anchorEnabled,
  buildAuditMemo,
  buildExplorerUrl,
} from "@/lib/anchor/solana";
import { recordActivity } from "@/lib/store/activityLog";
import type { CandidateGenerationRequest } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow up to 60s (Pro tier) so a full Grok call + Solana anchor can complete.
export const maxDuration = 60;

/**
 * GET /api/cron/daily-drop
 *
 * Vercel-scheduled handler that produces the daily Hydride Drop:
 *   1. Calls the xAI Grok candidate generator with a rotating research focus.
 *   2. Computes the SHA-256 audit hash payload.
 *   3. Anchors the payload on Solana via Memo program (when configured).
 *   4. Pushes a "candidate_generated" + "audit_anchored" pair into the
 *      in-memory activity log so the landing page hero can surface it.
 *
 * Security: requires either Vercel's cron Authorization header (`Bearer
 * ${CRON_SECRET}`) or an explicit `?key=${CRON_SECRET}` query param so the
 * endpoint cannot be triggered anonymously. If `CRON_SECRET` is unset the
 * endpoint refuses to run in production.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("key");

  if (!secret) {
    // In dev the endpoint is usable freely; in any deployed environment we
    // require a configured secret.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET not configured." },
        { status: 503 },
      );
    }
  } else {
    const ok =
      auth === `Bearer ${secret}` || queryKey === secret;
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const focus = rotateDailyFocus();
  const request_body: CandidateGenerationRequest = {
    research_objective: focus.research_objective,
    chemical_family: focus.chemical_family,
    target_pressure_range: focus.target_pressure_range,
    desired_tc_range: focus.desired_tc_range,
    stability_preference: focus.stability_preference,
    synthesis_difficulty_tolerance: focus.synthesis_difficulty_tolerance,
    notes: focus.notes,
    number_of_candidates: 1,
  };

  let candidates;
  try {
    const result = await generateHydrideCandidates(request_body);
    candidates = result.candidates ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Daily drop generation failed: ${message}` },
      { status: 500 },
    );
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Generator returned no candidates." },
      { status: 502 },
    );
  }

  const candidate = candidates[0];
  recordActivity({
    type: "candidate_generated",
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.name,
    x_score: candidate.x_score,
    chemical_family: candidate.chemical_family,
  });

  const hashes = buildAuditHashes({
    candidateInput: {
      candidate_id: candidate.candidate_id,
      chemical_family: candidate.chemical_family,
      target_pressure_range: candidate.target_pressure_range,
      proposed_composition: candidate.proposed_composition,
    },
    candidateOutput: candidate,
    reportPayload: { report: null },
    simulationPayload: { simulation: null },
  });

  const audit_id = `xh-drop-${candidate.candidate_id}-${Date.now().toString(36)}`;
  const memo = buildAuditMemo({
    audit_id,
    candidate_id: candidate.candidate_id,
    input_hash: hashes.input_hash,
    output_hash: hashes.output_hash,
    report_hash: hashes.report_hash,
    simulation_hash: hashes.simulation_hash,
    model_name: process.env.XAI_MODEL || "grok-4.3",
    version: "0.1.0",
  });

  let signature: string | undefined;
  let explorerUrl: string | undefined;
  let anchorError: string | undefined;
  if (anchorEnabled()) {
    const result = await anchorPayload(memo);
    if (result.signature) {
      signature = result.signature;
      explorerUrl =
        result.explorerUrl ??
        buildExplorerUrl(
          result.signature,
          result.network ?? "mainnet-beta",
        );
    } else if (result.error) {
      anchorError = result.error;
    }
  }

  recordActivity({
    type: "audit_anchored",
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.name,
    x_score: candidate.x_score,
    chemical_family: candidate.chemical_family,
    hash: hashes.output_hash,
    tx_signature: signature,
  });

  return NextResponse.json(
    {
      ok: true,
      drop: {
        audit_id,
        candidate,
        hashes,
        anchor: signature
          ? { signature, explorerUrl }
          : anchorError
          ? { error: anchorError }
          : { skipped: true },
        focus,
      },
    },
    { status: 200 },
  );
}

/**
 * Rotates the research focus across days of the week so the daily drop has
 * thematic variety. Deterministic for the calendar date so re-runs on the
 * same UTC day produce coherent focus.
 */
function rotateDailyFocus() {
  const focuses = [
    {
      research_objective:
        "Survey clathrate binary hydride candidates with hydrogen sublattice motifs near 150 GPa.",
      chemical_family: "binary-hydride",
      target_pressure_range: "100-200 GPa",
      desired_tc_range: "150-250 K",
      stability_preference: "metastable",
      synthesis_difficulty_tolerance: "moderate",
      notes: "Daily focus: clathrate binary hydrides.",
    },
    {
      research_objective:
        "Explore ternary hydrides with covalent host frameworks for lower-pressure superconductivity.",
      chemical_family: "ternary-hydride",
      target_pressure_range: "20-80 GPa",
      desired_tc_range: "80-180 K",
      stability_preference: "thermodynamically near-stable",
      synthesis_difficulty_tolerance: "moderate",
      notes: "Daily focus: low-pressure ternary hydrides.",
    },
    {
      research_objective:
        "Propose B-C-H layered hydride motifs with strong electron-phonon coupling potential.",
      chemical_family: "B-C-H layered hydride",
      target_pressure_range: "10-60 GPa",
      desired_tc_range: "50-150 K",
      stability_preference: "metastable",
      synthesis_difficulty_tolerance: "moderate",
      notes: "Daily focus: B-C-H layered hydrides.",
    },
    {
      research_objective:
        "Investigate Mg-B-H ternary hydrides inspired by MgB2 anisotropic coupling.",
      chemical_family: "Mg-B-H ternary hydride",
      target_pressure_range: "5-40 GPa",
      desired_tc_range: "40-120 K",
      stability_preference: "thermodynamically near-stable",
      synthesis_difficulty_tolerance: "low",
      notes: "Daily focus: Mg-B-H ternary hydrides.",
    },
    {
      research_objective:
        "Examine alkali-metal hydride sublattices for ambient-pressure metastable candidates.",
      chemical_family: "alkali-metal hydride",
      target_pressure_range: "0-30 GPa",
      desired_tc_range: "30-90 K",
      stability_preference: "metastable",
      synthesis_difficulty_tolerance: "moderate",
      notes: "Daily focus: alkali-metal hydride sublattices.",
    },
    {
      research_objective:
        "Probe rare-earth polyhydride cages for very-high-Tc superconducting hypotheses.",
      chemical_family: "rare-earth polyhydride",
      target_pressure_range: "150-250 GPa",
      desired_tc_range: "200-280 K",
      stability_preference: "metastable",
      synthesis_difficulty_tolerance: "high",
      notes: "Daily focus: rare-earth polyhydrides.",
    },
    {
      research_objective:
        "Consider transition-metal hydride frameworks with anharmonic phonon contributions.",
      chemical_family: "transition-metal hydride",
      target_pressure_range: "30-100 GPa",
      desired_tc_range: "60-160 K",
      stability_preference: "metastable",
      synthesis_difficulty_tolerance: "moderate",
      notes: "Daily focus: transition-metal hydrides.",
    },
  ];
  const now = new Date();
  const epochDay = Math.floor(now.getTime() / 86_400_000);
  return focuses[epochDay % focuses.length];
}
