import { NextResponse } from "next/server";
import { readActivity, type ActivityEvent } from "@/lib/store/activityLog";
import { readRecentDrops } from "@/lib/store/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/activity
 *
 * Returns the most recent activity events for the landing-page live feed.
 * Prefers Supabase when configured (durable, cross-worker) and falls back
 * to the per-worker in-memory ring buffer otherwise.
 *
 * Query params:
 *   - limit: number of events to return (default 10, max 30)
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const limit = Math.max(
    1,
    Math.min(30, Number.parseInt(rawLimit || "10", 10) || 10),
  );

  // Try Supabase first — durable across workers.
  const drops = await readRecentDrops(limit);
  if (drops.length > 0) {
    const events: ActivityEvent[] = drops.map((d) => ({
      id: d.audit_id,
      type: d.tx_hash ? "audit_anchored" : "candidate_generated",
      timestamp: d.timestamp,
      candidate_id: d.candidate_id,
      candidate_name: d.candidate_name,
      x_score: d.x_score,
      chemical_family: d.chemical_family,
      hash: d.output_hash,
      tx_signature: d.tx_hash ?? undefined,
    }));
    return NextResponse.json(
      { events, source: "supabase", generated_at: new Date().toISOString() },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  // Fallback: in-memory ring buffer (per-worker, may be empty after cold start).
  const events = readActivity(limit);
  return NextResponse.json(
    { events, source: "memory", generated_at: new Date().toISOString() },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
