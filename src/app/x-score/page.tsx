"use client";

import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { LinkButton } from "@/components/Button";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import { XScoreBadge } from "@/components/XScoreBadge";
import { XScoreRadar } from "@/components/XScoreRadar";
import {
  X_SCORE_CATEGORIES,
  X_SCORE_WEIGHTS,
  type XScoreCategory,
  computeXScore,
  estimateBreakdownFromHeadline,
  nextValidationStep,
  riskFlagsFor,
} from "@/lib/scoring/xScore";
import { useLabState } from "@/lib/store/labStore";
import type { XScoreBreakdown } from "@/types";

const DEFAULT_SUBSCORES: Record<XScoreCategory, number> = {
  thermodynamic_stability: 70,
  phonon_stability: 65,
  epc_potential: 75,
  dos_fermi_relevance: 60,
  pressure_feasibility: 55,
  synthesis_feasibility: 50,
  novelty: 70,
  validation_readiness: 65,
};

export default function XScorePage() {
  const state = useLabState();
  const [selectedId, setSelectedId] = useState<string>("");
  const [subscores, setSubscores] =
    useState<Record<XScoreCategory, number>>(DEFAULT_SUBSCORES);

  const breakdown = useMemo<XScoreBreakdown>(
    () => computeXScore(subscores),
    [subscores],
  );
  const flags = useMemo(() => riskFlagsFor(breakdown), [breakdown]);
  const nextStep = useMemo(() => nextValidationStep(breakdown), [breakdown]);

  function loadCandidate(id: string) {
    setSelectedId(id);
    const candidate = state.candidates.find((c) => c.candidate_id === id);
    if (!candidate) return;
    const inferred = estimateBreakdownFromHeadline(
      candidate.x_score,
      candidate.candidate_id,
    );
    setSubscores({
      thermodynamic_stability: inferred.thermodynamic_stability,
      phonon_stability: inferred.phonon_stability,
      epc_potential: inferred.epc_potential,
      dos_fermi_relevance: inferred.dos_fermi_relevance,
      pressure_feasibility: inferred.pressure_feasibility,
      synthesis_feasibility: inferred.synthesis_feasibility,
      novelty: inferred.novelty,
      validation_readiness: inferred.validation_readiness,
    });
  }

  return (
    <AppShell demoMode>
      <PageHeader
        eyebrow="03 · X-Score Lab"
        title="Scoring methodology"
        description="The X-Score is a weighted aggregation across eight subscores. Subscores are independent, on a 0–100 scale, and reflect physical, computational, and feasibility considerations. Adjust subscores to interrogate how candidate ranking changes."
        actions={
          <LinkButton href="/candidates" size="sm" variant="secondary">
            Generate candidates
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-12">
        {/* Methodology table */}
        <section>
          <SectionHeader
            index={1}
            eyebrow="Methodology"
            title="Subscore definitions & weights"
            description="Weights sum to 1.00. The overall X-Score is the weighted mean rounded to the nearest integer."
            className="mb-3"
          />
          <div className="panel overflow-hidden">
            <div className="hairline-b grid grid-cols-12 px-5 py-2.5 text-eyebrow">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Subscore</span>
              <span className="col-span-1 text-right">Weight</span>
              <span className="col-span-5">Description</span>
              <span className="col-span-1 text-right">Value</span>
            </div>
            <ol>
              {X_SCORE_CATEGORIES.map((cat, i) => (
                <li
                  key={cat.key}
                  className="ledger-row grid grid-cols-12 items-baseline gap-2 px-5 py-3"
                >
                  <span
                    className="col-span-1 font-mono text-mono-tab text-eyebrow text-graphite-500"
                    data-numeric=""
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-4 text-body text-graphite-100">
                    {cat.label}
                  </span>
                  <span
                    className="col-span-1 text-right font-mono text-mono-tab text-body text-graphite-200"
                    data-numeric=""
                  >
                    {Math.round(X_SCORE_WEIGHTS[cat.key] * 100)}%
                  </span>
                  <span className="col-span-5 text-caption leading-relaxed text-graphite-400">
                    {cat.description}
                  </span>
                  <span
                    className="col-span-1 text-right font-mono text-mono-tab text-body text-graphite-50"
                    data-numeric=""
                  >
                    {subscores[cat.key]}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Interactive scoring panel */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeader
              index={2}
              eyebrow="Adjust"
              title="Interactive scoring panel"
              description="Move sliders to interrogate the scoring surface. Optional: load subscores derived from an existing candidate's headline X-Score."
              className="mb-3"
            />
            <div className="panel">
              <div className="hairline-b flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="text-eyebrow">Load from candidate</span>
                <select
                  className="field-input focus-ring h-8 w-full max-w-sm"
                  value={selectedId}
                  onChange={(e) => loadCandidate(e.target.value)}
                >
                  <option value="">— pick a candidate —</option>
                  {state.candidates.map((c) => (
                    <option key={c.candidate_id} value={c.candidate_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="divide-y divide-graphite-800">
                {X_SCORE_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-56 shrink-0">
                      <p className="text-body text-graphite-100">{cat.label}</p>
                      <p className="text-eyebrow normal-case tracking-normal text-graphite-500">
                        Weight {Math.round(X_SCORE_WEIGHTS[cat.key] * 100)}%
                      </p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={subscores[cat.key]}
                      onChange={(e) =>
                        setSubscores((prev) => ({
                          ...prev,
                          [cat.key]: Number(e.target.value),
                        }))
                      }
                      className="flex-1 cursor-pointer accent-accent-500"
                    />
                    <span
                      className="w-12 text-right font-mono text-mono-tab text-body text-graphite-50"
                      data-numeric=""
                    >
                      {subscores[cat.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              index={3}
              eyebrow="Result"
              title="Aggregate"
              actions={<XScoreBadge score={breakdown.overall} size="md" />}
              className="mb-3"
            />
            <div className="panel flex flex-col gap-4 px-5 py-5">
              <div className="flex items-baseline gap-3">
                <span className="text-eyebrow">Overall X-Score</span>
                <span
                  className="font-mono text-mono-tab text-display text-graphite-50"
                  data-numeric=""
                >
                  {breakdown.overall}
                </span>
                <span className="text-eyebrow text-graphite-500">/ 100</span>
              </div>
              <div>
                <p className="text-eyebrow">Recommended next gate</p>
                <p className="mt-1 text-body text-graphite-100">{nextStep}</p>
              </div>
              <XScoreRadar breakdown={breakdown} size={300} />
            </div>
          </div>
        </section>

        {/* Risk flags */}
        <section>
          <SectionHeader
            index={4}
            eyebrow="Risks"
            title="Risk flag panel"
            description="Conservative, threshold-based advisories. Flags are not scientific validation."
            className="mb-3"
          />
          <ul className="panel divide-y divide-graphite-800">
            {flags.map((f, i) => (
              <li
                key={i}
                className="flex items-baseline gap-4 px-5 py-3 text-body text-graphite-100"
              >
                <span
                  className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                  data-numeric=""
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <ScientificDisclaimer variant="banner" />
      </div>
    </AppShell>
  );
}
