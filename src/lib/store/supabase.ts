import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Used by the daily-drop pipeline and the audit-log API to persist drop
 * records across Vercel workers (in-memory ring buffer is per-worker and
 * does not survive cold starts). Reads on the landing page go through
 * /api/activity which prefers Supabase when configured, falling back to
 * the in-memory log otherwise.
 *
 * All reads/writes use the SERVICE ROLE key — never expose this client to
 * the browser. Server-only.
 */

let cached: SupabaseClient | null | undefined;

export function getServerSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    cached = null;
    return null;
  }
  cached = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export interface PersistedDrop {
  audit_id: string;
  candidate_id: string;
  candidate_name: string;
  chemical_family: string;
  proposed_composition: string;
  target_pressure_range: string;
  x_score: number;
  output_hash: string;
  timestamp: string;
  tx_hash: string | null;
}

/**
 * Inserts a `candidates` row and an `audit_logs` row for a fresh drop. Best
 * effort — logs but does not throw on failure, so anchoring stays the
 * source of truth.
 */
export async function persistDrop(record: {
  candidate: {
    candidate_id: string;
    name: string;
    chemical_family: string;
    proposed_composition: string;
    structural_hypothesis: string;
    target_pressure_range: string;
    expected_epc_potential: string;
    expected_tc_rationale: string;
    stability_risk: string;
    phonon_stability_risk: string;
    synthesis_pathway: string;
    validation_steps: string[];
    x_score: number;
    limitations: string[];
    status: string;
  };
  audit_id: string;
  hashes: {
    input_hash: string;
    output_hash: string;
    report_hash: string;
    simulation_hash: string;
  };
  modelProvider: string;
  modelName: string;
  version: string;
  txSignature: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  try {
    // Upsert candidate (id-keyed) so re-runs of the same id do not conflict.
    const candidateRow = {
      ...record.candidate,
      validation_steps: record.candidate.validation_steps,
      limitations: record.candidate.limitations,
    };
    const { error: cErr } = await supabase
      .from("candidates")
      .upsert(candidateRow, { onConflict: "candidate_id" });
    if (cErr) {
      console.error("[supabase] candidates upsert failed:", cErr.message);
    }
    const { error: aErr } = await supabase.from("audit_logs").insert({
      audit_id: record.audit_id,
      candidate_id: record.candidate.candidate_id,
      timestamp: new Date().toISOString(),
      input_hash: record.hashes.input_hash,
      output_hash: record.hashes.output_hash,
      report_hash: record.hashes.report_hash,
      simulation_hash: record.hashes.simulation_hash,
      model_provider: record.modelProvider,
      model_name: record.modelName,
      version: record.version,
      chain_status: record.txSignature ? "anchored" : "off-chain",
      tx_hash: record.txSignature,
    });
    if (aErr) {
      console.error("[supabase] audit_logs insert failed:", aErr.message);
      return { ok: false, error: aErr.message };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[supabase] persistDrop threw:", message);
    return { ok: false, error: message };
  }
}

/**
 * Reads the most recent drops, joined with the candidate. Returns an empty
 * array when Supabase is not configured. Best effort — never throws.
 */
export async function readRecentDrops(limit = 10): Promise<PersistedDrop[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        "audit_id, candidate_id, output_hash, timestamp, tx_hash, candidates ( name, chemical_family, proposed_composition, target_pressure_range, x_score )",
      )
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[supabase] readRecentDrops failed:", error.message);
      return [];
    }
    return (data ?? []).map((row) => {
      const c = (row as { candidates?: unknown }).candidates as
        | {
            name?: string;
            chemical_family?: string;
            proposed_composition?: string;
            target_pressure_range?: string;
            x_score?: number;
          }
        | null;
      return {
        audit_id: row.audit_id as string,
        candidate_id: row.candidate_id as string,
        candidate_name: c?.name ?? "",
        chemical_family: c?.chemical_family ?? "",
        proposed_composition: c?.proposed_composition ?? "",
        target_pressure_range: c?.target_pressure_range ?? "",
        x_score: c?.x_score ?? 0,
        output_hash: row.output_hash as string,
        timestamp: row.timestamp as string,
        tx_hash: (row.tx_hash as string | null) ?? null,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[supabase] readRecentDrops threw:", message);
    return [];
  }
}
