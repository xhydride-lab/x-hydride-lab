import { NextResponse } from "next/server";
import { generateHydrideCandidates } from "@/lib/ai/generateHydrideCandidates";
import {
  CandidateGenerationRequestSchema,
  validateBody,
} from "@/lib/api/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate-candidates
 *
 * Body: CandidateGenerationRequest
 * Response: CandidateGenerationResponse
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = validateBody(CandidateGenerationRequestSchema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, issues: parsed.issues },
      { status: 400 },
    );
  }

  try {
    const result = await generateHydrideCandidates(parsed.value);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Generation failed: ${message}` },
      { status: 500 },
    );
  }
}
