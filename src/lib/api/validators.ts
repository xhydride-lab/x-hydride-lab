import { z } from "zod";
import { CANDIDATE_STATUS_OPTIONS } from "@/types";

/**
 * Centralized zod schemas for API route payload validation.
 *
 * Every server-side route handler validates its incoming JSON through one
 * of these schemas before doing any work. The schemas are intentionally
 * permissive about structural extras (we strip unknown fields rather than
 * rejecting) so callers do not break when the platform evolves, but every
 * required field is strictly typed and bounded.
 */

const CandidateStatusSchema = z.enum(
  CANDIDATE_STATUS_OPTIONS as [string, ...string[]],
);

/** Candidate object as it travels in/out of the API routes. */
export const CandidateSchema = z
  .object({
    candidate_id: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    chemical_family: z.string().min(1).max(256),
    proposed_composition: z.string().min(1).max(256),
    structural_hypothesis: z.string().min(1).max(2_000),
    target_pressure_range: z.string().min(1).max(128),
    expected_epc_potential: z.string().min(1).max(2_000),
    expected_tc_rationale: z.string().min(1).max(2_000),
    stability_risk: z.string().min(1).max(2_000),
    phonon_stability_risk: z.string().min(1).max(2_000),
    synthesis_pathway: z.string().min(1).max(2_000),
    validation_steps: z.array(z.string().min(1).max(256)).min(1).max(32),
    x_score: z.number().min(0).max(100),
    limitations: z.array(z.string().min(1).max(512)).min(1).max(32),
    status: CandidateStatusSchema,
    created_at: z.string().min(1),
  })
  .strict();

export const ResearchReportSchema = z
  .object({
    report_id: z.string().min(1).max(128),
    candidate_id: z.string().min(1).max(128),
    title: z.string().min(1).max(512),
    abstract: z.string().min(1).max(8_000),
    introduction: z.string().min(1).max(8_000),
    candidate_structure: z.string().min(1).max(8_000),
    computational_methods: z.string().min(1).max(8_000),
    expected_electronic_properties: z.string().min(1).max(8_000),
    expected_phonon_epc_behavior: z.string().min(1).max(8_000),
    validation_plan: z.string().min(1).max(8_000),
    experimental_pathway: z.string().min(1).max(8_000),
    limitations: z.string().min(1).max(8_000),
    conclusion: z.string().min(1).max(8_000),
    generated_at: z.string().min(1),
  })
  .strict();

export const SimulationFileSchema = z
  .object({
    file_id: z.string().min(1).max(128),
    candidate_id: z.string().min(1).max(128),
    type: z.enum(["cif", "qe_input", "gpaw_ase", "phonon", "epw", "convergence"]),
    filename: z.string().min(1).max(256),
    language: z.enum(["ini", "python", "yaml", "text"]),
    contents: z.string().min(1).max(64_000),
    created_at: z.string().min(1),
  })
  .strict();

export const SimulationBundleSchema = z
  .object({
    candidate_id: z.string().min(1).max(128),
    files: z.array(SimulationFileSchema).min(1).max(32),
    generated_at: z.string().min(1),
  })
  .strict();

/** Body of POST /api/generate-candidates. */
export const CandidateGenerationRequestSchema = z
  .object({
    research_objective: z.string().min(1).max(512),
    chemical_family: z.string().min(1).max(256),
    target_pressure_range: z.string().min(1).max(128),
    desired_tc_range: z.string().min(1).max(128),
    stability_preference: z.string().min(1).max(128),
    synthesis_difficulty_tolerance: z.string().min(1).max(128),
    number_of_candidates: z.coerce.number().int().min(1).max(10),
    notes: z.string().max(2_000).optional(),
  })
  .strict();

/** Body of POST /api/generate-report. */
export const GenerateReportRequestSchema = z
  .object({
    candidate: CandidateSchema,
  })
  .strict();

/** Body of POST /api/generate-simulation. */
export const GenerateSimulationRequestSchema = z
  .object({
    candidate: CandidateSchema,
  })
  .strict();

/** Body of POST /api/create-audit-log. */
export const CreateAuditLogRequestSchema = z
  .object({
    candidate: CandidateSchema,
    report: ResearchReportSchema.nullable().optional(),
    simulation: SimulationBundleSchema.nullable().optional(),
    /** Original user request preserved verbatim for input-hash provenance. */
    inputContext: z.unknown().optional(),
  })
  .strict();

/**
 * Validation helper: parse the body, return either a typed payload or a
 * formatted JSON-string error for use in 400 responses.
 */
export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
):
  | { ok: true; value: T }
  | { ok: false; error: string; issues: z.ZodIssue[] } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  const formatted = result.error.issues
    .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");
  return { ok: false, error: formatted, issues: result.error.issues };
}
