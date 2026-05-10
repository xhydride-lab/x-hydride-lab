/**
 * Domain model for X-Hydride Lab.
 *
 * Every entity in the platform is an exploratory research artifact and must
 * be treated as such. None of the values in these types should be interpreted
 * as validated scientific claims. They are AI-generated hypotheses produced
 * by the Grok-native pipeline and require DFT, DFPT, EPW, Eliashberg, RPA,
 * and experimental validation before any claim can be made.
 */

export type CandidateStatus =
  | "Generated"
  | "Awaiting DFT"
  | "Awaiting DFPT"
  | "Awaiting EPW"
  | "Awaiting Eliashberg"
  | "Awaiting RPA"
  | "Experimental validation required";

export const CANDIDATE_STATUS_OPTIONS: CandidateStatus[] = [
  "Generated",
  "Awaiting DFT",
  "Awaiting DFPT",
  "Awaiting EPW",
  "Awaiting Eliashberg",
  "Awaiting RPA",
  "Experimental validation required",
];

export interface Candidate {
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
  status: CandidateStatus;
  created_at: string;
}

export interface XScoreBreakdown {
  thermodynamic_stability: number;
  phonon_stability: number;
  epc_potential: number;
  dos_fermi_relevance: number;
  pressure_feasibility: number;
  synthesis_feasibility: number;
  novelty: number;
  validation_readiness: number;
  overall: number;
}

export interface ResearchReport {
  report_id: string;
  candidate_id: string;
  title: string;
  abstract: string;
  introduction: string;
  candidate_structure: string;
  computational_methods: string;
  expected_electronic_properties: string;
  expected_phonon_epc_behavior: string;
  validation_plan: string;
  experimental_pathway: string;
  limitations: string;
  conclusion: string;
  generated_at: string;
}

export type SimulationFileType =
  | "cif"
  | "qe_input"
  | "gpaw_ase"
  | "phonon"
  | "epw"
  | "convergence";

export interface SimulationFile {
  file_id: string;
  candidate_id: string;
  type: SimulationFileType;
  filename: string;
  language: "ini" | "python" | "yaml" | "text";
  contents: string;
  created_at: string;
}

export interface SimulationBundle {
  candidate_id: string;
  files: SimulationFile[];
  generated_at: string;
}

export interface AuditLog {
  audit_id: string;
  candidate_id: string;
  timestamp: string;
  input_hash: string;
  output_hash: string;
  report_hash: string;
  simulation_hash: string;
  model_provider: string;
  model_name: string;
  version: string;
  chain_status: "off-chain" | "pending" | "anchored";
  tx_hash: string | null;
}

/** Generation request submitted to the candidate generator form. */
export interface CandidateGenerationRequest {
  research_objective: string;
  chemical_family: string;
  target_pressure_range: string;
  desired_tc_range: string;
  stability_preference: string;
  synthesis_difficulty_tolerance: string;
  number_of_candidates: number;
  notes?: string;
}

export interface ProviderInfo {
  provider: string;
  model: string;
  demo_mode: boolean;
}

export interface CandidateGenerationResponse {
  candidates: Candidate[];
  provider: ProviderInfo;
  warnings: string[];
}
