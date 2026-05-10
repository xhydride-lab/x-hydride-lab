"use client";

import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import { CandidateTable } from "@/components/CandidateTable";
import { LoadingState } from "@/components/LoadingState";
import { ResearchPanel } from "@/components/ResearchPanel";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import { addCandidates, useLabState } from "@/lib/store/labStore";
import type {
  CandidateGenerationRequest,
  CandidateGenerationResponse,
} from "@/types";

const RESEARCH_OBJECTIVES = [
  "Ambient-pressure hydride candidate",
  "Low-pressure hydride superconductor",
  "Carbon-hydrogen framework",
  "Boron-carbon-hydrogen candidate",
  "Layered hydride system",
  "Metastable hydride structure",
];

const STABILITY_PREFERENCES = [
  "Highly stable",
  "Moderate stability",
  "Metastable acceptable",
  "Quench-recoverable preferred",
];

const SYNTHESIS_DIFFICULTIES = [
  "Conventional only",
  "Diamond anvil cell acceptable",
  "Laser-heated DAC acceptable",
  "Speculative — exploratory only",
];

const DEFAULT_REQUEST: CandidateGenerationRequest = {
  research_objective: RESEARCH_OBJECTIVES[0],
  chemical_family: "B-C-H layered hydride",
  target_pressure_range: "10–60 GPa",
  desired_tc_range: "100–250 K",
  stability_preference: STABILITY_PREFERENCES[1],
  synthesis_difficulty_tolerance: SYNTHESIS_DIFFICULTIES[1],
  number_of_candidates: 3,
  notes: "",
};

