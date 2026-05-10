"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import { LoadingState } from "@/components/LoadingState";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import {
  FileWorkstation,
  type WorkstationFile,
} from "@/components/FileWorkstation";
import { HYDRIDE_DOMAIN_CHECKLIST } from "@/lib/data/domainChecklist";
import { useLabState } from "@/lib/store/labStore";
import type { SimulationBundle, SimulationFile } from "@/types";

const FILE_LABELS: Record<SimulationFile["type"], string> = {
  cif: "CIF structural draft",
  qe_input: "Quantum ESPRESSO SCF",
  gpaw_ase: "GPAW / ASE Python",
  phonon: "DFPT phonon (ph.x)",
  epw: "EPW + Eliashberg",
  convergence: "Convergence sweep",
};

const FILE_GROUP: Record<SimulationFile["type"], string> = {
  cif: "Structure",
  qe_input: "Quantum ESPRESSO",
  phonon: "Quantum ESPRESSO",
  epw: "Quantum ESPRESSO",
  gpaw_ase: "GPAW",
  convergence: "Verification",
};

export default function SimulationBuilderPage() {
  return (
    <Suspense fallback={null}>
      <SimulationBuilderInner />
    </Suspense>
  );
}

function SimulationBuilderInner() {
  const params = useSearchParams();
  const initial = params?.get("id") ?? "";
  const state = useLabState();
  const [candidateId, setCandidateId] = useState<string>(initial);
  const [bundle, setBundle] = useState<SimulationBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial && state.candidates.length > 0) {
      setCandidateId(state.candidates[0].candidate_id);
    }
  }, [initial, state.candidates]);

  const candidate = useMemo(
    () => state.candidates.find((c) => c.candidate_id === candidateId),
    [state.candidates, candidateId],
  );

  async function buildBundle() {
    if (!candidate) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      if (!response.ok)
        throw new Error(`Request failed (${response.status})`);
      const data = (await response.json()) as { bundle: SimulationBundle };
      setBundle(data.bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const files: WorkstationFile[] = useMemo(() => {
    if (!bundle) return [];
    return bundle.files.map((f) => ({
      id: f.file_id,
      filename: f.filename,
      group: FILE_GROUP[f.type],
      language: f.language,
      contents: f.contents,
      badge: FILE_LABELS[f.type].split(" ")[0],
    }));
  }, [bundle]);

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="04 · Simulation Builder"
        title="Computational lab notebook"
        description="Generate deterministic CIF, QE, GPAW/ASE, DFPT, EPW, and convergence templates for the selected candidate. Templates are starting points; relaxed coordinates and converged parameters must be supplied by you before execution."
        actions={
          <LinkButton href="/candidates" size="sm" variant="secondary">
            Back to candidates
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-12">
        <ScientificDisclaimer
          variant="banner"
          text="Generated simulation files are preliminary templates and must be reviewed by computational materials scientists before execution. They do not contain converged structures or production parameters."
        />

        {/* Selector strip */}
        <section>
          <SectionHeader
            index={1}
            eyebrow="Source"
            title="Candidate selector"
            description="Pick a candidate generated in this session. Templates are deterministic given the candidate identifier — regeneration produces byte-identical artifacts."
            className="mb-3"
          />
          <div className="panel flex flex-wrap items-center gap-3 px-5 py-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-eyebrow">Candidate</span>
              <select
                className="field-input focus-ring"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
              >
                <option value="">— pick a candidate —</option>
                {state.candidates.map((c) => (
                  <option key={c.candidate_id} value={c.candidate_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {candidate ? (
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption">
                <div>
                  <dt className="text-eyebrow">Composition</dt>
                  <dd className="font-mono text-mono-tab text-graphite-100" data-numeric="">
                    {candidate.proposed_composition}
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow">Family</dt>
                  <dd className="text-graphite-200">{candidate.chemical_family}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow">Pressure</dt>
                  <dd className="font-mono text-mono-tab text-graphite-100" data-numeric="">
                    {candidate.target_pressure_range}
                  </dd>
                </div>
              </dl>
            ) : null}
            <Button
              onClick={buildBundle}
              loading={loading}
              size="md"
              disabled={!candidate}
            >
              Generate bundle
            </Button>
          </div>
          {error ? (
            <div
              role="alert"
              className="mt-3 border border-red-700/40 bg-red-900/20 px-4 py-3 text-caption text-red-100"
            >
              {error}
            </div>
          ) : null}
        </section>

        {/* Notebook + checklist rail */}
        <section>
          <SectionHeader
            index={2}
            eyebrow="Notebook"
            title="File workstation"
            description="Files in this bundle are templates only. Headers contain explicit notices that they must be reviewed before execution."
            className="mb-3"
          />
          {loading ? (
            <LoadingState
              label="Building simulation bundle"
              detail="Assembling deterministic templates for the selected candidate…"
            />
          ) : bundle ? (
            <FileWorkstation
              files={files}
              rail={
                <div>
                  <div className="hairline-b px-4 py-2.5">
                    <p className="text-eyebrow">Validation checklist</p>
                  </div>
                  <ul className="divide-y divide-graphite-800">
                    {HYDRIDE_DOMAIN_CHECKLIST.map((item, i) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-3 px-4 py-2.5"
                      >
                        <span
                          className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                          data-numeric=""
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-caption text-graphite-200">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-graphite-800 bg-amber-900/10 px-4 py-3">
                    <p className="text-eyebrow text-amber-200">Reminder</p>
                    <p className="mt-1 text-caption leading-relaxed text-amber-100/85">
                      Templates do not include converged parameters. Verify
                      lattice, pseudopotentials, and convergence before
                      submission to a compute cluster.
                    </p>
                  </div>
                </div>
              }
            />
          ) : (
            <div className="panel px-6 py-12 text-caption text-graphite-400">
              No simulation bundle yet. Pick a candidate and click{" "}
              <span className="font-medium text-graphite-200">
                Generate bundle
              </span>{" "}
              to render six templates side-by-side with the validation
              checklist.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
