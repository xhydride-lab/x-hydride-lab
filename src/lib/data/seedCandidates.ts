import type {
  Candidate,
  CandidateGenerationRequest,
  CandidateStatus,
} from "@/types";
import { HYDRIDE_DOMAIN_CHECKLIST } from "@/lib/data/domainChecklist";

/**
 * Demo seed candidates used when XAI_API_KEY is not configured.
 *
 * Every entry is intentionally cautious: stability and synthesis risk are
 * called out, no candidate is described as a confirmed superconductor, and
 * every rationale is framed as a hypothesis requiring validation.
 */

interface Seed {
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
}

const SEEDS: Seed[] = [
  {
    candidate_id: "xh-bch-layered",
    name: "B-C-H layered hydride candidate",
    chemical_family: "Boron-carbon-hydrogen layered framework",
    proposed_composition: "B2C2H8 (illustrative stoichiometry)",
    structural_hypothesis:
      "Alternating boron-carbon honeycomb layers with hydrogen interstitials forming covalent B-H and C-H bonds.",
    target_pressure_range: "20–60 GPa",
    expected_epc_potential:
      "Hydrogen-derived high-frequency modes may couple to B-C π* states; coupling strength is unconfirmed.",
    expected_tc_rationale:
      "Light-mass H modes plus a metallic B-C scaffold could yield moderate λ; Tc is purely hypothetical and contingent on phonon stability.",
    stability_risk:
      "Layered framework may decompose into BC graphite-like sheets and H2 at ambient pressure.",
    phonon_stability_risk:
      "Interstitial H sites may produce imaginary modes if displacement landscape is anharmonic.",
    synthesis_pathway:
      "High-pressure compression of borocarbide precursors in a hydrogen atmosphere within a diamond anvil cell.",
    validation_steps: [
      "DFT relaxation",
      "DFPT phonon dispersion",
      "EPW Eliashberg analysis",
      "RPA dielectric screening",
      "Experimental DAC synthesis attempt",
    ],
    x_score: 72,
    limitations: [
      "Composition is illustrative only.",
      "No experimental synthesis has been attempted.",
      "Stability above 5 GPa is unverified.",
    ],
    status: "Awaiting DFT",
  },
  {
    candidate_id: "xh-mgbh-low-pressure",
    name: "Mg-B-H low-pressure hydride candidate",
    chemical_family: "Mg-B-H ternary hydride",
    proposed_composition: "MgB2H4 (proposed)",
    structural_hypothesis:
      "Boron sublattice retains a graphite-like motif; magnesium occupies interlayer sites with hydrogen forming bridging H-H pairs.",
    target_pressure_range: "10–30 GPa",
    expected_epc_potential:
      "B-derived σ-bands plus hydrogen vibrations could yield moderate to strong coupling, but quantitative estimates require DFPT.",
    expected_tc_rationale:
      "Inspired by MgB2 anisotropic coupling; hydrogen incorporation hypothesized to enhance phonon spectrum without destabilizing the lattice.",
    stability_risk:
      "Possible decomposition into MgH2 and amorphous boron domains.",
    phonon_stability_risk:
      "Low-pressure stability of bridging H-H pairs is uncertain and may show soft modes.",
    synthesis_pathway:
      "Hydrogenation of MgB2 powder in a hydrogen atmosphere at moderate pressure with subsequent quenching.",
    validation_steps: [
      "DFT relaxation",
      "DFPT phonon dispersion",
      "EPW anisotropic Eliashberg",
      "Experimental quench-recovery attempt",
    ],
    x_score: 68,
    limitations: [
      "Phase boundary with MgH2 + B is not characterized.",
      "Hydrogen content is speculative.",
    ],
    status: "Generated",
  },
  {
    candidate_id: "xh-cach-intercalated",
    name: "Ca-C-H intercalated hydride candidate",
    chemical_family: "Ca-C-H intercalated framework",
    proposed_composition: "CaC6H6 (illustrative)",
    structural_hypothesis:
      "Graphite-like carbon sheets intercalated by Ca with hydrogen insertion at out-of-plane sites.",
    target_pressure_range: "5–25 GPa",
    expected_epc_potential:
      "Inherits CaC6 baseline coupling; hydrogen modes could augment the spectrum if integrated coherently.",
    expected_tc_rationale:
      "Hypothesis: hydrogen interstitials enhance EPC near the K point. Requires DFPT confirmation.",
    stability_risk:
      "Hydrogen extrusion at moderate temperatures may be a problem.",
    phonon_stability_risk:
      "Interlayer H positions may show soft optical modes.",
    synthesis_pathway:
      "High-pressure hydrogenation of CaC6 starting from intercalated graphite.",
    validation_steps: [
      "DFT relaxation",
      "DFPT phonon dispersion",
      "Electronic structure with strong correlation correction",
      "Experimental hydrogenation attempt",
    ],
    x_score: 64,
    limitations: [
      "Hydrogen retention at low pressure is unverified.",
      "Effect of H on the Ca-C bonding is speculative.",
    ],
    status: "Awaiting DFPT",
  },
  {
    candidate_id: "xh-labh-reduced-pressure",
    name: "La-B-H reduced-pressure hydride candidate",
    chemical_family: "La-B-H ternary clathrate-like framework",
    proposed_composition: "LaBH8 (proposed)",
    structural_hypothesis:
      "Lanthanum-centered cage with H8 cluster and boron decoration of the cage edges.",
    target_pressure_range: "30–80 GPa",
    expected_epc_potential:
      "Cage-mode hydrogen vibrations are expected to provide a high logarithmic phonon frequency contribution.",
    expected_tc_rationale:
      "Hypothesis informed by lanthanum hydride literature; boron substitution may reduce required pressure but requires verification.",
    stability_risk:
      "Cage may collapse into binary LaH10 plus amorphous boron at decompression.",
    phonon_stability_risk:
      "Soft modes around H cage edges could appear at lower pressures.",
    synthesis_pathway:
      "Laser-heated diamond anvil cell synthesis from La, B, and ammonia borane precursors.",
    validation_steps: [
      "DFT relaxation",
      "DFPT phonon dispersion",
      "EPW + isotropic and anisotropic Eliashberg",
      "Experimental DAC synthesis with on-site spectroscopy",
    ],
    x_score: 76,
    limitations: [
      "Quantitative Tc estimates are not claimed.",
      "Pressure stability window is speculative.",
    ],
    status: "Awaiting EPW",
  },
  {
    candidate_id: "xh-graphene-confined",
    name: "Graphene-confined hydride candidate",
    chemical_family: "Graphene-confined molecular hydride",
    proposed_composition: "C-H confined system",
    structural_hypothesis:
      "Hydrogen molecules confined between bilayer graphene sheets adopt a partially ionic configuration under modest pressure.",
    target_pressure_range: "1–10 GPa",
    expected_epc_potential:
      "Confinement may push H modes into a coupled regime with graphene π-bands; the coupling strength is highly speculative.",
    expected_tc_rationale:
      "Hypothesis: hydrogen confinement modifies the phonon spectrum sufficiently to support a measurable EPC contribution. Requires direct DFPT validation.",
    stability_risk:
      "Hydrogen leakage through graphene edges and intercalation kinetics are uncertain.",
    phonon_stability_risk:
      "Confined H-H modes may be highly anharmonic.",
    synthesis_pathway:
      "Bilayer graphene exfoliated onto a substrate with hydrogen exposure under modest pressure.",
    validation_steps: [
      "DFT relaxation including van der Waals correction",
      "DFPT phonon dispersion with anharmonic correction",
      "Experimental electronic transport at low temperatures",
    ],
    x_score: 58,
    limitations: [
      "Hydrogen retention in confined geometries is speculative.",
      "EPC mechanism has not been validated computationally.",
    ],
    status: "Generated",
  },
];

