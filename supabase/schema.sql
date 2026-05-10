-- ===========================================================================
-- X-Hydride Lab — Supabase schema (DRAFT, NOT YET DEPLOYED)
--
-- This schema is intended for a FUTURE Supabase project. The current MVP
-- runs entirely in local/demo mode and does not connect to any Supabase
-- instance. When you decide to enable persistence:
--   1. Create a brand-new Supabase project named `x-hydride-lab`.
--   2. Apply this migration against that project.
--   3. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
--      SUPABASE_SERVICE_ROLE_KEY in `.env.local`.
--
-- Until then this file is only documentation. Do not execute it.
-- ===========================================================================

create extension if not exists "pgcrypto";

create table if not exists candidates (
  candidate_id text primary key,
  name text not null,
  chemical_family text not null,
  proposed_composition text not null,
  structural_hypothesis text not null,
  target_pressure_range text not null,
  expected_epc_potential text not null,
  expected_tc_rationale text not null,
  stability_risk text not null,
  phonon_stability_risk text not null,
  synthesis_pathway text not null,
  validation_steps jsonb not null default '[]'::jsonb,
  x_score integer not null check (x_score between 0 and 100),
  limitations jsonb not null default '[]'::jsonb,
  status text not null default 'Generated',
  created_at timestamptz not null default now()
);

create index if not exists candidates_created_at_idx
  on candidates (created_at desc);
create index if not exists candidates_x_score_idx
  on candidates (x_score desc);

create table if not exists reports (
  report_id text primary key,
  candidate_id text not null references candidates(candidate_id) on delete cascade,
  title text not null,
  abstract text not null,
  introduction text not null,
  candidate_structure text not null,
  computational_methods text not null,
  expected_electronic_properties text not null,
  expected_phonon_epc_behavior text not null,
  validation_plan text not null,
  experimental_pathway text not null,
  limitations text not null,
  conclusion text not null,
  generated_at timestamptz not null default now()
);

create index if not exists reports_candidate_idx
  on reports (candidate_id);

create table if not exists simulation_files (
  file_id text primary key,
  candidate_id text not null references candidates(candidate_id) on delete cascade,
  type text not null check (
    type in ('cif','qe_input','gpaw_ase','phonon','epw','convergence')
  ),
  filename text not null,
  language text not null,
  contents text not null,
  created_at timestamptz not null default now()
);

create index if not exists simulation_files_candidate_idx
  on simulation_files (candidate_id);

create table if not exists audit_logs (
  audit_id text primary key,
  candidate_id text not null references candidates(candidate_id) on delete cascade,
  timestamp timestamptz not null default now(),
  input_hash text not null,
  output_hash text not null,
  report_hash text not null,
  simulation_hash text not null,
  model_provider text not null,
  model_name text not null,
  version text not null,
  chain_status text not null check (
    chain_status in ('off-chain','pending','anchored')
  ) default 'off-chain',
  tx_hash text
);

create index if not exists audit_logs_candidate_idx
  on audit_logs (candidate_id);
create index if not exists audit_logs_timestamp_idx
  on audit_logs (timestamp desc);

-- Row Level Security templates (left disabled by default; enable when you
-- introduce auth):
-- alter table candidates       enable row level security;
-- alter table reports          enable row level security;
-- alter table simulation_files enable row level security;
-- alter table audit_logs       enable row level security;
