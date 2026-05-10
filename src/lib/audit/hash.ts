import { createHash } from "node:crypto";

/**
 * Deterministic content hashing for audit records.
 *
 * Uses SHA-256 from `node:crypto`. The hashed payload is filtered first to
 * strip non-deterministic fields (timestamps, generated identifiers) so
 * structurally identical artifacts always produce the same digest. This is
 * critical for provenance: regenerating a report at a different time should
 * not change its hash unless the actual content changed.
 *
 * Server-only. The API routes that consume this module set
 * `runtime = "nodejs"` so `node:crypto` is always available.
 */

/** Field names that are stripped from the hashed payload everywhere. */
export const NOISE_FIELDS = new Set<string>([
  "created_at",
  "generated_at",
  "timestamp",
  "audit_id",
  "tx_hash",
]);

/**
 * SHA-256 hex digest. Optional salt is prepended before hashing.
 */
export function sha256Hex(input: string, salt = ""): string {
  return createHash("sha256").update(salt + input, "utf8").digest("hex");
}

export interface AuditHashInputs {
  candidateInput: unknown;
  candidateOutput: unknown;
  reportPayload: unknown;
  simulationPayload: unknown;
  /** Optional salt; falls back to AUDIT_HASH_SALT env var. */
  salt?: string;
}

export interface AuditHashes {
  input_hash: string;
  output_hash: string;
  report_hash: string;
  simulation_hash: string;
}

export function buildAuditHashes(inputs: AuditHashInputs): AuditHashes {
  const salt = inputs.salt ?? process.env.AUDIT_HASH_SALT ?? "";
  return {
    input_hash: hashAny(inputs.candidateInput, salt),
    output_hash: hashAny(inputs.candidateOutput, salt),
    report_hash: hashAny(inputs.reportPayload, salt),
    simulation_hash: hashAny(inputs.simulationPayload, salt),
  };
}

function hashAny(value: unknown, salt: string): string {
  return sha256Hex(stableStringify(value), salt);
}

/**
 * Deterministic JSON.stringify with two guarantees:
 *   1. Object keys are sorted recursively, so structurally equal payloads
 *      always produce the same string regardless of insertion order.
 *   2. Noise fields (NOISE_FIELDS) are removed at every level of nesting,
 *      so timestamps and generated identifiers don't perturb the digest.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(stripAndSort(value));
}

function stripAndSort(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripAndSort);
  const out: Record<string, unknown> = {};
  const source = value as Record<string, unknown>;
  const keys = Object.keys(source)
    .filter((k) => !NOISE_FIELDS.has(k))
    .sort();
  for (const k of keys) {
    out[k] = stripAndSort(source[k]);
  }
  return out;
}
