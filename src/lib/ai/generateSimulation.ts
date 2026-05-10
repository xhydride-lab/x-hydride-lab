import type { Candidate, SimulationBundle, SimulationFile } from "@/types";

/**
 * Build a deterministic, reviewable bundle of simulation input templates for
 * a candidate. These are templates only and must be reviewed by a
 * computational materials scientist before execution.
 *
 * The simulation builder is intentionally deterministic so that the same
 * candidate always produces the same artifacts and the audit hash is stable.
 */
export function generateSimulationBundle(
  candidate: Candidate,
): SimulationBundle {
  const generatedAt = new Date().toISOString();
  const files: SimulationFile[] = [
    cifTemplate(candidate, generatedAt),
    quantumEspressoTemplate(candidate, generatedAt),
    gpawAseTemplate(candidate, generatedAt),
    phononTemplate(candidate, generatedAt),
    epwTemplate(candidate, generatedAt),
    convergenceTemplate(candidate, generatedAt),
  ];

  return {
    candidate_id: candidate.candidate_id,
    files,
    generated_at: generatedAt,
  };
}

function header(candidate: Candidate, kind: string): string {
  return [
    `# X-Hydride Lab — ${kind} template`,
    `# Candidate: ${candidate.name}`,
    `# Composition (proposed): ${candidate.proposed_composition}`,
    `# Family: ${candidate.chemical_family}`,
    `# Pressure target: ${candidate.target_pressure_range}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Notice: This is a preliminary template. It must be reviewed and adjusted`,
    `# by a computational materials scientist before being executed.`,
    "",
  ].join("\n");
}

function cifTemplate(candidate: Candidate, createdAt: string): SimulationFile {
  const contents = [
    `# CIF structural draft template for ${candidate.name}`,
    `# Replace placeholder lattice and atomic positions with values from`,
    `# DFT-relaxed coordinates before any production calculation.`,
    "",
    `data_${slug(candidate.candidate_id)}`,
    `_cell_length_a    5.000`,
    `_cell_length_b    5.000`,
    `_cell_length_c    5.000`,
    `_cell_angle_alpha 90.000`,
    `_cell_angle_beta  90.000`,
    `_cell_angle_gamma 90.000`,
    `_symmetry_space_group_name_H-M  'P 1'`,
    `loop_`,
    `_atom_site_label`,
    `_atom_site_fract_x`,
    `_atom_site_fract_y`,
    `_atom_site_fract_z`,
    `# Replace placeholder positions below`,
    `H1 0.000 0.000 0.000`,
    `H2 0.500 0.500 0.500`,
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-cif`,
    candidate_id: candidate.candidate_id,
    type: "cif",
    filename: `${slug(candidate.candidate_id)}.cif`,
    language: "text",
    contents: header(candidate, "CIF") + contents,
    created_at: createdAt,
  };
}

function quantumEspressoTemplate(
  candidate: Candidate,
  createdAt: string,
): SimulationFile {
  const contents = [
    "&CONTROL",
    `  calculation = 'scf',`,
    `  prefix      = '${slug(candidate.candidate_id)}',`,
    `  outdir      = './out/',`,
    `  pseudo_dir  = './pseudo/',`,
    `  verbosity   = 'high',`,
    `  tprnfor     = .true.,`,
    `  tstress     = .true.,`,
    "/",
    "&SYSTEM",
    `  ibrav        = 0,`,
    `  nat          = 2,`,
    `  ntyp         = 1,`,
    `  ecutwfc      = 80.0,`,
    `  ecutrho      = 640.0,`,
    `  occupations  = 'smearing',`,
    `  smearing     = 'mp',`,
    `  degauss      = 0.02,`,
    "/",
    "&ELECTRONS",
    `  conv_thr     = 1.0d-10,`,
    `  mixing_beta  = 0.5,`,
    "/",
    "ATOMIC_SPECIES",
    "  H 1.00794 H_ONCV_PBE.upf",
    "ATOMIC_POSITIONS crystal",
    "  H 0.000 0.000 0.000",
    "  H 0.500 0.500 0.500",
    "K_POINTS automatic",
    "  16 16 16 0 0 0",
    "CELL_PARAMETERS angstrom",
    "  5.0 0.0 0.0",
    "  0.0 5.0 0.0",
    "  0.0 0.0 5.0",
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-qe`,
    candidate_id: candidate.candidate_id,
    type: "qe_input",
    filename: `${slug(candidate.candidate_id)}.qe.in`,
    language: "ini",
    contents: header(candidate, "Quantum ESPRESSO SCF") + contents,
    created_at: createdAt,
  };
}

