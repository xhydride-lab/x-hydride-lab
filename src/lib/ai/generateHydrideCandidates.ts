import {
  CANDIDATE_STATUS_OPTIONS,
  type Candidate,
  type CandidateGenerationRequest,
  type CandidateGenerationResponse,
  type CandidateStatus,
} from "@/types";
import { createXAIProviderFromEnv } from "@/lib/ai/providers/xai";
import {
  CANDIDATE_SYSTEM_PROMPT,
  buildCandidateUserPrompt,
} from "@/lib/ai/prompts";
import { extractJsonObject } from "@/lib/ai/jsonExtract";
import { CANDIDATE_RESPONSE_SCHEMA } from "@/lib/ai/schemas";
import { buildDemoCandidates } from "@/lib/data/seedCandidates";

/**
 * Top-level entry point for generating hydride candidates.
 *
 * Flow:
 * 1. Resolve the xAI Grok provider from environment.
 * 2. If unavailable (no API key) return high-quality demo candidates with
 *    `demo_mode: true` so the UI can flag the result.
 * 3. Otherwise call the provider, parse strict JSON output, validate every
 *    candidate object, and fill missing optional fields safely.
 * 4. If the provider call or parsing fails for any reason, fall back to
 *    demo data and surface a user-facing warning.
 */
export async function generateHydrideCandidates(
  request: CandidateGenerationRequest,
): Promise<CandidateGenerationResponse> {
  const provider = createXAIProviderFromEnv();
  const warnings: string[] = [];

  if (!provider.available) {
    return {
      candidates: buildDemoCandidates(request),
      provider: {
        provider: provider.name,
        model: provider.model,
        demo_mode: true,
      },
      warnings: [
        "XAI_API_KEY is not configured. Returning demo candidates. Configure XAI_API_KEY in .env.local to use Grok-native generation.",
      ],
    };
  }

  try {
    const completion = await provider.chat({
      model: provider.model,
      messages: [
        { role: "system", content: CANDIDATE_SYSTEM_PROMPT },
        { role: "user", content: buildCandidateUserPrompt(request) },
      ],
      temperature: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: CANDIDATE_RESPONSE_SCHEMA,
      },
      max_tokens: 4096,
    });

    const parsed = extractJsonObject(completion.content);
    const candidates = parseCandidateList(parsed, request);

    if (candidates.length === 0) {
      warnings.push(
        "Model response did not contain any valid candidates. Showing demo candidates instead.",
      );
      return {
        candidates: buildDemoCandidates(request),
        provider: {
          provider: provider.name,
          model: provider.model,
          demo_mode: true,
        },
        warnings,
      };
    }

    return {
      candidates,
      provider: {
        provider: provider.name,
        model: provider.model,
        demo_mode: false,
      },
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(
      `Provider call failed (${message}). Showing demo candidates as a fallback.`,
    );
    return {
      candidates: buildDemoCandidates(request),
      provider: {
        provider: provider.name,
        model: provider.model,
        demo_mode: true,
      },
      warnings,
    };
  }
}

function parseCandidateList(
  payload: unknown,
  request: CandidateGenerationRequest,
): Candidate[] {
  const root = payload as Record<string, unknown> | null;
  if (!root || typeof root !== "object") return [];

  const rawList = Array.isArray(root.candidates)
    ? (root.candidates as unknown[])
    : Array.isArray(root)
      ? (root as unknown[])
      : [];

  const desired = Math.max(1, Math.min(10, request.number_of_candidates || 1));
  const out: Candidate[] = [];

  for (const raw of rawList.slice(0, desired)) {
    const candidate = normalizeCandidate(raw);
    if (candidate) out.push(candidate);
  }

  return out;
}

function normalizeCandidate(raw: unknown): Candidate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const name = asString(r.name);
  if (!name) return null;

  const candidate_id = asString(r.candidate_id) || generateId(name);

  return {
    candidate_id,
    name,
    chemical_family:
      asString(r.chemical_family) || "Unspecified hydride framework",
    proposed_composition:
      asString(r.proposed_composition) || "Composition to be determined",
    structural_hypothesis:
      asString(r.structural_hypothesis) || "Structural hypothesis pending.",
    target_pressure_range:
      asString(r.target_pressure_range) || "Pressure range pending.",
    expected_epc_potential:
      asString(r.expected_epc_potential) || "EPC potential to be evaluated.",
    expected_tc_rationale:
      asString(r.expected_tc_rationale) || "Tc rationale pending evaluation.",
    stability_risk: asString(r.stability_risk) || "Stability risk unevaluated.",
    phonon_stability_risk:
      asString(r.phonon_stability_risk) ||
      "Phonon stability risk unevaluated.",
    synthesis_pathway:
      asString(r.synthesis_pathway) || "Synthesis pathway pending.",
    validation_steps: asStringArray(r.validation_steps, [
      "DFT relaxation",
      "DFPT phonon calculation",
      "EPW Eliashberg analysis",
    ]),
    x_score: clamp(asNumber(r.x_score), 0, 100, 50),
    limitations: asStringArray(r.limitations, [
      "AI-generated hypothesis only.",
      "No experimental validation has been performed.",
    ]),
    status: asStatus(r.status),
    created_at: new Date().toISOString(),
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry): entry is string => entry.length > 0);
  return cleaned.length > 0 ? cleaned : fallback;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function asStatus(value: unknown): CandidateStatus {
  const s = asString(value);
  return (CANDIDATE_STATUS_OPTIONS as string[]).includes(s)
    ? (s as CandidateStatus)
    : "Generated";
}

function generateId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  const stamp = Math.random().toString(36).slice(2, 8);
  return `xh-${slug || "candidate"}-${stamp}`;
}
