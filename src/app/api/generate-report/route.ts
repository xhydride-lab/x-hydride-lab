import { NextResponse } from "next/server";
import { generateResearchReport } from "@/lib/ai/generateReport";
import type { Candidate } from "@/types";
import {
  GenerateReportRequestSchema,
  validateBody,
} from "@/lib/api/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate-report
 *
 * Body: { candidate: Candidate }
 * Response: { report: ResearchReport, demoMode: boolean, warnings: string[] }
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

  const parsed = validateBody(GenerateReportRequestSchema, body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, issues: parsed.issues },
      { status: 400 },
    );
  }

  try {
    const result = await generateResearchReport(
      parsed.value.candidate as Candidate,
    );
    return NextResponse.json(
      {
        report: result.report,
        demoMode: result.demoMode,
        warnings: result.warnings,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Report generation failed: ${message}` },
      { status: 500 },
    );
  }
}
