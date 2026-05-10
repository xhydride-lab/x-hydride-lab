import { NextResponse } from "next/server";
import { generateSimulationBundle } from "@/lib/ai/generateSimulation";
import type { Candidate } from "@/types";
import {
  GenerateSimulationRequestSchema,
  validateBody,
} from "@/lib/api/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate-simulation
 *
 * Body: { candidate: Candidate }
 * Response: { bundle: SimulationBundle }
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

  const parsed = validateBody(GenerateSimulationRequestSchema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, issues: parsed.issues },
      { status: 400 },
    );
  }

  const bundle = generateSimulationBundle(parsed.value.candidate as Candidate);
  return NextResponse.json({ bundle }, { status: 200 });
}
