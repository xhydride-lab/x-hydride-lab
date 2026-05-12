import { NextResponse } from "next/server";
import { readActivity } from "@/lib/store/activityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/activity
 *
 * Returns the most recent in-memory activity events for the live feed.
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
  const events = readActivity(limit);
  return NextResponse.json(
    { events, generated_at: new Date().toISOString() },
    {
      status: 200,
      headers: {
        // Tiny edge cache so polling doesn't hammer the function.
        "Cache-Control": "public, max-age=5, s-maxage=5",
      },
    },
  );
}