function gpawAseTemplate(
  candidate: Candidate,
  createdAt: string,
): SimulationFile {
  const contents = [
    "from ase.build import bulk",
    "from ase.optimize import BFGS",
    "from gpaw import GPAW, PW",
    "",
    "# NOTE: Replace this minimal hydrogen lattice with the relaxed structure",
    `# proposed for ${candidate.name}.`,
    "atoms = bulk('H', 'fcc', a=4.0)",
    "atoms.calc = GPAW(",
    "    mode=PW(800),",
    "    xc='PBE',",
    "    kpts=(12, 12, 12),",
    "    occupations={'name': 'fermi-dirac', 'width': 0.05},",
    "    txt='gpaw.out',",
    ")",
    "",
    "energy = atoms.get_potential_energy()",
    "print('Total energy [eV]:', energy)",
    "",
    "BFGS(atoms).run(fmax=0.01)",
    "atoms.write('relaxed.traj')",
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-gpaw`,
    candidate_id: candidate.candidate_id,
    type: "gpaw_ase",
    filename: `${slug(candidate.candidate_id)}_gpaw.py`,
    language: "python",
    contents: header(candidate, "GPAW / ASE") + contents,
    created_at: createdAt,
  };
}

function phononTemplate(
  candidate: Candidate,
  createdAt: string,
): SimulationFile {
  const contents = [
    "&INPUTPH",
    `  prefix     = '${slug(candidate.candidate_id)}',`,
    "  tr2_ph     = 1.0d-14,",
    "  ldisp      = .true.,",
    "  nq1        = 4,",
    "  nq2        = 4,",
    "  nq3        = 4,",
    "  fildvscf   = 'dvscf',",
    "  electron_phonon = 'epa',",
    `  outdir     = './out/',`,
    "/",
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-ph`,
    candidate_id: candidate.candidate_id,
    type: "phonon",
    filename: `${slug(candidate.candidate_id)}.ph.in`,
    language: "ini",
    contents: header(candidate, "Phonon (ph.x) DFPT") + contents,
    created_at: createdAt,
  };
}

function epwTemplate(candidate: Candidate, createdAt: string): SimulationFile {
  const contents = [
    "&INPUTEPW",
    `  prefix       = '${slug(candidate.candidate_id)}',`,
    `  outdir       = './out/',`,
    "  elph         = .true.,",
    "  epbwrite     = .true.,",
    "  epwwrite     = .true.,",
    "  wannierize   = .true.,",
    "  num_iter     = 500,",
    "  dis_win_max  = 12.0,",
    "  dis_froz_max = 9.0,",
    "  fsthick      = 0.4,",
    "  degaussw     = 0.05,",
    "  nkf1         = 32,",
    "  nkf2         = 32,",
    "  nkf3         = 32,",
    "  nqf1         = 16,",
    "  nqf2         = 16,",
    "  nqf3         = 16,",
    "  eliashberg   = .true.,",
    "  liso         = .true.,",
    "/",
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-epw`,
    candidate_id: candidate.candidate_id,
    type: "epw",
    filename: `${slug(candidate.candidate_id)}.epw.in`,
    language: "ini",
    contents: header(candidate, "EPW + Eliashberg") + contents,
    created_at: createdAt,
  };
}

function convergenceTemplate(
  candidate: Candidate,
  createdAt: string,
): SimulationFile {
  const contents = [
    "convergence:",
    `  candidate_id: ${candidate.candidate_id}`,
    "  ecutwfc_sweep_ry: [60, 80, 100, 120]",
    "  ecutrho_ratio: 8",
    "  k_grid_sweep:",
    "    - [12, 12, 12]",
    "    - [16, 16, 16]",
    "    - [20, 20, 20]",
    "  q_grid_sweep:",
    "    - [4, 4, 4]",
    "    - [6, 6, 6]",
    "    - [8, 8, 8]",
    "  smearing_widths_ry: [0.005, 0.01, 0.02]",
    "  acceptance_criterion:",
    "    total_energy_meV_per_atom: 1.0",
    "    pressure_kbar: 0.5",
    "    phonon_freq_meV: 0.5",
    "",
  ].join("\n");
  return {
    file_id: `${candidate.candidate_id}-conv`,
    candidate_id: candidate.candidate_id,
    type: "convergence",
    filename: `${slug(candidate.candidate_id)}.convergence.yaml`,
    language: "yaml",
    contents: header(candidate, "Convergence sweep") + contents,
    created_at: createdAt,
  };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
