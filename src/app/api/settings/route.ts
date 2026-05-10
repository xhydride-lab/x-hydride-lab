import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 *
 * Returns a sanitized view of the platform's configuration. API keys are
 * NEVER returned — only booleans indicating whether they are configured.
 */
export async function GET(): Promise<Response> {
  const apiKeyConfigured = Boolean(process.env.XAI_API_KEY);

  return NextResponse.json({
    provider: {
      provider: "xAI Grok",
      model: process.env.XAI_MODEL || "grok-4.3",
      api_key_configured: apiKeyConfigured,
      base_url: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
    },
    supabase: {
      url_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      anon_key_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      service_role_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    demo_mode: !apiKeyConfigured,
    audit_export: {
      json: true,
      markdown: true,
      commit_note: true,
    },
  });
}
