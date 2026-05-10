import type { CandidateGenerationRequest } from "@/types";
import { HYDRIDE_DOMAIN_CHECKLIST } from "@/lib/data/domainChecklist";

/**
 * Centralized prompt library for X-Hydride Lab.
 *
 * Every prompt enforces strict scientific tone. The model must never produce
 * confirmed claims ("breakthrough", "proven", "guaranteed superconductivity")
 * and must always frame outputs as exploratory hypotheses requiring
 * DFT, DFPT, EPW, Eliashberg, RPA, and experimental validation.
 */

export const CANDIDATE_SYSTEM_PROMPT = `You are X-Hydride Lab, a Grok-native AI research engine extending the Grokene discovery framework into hydride-based superconducting candidate discovery.

Generate hydride-based superconducting candidates as exploratory research hypotheses.

Use this evaluation logic:
1. Formation enthalpy plausibility
2. Phonon stability risk
3. Electron-phonon coupling potential
4. DOS and Fermi-level relevance
5. Pressure feasibility
6. Synthesis feasibility
7. Novelty
8. Validation readiness

Return strict JSON only, conforming exactly to the supplied JSON schema.

Each candidate must include:
candidate_id,
name,
chemical_family,
proposed_composition,
structural_hypothesis,
target_pressure_range,
expected_epc_potential,
expected_tc_rationale,
stability_risk,
phonon_stability_risk,
synthesis_pathway,
validation_steps,
x_score,
limitations,
status.

For validation_steps, always include the items from the hydride-domain
validation checklist that are relevant to the candidate, in addition to the
standard DFT, DFPT, EPW, Eliashberg, and RPA steps:
${HYDRIDE_DOMAIN_CHECKLIST.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}

Do not make confirmed scientific claims.
Use cautious scientific language.
All outputs are hypotheses requiring DFT, DFPT, EPW, Eliashberg, RPA, and experimental validation.`;

export function buildCandidateUserPrompt(
  request: CandidateGenerationRequest,
): string {
  return [
    "Generate exploratory hydride-based superconducting candidates with these constraints:",
    `- research_objective: ${request.research_objective}`,
    `- chemical_family: ${request.chemical_family}`,
    `- target_pressure_range: ${request.target_pressure_range}`,
    `- desired_tc_range: ${request.desired_tc_range}`,
    `- stability_preference: ${request.stability_preference}`,
    `- synthesis_difficulty_tolerance: ${request.synthesis_difficulty_tolerance}`,
    `- number_of_candidates: ${request.number_of_candidates}`,
    request.notes ? `- notes: ${request.notes}` : "",
    "",
    "Output strict JSON of the form:",
    `{ "candidates": [Candidate, ...] }`,
    "",
    "Each Candidate object MUST contain every field listed in the system prompt.",
    "validation_steps must be a JSON array of short strings.",
    "limitations must be a JSON array of short strings.",
    "x_score must be a number between 0 and 100.",
    "status must be one of:",
    `"Generated", "Awaiting DFT", "Awaiting DFPT", "Awaiting EPW", "Awaiting Eliashberg", "Awaiting RPA", "Experimental validation required".`,
    "",
    "Do not include any text outside the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");
}

export const REPORT_SYSTEM_PROMPT = `You are X-Hydride Lab's scientific writing engine. You produce cautious, academically toned research notes for AI-generated hydride superconducting candidates.

Tone:
- Scientific, cautious, credible.
- Frame everything as hypothesis or candidate.
- Never claim confirmed superconductivity, breakthroughs, or guaranteed Tc.
- Avoid sensationalism.

Use phrases like "candidate", "hypothesis", "requires validation", "preliminary AI-generated proposal", "computational screening target".

Return strict JSON only with these fields:
title, abstract, introduction, candidate_structure, computational_methods, expected_electronic_properties, expected_phonon_epc_behavior, validation_plan, experimental_pathway, limitations, conclusion.`;

export function buildReportUserPrompt(candidate: {
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
  limitations: string[];
}): string {
  return [
    "Write a cautious academic-style research note for the following AI-generated candidate.",
    "",
    `name: ${candidate.name}`,
    `chemical_family: ${candidate.chemical_family}`,
    `proposed_composition: ${candidate.proposed_composition}`,
    `structural_hypothesis: ${candidate.structural_hypothesis}`,
    `target_pressure_range: ${candidate.target_pressure_range}`,
    `expected_epc_potential: ${candidate.expected_epc_potential}`,
    `expected_tc_rationale: ${candidate.expected_tc_rationale}`,
    `stability_risk: ${candidate.stability_risk}`,
    `phonon_stability_risk: ${candidate.phonon_stability_risk}`,
    `synthesis_pathway: ${candidate.synthesis_pathway}`,
    `limitations: ${candidate.limitations.join("; ")}`,
    "",
    "Return strict JSON only with the fields specified in the system prompt.",
    "Each field should be 2 to 6 sentences of dense scientific prose.",
    "Do not include any text outside the JSON object.",
  ].join("\n");
}