export default function CandidateGeneratorPage() {
  const state = useLabState();
  const [request, setRequest] =
    useState<CandidateGenerationRequest>(DEFAULT_REQUEST);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] =
    useState<CandidateGenerationResponse | null>(null);

  const recent = useMemo(
    () => state.candidates.slice(0, 12),
    [state.candidates],
  );

  function update<K extends keyof CandidateGenerationRequest>(
    key: K,
    value: CandidateGenerationRequest[K],
  ) {
    setRequest((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed (${response.status})`);
      }
      const data = (await response.json()) as CandidateGenerationResponse;
      setLastResponse(data);
      addCandidates(data.candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell demoMode={lastResponse?.provider.demo_mode ?? true}>
      <PageHeader
        eyebrow="02 · Candidate Generator"
        title="Submit a research request"
        description="Every field maps to constraints in the Grok-native candidate prompt. Output is constrained to a strict JSON schema and validated server-side before storage."
        actions={
          <LinkButton href="/x-score" size="sm" variant="secondary">
            Open X-Score Lab
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-12">
        {/* Request form */}
        <section>
          <SectionHeader
            index={1}
            eyebrow="Form"
            title="Research request"
            description="Lab request form. Required fields are marked. Submission runs server-side; API keys are never exposed to the browser."
            className="mb-4"
          />
          <form onSubmit={handleGenerate} className="panel divide-y divide-graphite-800">
            <FormGroup
              eyebrow="A"
              label="Objective"
              description="Highest-level intent of the research request."
            >
              <SelectField
                label="Research objective"
                value={request.research_objective}
                onChange={(v) => update("research_objective", v)}
                options={RESEARCH_OBJECTIVES}
              />
              <TextField
                label="Chemical family"
                placeholder="e.g. B-C-H, Mg-B-H"
                value={request.chemical_family}
                onChange={(v) => update("chemical_family", v)}
              />
            </FormGroup>

            <FormGroup
              eyebrow="B"
              label="Physical envelope"
              description="Pressure window and target Tc constrain the search space the model considers."
            >
              <TextField
                label="Target pressure range"
                placeholder="e.g. 20–60 GPa"
                value={request.target_pressure_range}
                onChange={(v) => update("target_pressure_range", v)}
              />
              <TextField
                label="Desired Tc range"
                placeholder="e.g. 100–250 K"
                value={request.desired_tc_range}
                onChange={(v) => update("desired_tc_range", v)}
              />
            </FormGroup>

            <FormGroup
              eyebrow="C"
              label="Tolerances"
              description="Stability and synthesis tolerances bias the model toward more or less speculative candidates."
            >
              <SelectField
                label="Stability preference"
                value={request.stability_preference}
                onChange={(v) => update("stability_preference", v)}
                options={STABILITY_PREFERENCES}
              />
              <SelectField
                label="Synthesis difficulty tolerance"
                value={request.synthesis_difficulty_tolerance}
                onChange={(v) => update("synthesis_difficulty_tolerance", v)}
                options={SYNTHESIS_DIFFICULTIES}
              />
            </FormGroup>

            <FormGroup
              eyebrow="D"
              label="Output"
              description="How many candidates to return and any additional notes for the prompt."
            >
              <NumberField
                label="Number of candidates"
                min={1}
                max={6}
                value={request.number_of_candidates}
                onChange={(v) => update("number_of_candidates", v)}
              />
              <TextAreaField
                label="Notes (optional)"
                placeholder="Optional context: existing literature, constraints, motivation."
                value={request.notes ?? ""}
                onChange={(v) => update("notes", v)}
                rows={3}
              />
            </FormGroup>

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-eyebrow text-graphite-500">
                Submission runs at /api/generate-candidates. JSON-schema constrained output.
              </p>
              <Button type="submit" loading={submitting} size="md">
                {submitting ? "Generating" : "Generate candidates"}
              </Button>
            </div>
          </form>
        </section>

        {/* Result panel */}
        <section>
          <SectionHeader
            index={2}
            eyebrow="Result"
            title="Generated candidates"
            description="Hypothesis-only output. Treat each candidate as a computational screening target rather than a confirmed superconductor."
            className="mb-3"
          />

          {submitting ? (
            <LoadingState
              label="Calling xAI Grok"
              detail="Awaiting strict JSON candidate output…"
            />
          ) : null}

          {error ? (
            <div
              role="alert"
              className="border border-red-700/40 bg-red-900/20 px-4 py-3"
            >
              <p className="text-eyebrow text-red-200">Generation failed</p>
              <p className="mt-1 text-caption text-red-100">{error}</p>
            </div>
          ) : null}

          {lastResponse ? (
            <ResultsPanel response={lastResponse} />
          ) : (
            <ResearchPanel
              eyebrow="Awaiting submission"
              title="No candidates returned yet"
              description="Submit the form to generate exploratory hydride candidates. Demo data is returned automatically when XAI_API_KEY is not configured."
            >
              <p className="text-caption text-graphite-400">
                Provider: <span className="font-mono text-graphite-200">xAI Grok</span>
                {" · "}Model: <span className="font-mono text-graphite-200">grok-4.3</span>
                {" · "}Output:{" "}
                <span className="font-mono text-graphite-200">json_schema (strict)</span>
              </p>
            </ResearchPanel>
          )}
        </section>

        {/* Recent candidates table */}
        <section>
          <SectionHeader
            index={3}
            eyebrow="Registry"
            title="Most recent candidates"
            description="Persisted to local storage for the current browser session."
            className="mb-3"
          />
          <CandidateTable candidates={recent} />
        </section>

        <ScientificDisclaimer />
      </div>
    </AppShell>
  );
}

function FormGroup({
  eyebrow,
  label,
  description,
  children,
}: {
  eyebrow: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <legend className="sr-only">{label}</legend>
      <div>
        <p className="text-eyebrow text-graphite-500">Section {eyebrow}</p>
        <p className="mt-1 text-body font-medium text-graphite-50">{label}</p>
        {description ? (
          <p className="mt-1.5 text-caption leading-relaxed text-graphite-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function ResultsPanel({
  response,
}: {
  response: CandidateGenerationResponse;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="panel-flat flex flex-wrap items-center gap-3 px-4 py-2">
        <span className="text-eyebrow">Source</span>
        <span className="font-mono text-caption text-graphite-100">
          {response.provider.provider} · {response.provider.model}
        </span>
        <span className="h-3 w-px bg-graphite-800" />
        <span className="text-eyebrow">Mode</span>
        <span
          className={
            response.provider.demo_mode
              ? "rounded-sharp border border-graphite-700 bg-graphite-900 px-2 py-0.5 text-eyebrow text-graphite-300"
              : "rounded-sharp border border-accent-700 bg-accent-900/30 px-2 py-0.5 text-eyebrow text-accent-200"
          }
        >
          {response.provider.demo_mode ? "Demo (fallback)" : "Live"}
        </span>
        <span className="h-3 w-px bg-graphite-800" />
        <span className="text-eyebrow">Returned</span>
        <span className="font-mono text-caption text-graphite-100" data-numeric="">
          {response.candidates.length}
        </span>
      </div>

      {response.warnings.length > 0 ? (
        <ul className="border border-amber-700/40 bg-amber-900/15 px-4 py-3 text-caption text-amber-100/85">
          {response.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      ) : null}

      <CandidateTable candidates={response.candidates} caption="Returned candidates" />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-eyebrow">{label}</span>
      <input
        className="field-input focus-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-eyebrow">{label}</span>
      <input
        type="number"
        className="field-input focus-ring font-mono text-mono-tab"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v))
            onChange(Math.max(min, Math.min(max, Math.round(v))));
        }}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-eyebrow">{label}</span>
      <select
        className="field-input focus-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="md:col-span-2 flex flex-col gap-1.5">
      <span className="text-eyebrow">{label}</span>
      <textarea
        className="field-textarea focus-ring"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
