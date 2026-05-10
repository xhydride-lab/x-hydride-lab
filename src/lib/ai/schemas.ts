import { CANDIDATE_STATUS_OPTIONS } from "@/types";

/**
 * JSON Schema (draft 2020-12 subset) for the candidate generation response.
 *
 * Used with `response_format: { type: "json_schema", json_schema: ... }` on
 * the xAI Grok provider so the model is forced to emit exactly the shape
 * downstream code expects. `strict: true` makes the provider reject any
 * output that violates the schema, which avoids the parse-then-fix
 * round-trip we used to need.
 */
export const CANDIDATE_RESPONSE_SCHEMA = {
  name: "x_hydride_candidate_response",
  strict: true,
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["candidates"],
    properties: {
      candidates: {
        type: "array",
        minItems: 1,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "candidate_id",
            "name",
            "chemical_family",
            "proposed_composition",
            "structural_hypothesis",
            "target_pressure_range",
            "expected_epc_potential",
            "expected_tc_rationale",
            "stability_risk",
            "phonon_stability_risk",
            "synthesis_pathway",
            "validation_steps",
            "x_score",
            "limitations",
            "status",
          ],
          properties: {
            candidate_id: { type: "string", minLength: 1 },
            name: { type: "string", minLength: 1 },
            chemical_family: { type: "string", minLength: 1 },
            proposed_composition: { type: "string", minLength: 1 },
            structural_hypothesis: { type: "string", minLength: 1 },
            target_pressure_range: { type: "string", minLength: 1 },
            expected_epc_potential: { type: "string", minLength: 1 },
            expected_tc_rationale: { type: "string", minLength: 1 },
            stability_risk: { type: "string", minLength: 1 },
            phonon_stability_risk: { type: "string", minLength: 1 },
            synthesis_pathway: { type: "string", minLength: 1 },
            validation_steps: {
              type: "array",
              minItems: 1,
              items: { type: "string", minLength: 1 },
            },
            x_score: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            limitations: {
              type: "array",
              minItems: 1,
              items: { type: "string", minLength: 1 },
            },
            status: {
              type: "string",
              enum: CANDIDATE_STATUS_OPTIONS,
            },
          },
        },
      },
    },
  },
} as const;

export const RESEARCH_REPORT_RESPONSE_SCHEMA = {
  name: "x_hydride_research_report",
  strict: true,
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "abstract",
      "introduction",
      "candidate_structure",
      "computational_methods",
      "expected_electronic_properties",
      "expected_phonon_epc_behavior",
      "validation_plan",
      "experimental_pathway",
      "limitations",
      "conclusion",
    ],
    properties: {
      title: { type: "string", minLength: 1 },
      abstract: { type: "string", minLength: 1 },
      introduction: { type: "string", minLength: 1 },
      candidate_structure: { type: "string", minLength: 1 },
      computational_methods: { type: "string", minLength: 1 },
      expected_electronic_properties: { type: "string", minLength: 1 },
      expected_phonon_epc_behavior: { type: "string", minLength: 1 },
      validation_plan: { type: "string", minLength: 1 },
      experimental_pathway: { type: "string", minLength: 1 },
      limitations: { type: "string", minLength: 1 },
      conclusion: { type: "string", minLength: 1 },
    },
  },
} as const;