/**
 * Stable epoch (ISO) used as the base timestamp for demo seed candidates.
 *
 * Demo dates must be deterministic so server-side rendering and client-side
 * hydration produce byte-identical markup (no React hydration mismatch).
 */
const SEED_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

/**
 * Merge a seed's curated validation_steps with the hydride-domain checklist
 * so demo candidates always reflect the same checklist that the candidate
 * generation prompt asks the model to honor. Order: per-seed steps first
 * (most candidate-specific), then any checklist items not already covered.
 */
function withChecklist(seedSteps: string[]): string[] {
  const seen = new Set(seedSteps.map((s) => s.toLowerCase()));
  const additions = HYDRIDE_DOMAIN_CHECKLIST.filter(
    (item) => !seen.has(item.toLowerCase()),
  );
  return [...seedSteps, ...additions];
}

export function getDemoCandidates(): Candidate[] {
  return SEEDS.map((seed, index) => ({
    ...seed,
    validation_steps: withChecklist(seed.validation_steps),
    created_at: new Date(SEED_EPOCH_MS - index * 60_000).toISOString(),
  }));
}

/**
 * Demo candidates derived for a specific generation request. The seed list
 * is filtered/expanded to honor the requested number_of_candidates and is
 * lightly customized to reflect the user's research objective.
 */
export function buildDemoCandidates(
  request: CandidateGenerationRequest,
): Candidate[] {
  const desired = Math.max(
    1,
    Math.min(SEEDS.length, request.number_of_candidates || 3),
  );
  const slice = getDemoCandidates().slice(0, desired);

  return slice.map((candidate) => ({
    ...candidate,
    target_pressure_range:
      request.target_pressure_range || candidate.target_pressure_range,
    chemical_family: candidate.chemical_family.includes(
      request.chemical_family || "",
    )
      ? candidate.chemical_family
      : `${candidate.chemical_family} — interpreted under: ${request.research_objective}`,
  }));
}
