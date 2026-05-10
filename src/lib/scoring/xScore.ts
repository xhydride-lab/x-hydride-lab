import type { XScoreBreakdown } from "@/types";

/**
 * Weighted X-Score formula.
 *
 * Each subscore is on the 0–100 scale. Weights sum to 1.00. The overall
 * score is rounded to the nearest integer for display purposes.
 */
export const X_SCORE_WEIGHTS = {
  thermodynamic_stability: 0.15,
  phonon_stability: 0.15,
  epc_potential: 0.2,
  dos_fermi_relevance: 0.1,
  pressure_feasibility: 0.15,
  synthesis_feasibility: 0.1,
  novelty: 0.05,
  validation_readiness: 0.1,
} as const;

export type XScoreCategory = keyof typeof X_SCORE_WEIGHTS;

export const X_SCORE_CATEGORIES: ReadonlyArray<{
  key: XScoreCategory;
  label: string;
  description: string;
}> = [
  {
    key: "thermodynamic_stability",
    label: "Thermodynamic Stability",
    description:
      "Convex-hull plausibility and formation enthalpy at the target pressure.",
  },
  {
    key: "phonon_stability",
    label: "Phonon Stability",
    description:
      "Estimated absence of imaginary modes across the Brillouin zone.",
  },
  {
    key: "epc_potential",
    label: "EPC Potential",
    description:
      "Plausibility of strong electron-phonon coupling from hydrogen modes.",
  },
  {
    key: "dos_fermi_relevance",
    label: "DOS / Fermi-Level Relevance",
    description:
      "Estimated weight of hydrogen-derived states at the Fermi level.",
  },
  {
    key: "pressure_feasibility",
    label: "Pressure Feasibility",
    description:
      "How accessible the target pressure is for synthesis and measurement.",
  },
  {
    key: "synthesis_feasibility",
    label: "Synthesis Feasibility",
    description:
      "Practical feasibility of the proposed synthesis pathway.",
  },
  {
    key: "novelty",
    label: "Novelty",
    description:
      "Distance from already-screened hydride candidates in the literature.",
  },
  {
    key: "validation_readiness",
    label: "Validation Readiness",
    description:
      "Maturity of the workflow needed to take the candidate to validation.",
  },
];

export interface SubscoreInput {
  thermodynamic_stability: number;
  phonon_stability: number;
  epc_potential: number;
  dos_fermi_relevance: number;
  pressure_feasibility: number;
  synthesis_feasibility: number;
  novelty: number;
  validation_readiness: number;
}

export function clamp01to100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeXScore(input: SubscoreInput): XScoreBreakdown {
  const sub = {
    thermodynamic_stability: clamp01to100(input.thermodynamic_stability),
    phonon_stability: clamp01to100(input.phonon_stability),
    epc_potential: clamp01to100(input.epc_potential),
    dos_fermi_relevance: clamp01to100(input.dos_fermi_relevance),
    pressure_feasibility: clamp01to100(input.pressure_feasibility),
    synthesis_feasibility: clamp01to100(input.synthesis_feasibility),
    novelty: clamp01to100(input.novelty),
    validation_readiness: clamp01to100(input.validation_readiness),
  };

  const overallRaw =
    sub.thermodynamic_stability * X_SCORE_WEIGHTS.thermodynamic_stability +
    sub.phonon_stability * X_SCORE_WEIGHTS.phonon_stability +
    sub.epc_potential * X_SCORE_WEIGHTS.epc_potential +
    sub.dos_fermi_relevance * X_SCORE_WEIGHTS.dos_fermi_relevance +
    sub.pressure_feasibility * X_SCORE_WEIGHTS.pressure_feasibility +
    sub.synthesis_feasibility * X_SCORE_WEIGHTS.synthesis_feasibility +
    sub.novelty * X_SCORE_WEIGHTS.novelty +
    sub.validation_readiness * X_SCORE_WEIGHTS.validation_readiness;

  return {
    ...sub,
    overall: clamp01to100(overallRaw),
  };
}

/**
 * Heuristic estimator: build a plausible subscore breakdown for a candidate
 * whose only known macroscopic value is the headline x_score. Used as a
 * deterministic visualization helper when a full breakdown is not yet stored.
 */
export function estimateBreakdownFromHeadline(
  headline: number,
  seed: string,
): XScoreBreakdown {
  const base = clamp01to100(headline);
  const offsets = pseudoRandomOffsets(seed, 8);
  const subscores: SubscoreInput = {
    thermodynamic_stability: clamp01to100(base + offsets[0]),
    phonon_stability: clamp01to100(base + offsets[1]),
    epc_potential: clamp01to100(base + offsets[2]),
    dos_fermi_relevance: clamp01to100(base + offsets[3]),
    pressure_feasibility: clamp01to100(base + offsets[4]),
    synthesis_feasibility: clamp01to100(base + offsets[5]),
    novelty: clamp01to100(base + offsets[6]),
    validation_readiness: clamp01to100(base + offsets[7]),
  };
  return computeXScore(subscores);
}

function pseudoRandomOffsets(seed: string, count: number): number[] {
  // Deterministic small offsets in the range [-10, +10].
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const offsets: number[] = [];
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1597334677);
    const v = ((h >>> 0) % 21) - 10;
    offsets.push(v);
  }
  return offsets;
}

export function riskFlagsFor(breakdown: XScoreBreakdown): string[] {
  const flags: string[] = [];
  if (breakdown.phonon_stability < 50)
    flags.push("Phonon instability risk: imaginary modes plausible.");
  if (breakdown.thermodynamic_stability < 50)
    flags.push("Thermodynamic instability risk: above the convex hull.");
  if (breakdown.pressure_feasibility < 40)
    flags.push("Pressure feasibility low: target pressure may be impractical.");
  if (breakdown.synthesis_feasibility < 40)
    flags.push("Synthesis feasibility low: pathway is highly speculative.");
  if (breakdown.validation_readiness < 40)
    flags.push("Validation readiness low: workflow not yet specified.");
  if (flags.length === 0) flags.push("No high-severity risk flags raised.");
  return flags;
}

export function nextValidationStep(breakdown: XScoreBreakdown): string {
  if (breakdown.thermodynamic_stability < 60) return "DFT relaxation";
  if (breakdown.phonon_stability < 60) return "DFPT phonon dispersion";
  if (breakdown.epc_potential < 60) return "EPW Eliashberg evaluation";
  if (breakdown.dos_fermi_relevance < 60) return "RPA / DOS analysis";
  return "Experimental validation planning";
}
