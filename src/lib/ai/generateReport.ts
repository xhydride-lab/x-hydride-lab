import type { Candidate, ResearchReport } from "@/types";
import { createXAIProviderFromEnv } from "@/lib/ai/providers/xai";
import { REPORT_SYSTEM_PROMPT, buildReportUserPrompt } from "@/lib/ai/prompts";
import { extractJsonObject } from "@/lib/ai/jsonExtract";
import { RESEARCH_REPORT_RESPONSE_SCHEMA } from "@/lib/ai/schemas";
import { HYDRIDE_DOMAIN_CHECKLIST } from "@/lib/data/domainChecklist";

export interface GenerateReportResult {
  report: ResearchReport;
  demoMode: boolean;
  warnings: string[];
}

/**
 * Generate an academic-style research note for a candidate.
 * Falls back to a deterministic, scientifically cautious template when the
 * provider is unavailable or returns malformed output.
 */
export async function generateResearchReport(
  candidate: Candidate,
): Promise<GenerateReportResult> {
  const provider = createXAIProviderFromEnv();
  const warnings: string[] = [];

  if (!provider.available) {
    return {
      report: buildDemoReport(candidate),
      demoMode: true,
      warnings: [
        "XAI_API_KEY is not configured. Returning a demo research note.",
      ],
    };
  }

  try {
    const completion = await provider.chat({
      model: provider.model,
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: buildReportUserPrompt(candidate) },
      ],
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: RESEARCH_REPORT_RESPONSE_SCHEMA,
      },
      max_tokens: 4096,
    });

    const parsed = extractJsonObject(completion.content) as Record<
      string,
      unknown
    >;
    const report = normalizeReport(candidate, parsed);
    return { report, demoMode: false, warnings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(
      `Provider call failed (${message}). Returning a demo research note.`,
    );
    return { report: buildDemoReport(candidate), demoMode: true, warnings };
  }
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function normalizeReport(
  candidate: Candidate,
  raw: Record<string, unknown>,
): ResearchReport {
  const fallback = buildDemoReport(candidate);
  return {
    report_id: `xh-report-${candidate.candidate_id}`,
    candidate_id: candidate.candidate_id,
    title: asString(raw.title, fallback.title),
    abstract: asString(raw.abstract, fallback.abstract),
    introduction: asString(raw.introduction, fallback.introduction),
    candidate_structure: asString(
      raw.candidate_structure,
      fallback.candidate_structure,
    ),
    computational_methods: asString(
      raw.computational_methods,
      fallback.computational_methods,
    ),
    expected_electronic_properties: asString(
      raw.expected_electronic_properties,
      fallback.expected_electronic_properties,
    ),
    expected_phonon_epc_behavior: asString(
      raw.expected_phonon_epc_behavior,
      fallback.expected_phonon_epc_behavior,
    ),
    validation_plan: asString(raw.validation_plan, fallback.validation_plan),
    experimental_pathway: asString(
      raw.experimental_pathway,
      fallback.experimental_pathway,
    ),
    limitations: asString(raw.limitations, fallback.limitations),
    conclusion: asString(raw.conclusion, fallback.conclusion),
    generated_at: new Date().toISOString(),
  };
}

export function buildDemoReport(candidate: Candidate): ResearchReport {
  const compositionLine = `${candidate.proposed_composition} (${candidate.chemical_family})`;
  return {
    report_id: `xh-report-${candidate.candidate_id}`,
    candidate_id: candidate.candidate_id,
    title: `Preliminary AI-generated research note: ${candidate.name}`,
    abstract: `We outline a preliminary AI-generated proposal for ${candidate.name}, a ${candidate.chemical_family} candidate with proposed composition ${compositionLine}. The candidate is offered as a computational screening target rather than a confirmed superconductor and requires DFT, DFPT, EPW, Eliashberg, and RPA workflows before any quantitative claim of superconducting behavior can be made.`,
    introduction: `Hydride-based superconductors continue to attract attention as candidates for high-Tc behavior under accessible pressures. ${candidate.name} is positioned within the ${candidate.chemical_family} family and was generated as part of an exploratory screening campaign extending the Grokene framework to hydride candidates. The objective is to identify candidates whose phonon, electronic, and structural properties merit dedicated first-principles study.`,
    candidate_structure: `The proposed structural hypothesis is: ${candidate.structural_hypothesis} Composition is given as ${candidate.proposed_composition}. The structure is offered as a starting hypothesis only; full structural relaxation and symmetry analysis are required to confirm a thermodynamically reasonable lattice.`,
    computational_methods: `We recommend a standard hydride-superconductivity workflow: structural relaxation in DFT (PBE or SCAN), DFPT-based phonon dispersion, electron-phonon coupling via EPW with sufficiently dense Wannier interpolation, and isotropic-to-anisotropic Eliashberg analysis to estimate Tc bounds. A coarse RPA screening complements the EPC analysis where applicable.`,
    expected_electronic_properties: `The candidate is expected to exhibit hydrogen-derived contributions near the Fermi level. ${candidate.expected_tc_rationale} These expectations are pending DFT confirmation and should not be treated as established results.`,
    expected_phonon_epc_behavior: `Phonon stability risk is described as: ${candidate.phonon_stability_risk}. EPC potential is described as: ${candidate.expected_epc_potential}. Both estimates are exploratory and subject to revision after DFPT and EPW evaluation.`,
    validation_plan: `Required validation steps include: ${candidate.validation_steps.join("; ")}. The hydride-domain checklist must also be addressed before any quantitative Tc claim is attempted: ${HYDRIDE_DOMAIN_CHECKLIST.join("; ")}. Each item must produce reproducible artifacts that can be archived in the audit log.`,
    experimental_pathway: `If computational screening is encouraging, a synthesis attempt along the pathway "${candidate.synthesis_pathway}" can be considered. Experimental validation must include high-pressure synthesis, structural verification (e.g. XRD), and direct transport measurement of resistivity and Meissner expulsion.`,
    limitations: `Limitations include: ${candidate.limitations.join("; ")}. This document is a preliminary AI-generated proposal and does not constitute experimental evidence for superconductivity.`,
    conclusion: `${candidate.name} is presented as a computational screening target. No superconducting behavior is claimed. Whether the candidate proves promising depends entirely on the outcome of the recommended DFT, DFPT, EPW, Eliashberg, RPA, and experimental workflows.`,
    generated_at: new Date().toISOString(),
  };
}
