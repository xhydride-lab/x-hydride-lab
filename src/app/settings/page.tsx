"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button, LinkButton } from "@/components/Button";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { SectionHeader } from "@/components/SectionHeader";
import { clearAll } from "@/lib/store/labStore";

interface ProviderStatus {
  provider: string;
  model: string;
  api_key_configured: boolean;
  base_url: string;
}

interface SupabaseStatus {
  url_configured: boolean;
  anon_key_configured: boolean;
  service_role_configured: boolean;
}

interface SettingsResponse {
  provider: ProviderStatus;
  supabase: SupabaseStatus;
  demo_mode: boolean;
  audit_export: { json: boolean; markdown: boolean; commit_note: boolean };
}

export default function SettingsPage() {
  const [status, setStatus] = useState<SettingsResponse | null>(null);
  const [demoOverride, setDemoOverride] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return (await response.json()) as SettingsResponse;
      })
      .then((data) => {
        setStatus(data);
        setDemoOverride(data.demo_mode);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : String(err)),
      );
  }, []);

  return (
    <AppShell demoMode={demoOverride}>
      <PageHeader
        eyebrow="07 · Settings"
        title="Configuration"
        description="Read-only view of the platform's configuration. Mutating settings always requires editing your local .env file. API keys are never returned by the API — only booleans indicating whether they are configured."
        actions={
          <LinkButton href="/overview" size="sm" variant="secondary">
            Back to Overview
          </LinkButton>
        }
      />

      {error ? (
        <div className="mb-6 border border-red-700/40 bg-red-900/20 px-4 py-3 text-caption text-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-12">
        <section>
          <SectionHeader
            index={1}
            eyebrow="Provider"
            title="AI provider"
            description="Default provider is xAI Grok. Keys are read server-side only and never exposed to the browser."
            className="mb-3"
          />
          <ConfigTable
            rows={[
              ["Provider", status?.provider.provider ?? "xAI Grok", "mono"],
              ["Model", status?.provider.model ?? "grok-4.3", "mono"],
              ["Base URL", status?.provider.base_url ?? "https://api.x.ai/v1", "mono"],
              [
                "XAI_API_KEY",
                status?.provider.api_key_configured
                  ? "Configured"
                  : "Not configured",
                status?.provider.api_key_configured ? "ok" : "warn",
              ],
              ["Response format", "json_schema (strict)", "mono"],
              ["Audit hash", "SHA-256 (node:crypto)", "mono"],
            ]}
          />
        </section>

        <section>
          <SectionHeader
            index={2}
            eyebrow="Backend"
            title="Supabase"
            description="Optional. The lab runs in demo mode without it; configure these variables when you are ready to persist data."
            className="mb-3"
          />
          <ConfigTable
            rows={[
              [
                "NEXT_PUBLIC_SUPABASE_URL",
                status?.supabase.url_configured
                  ? "Configured"
                  : "Not configured",
                status?.supabase.url_configured ? "ok" : "muted",
              ],
              [
                "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                status?.supabase.anon_key_configured
                  ? "Configured"
                  : "Not configured",
                status?.supabase.anon_key_configured ? "ok" : "muted",
              ],
              [
                "SUPABASE_SERVICE_ROLE_KEY",
                status?.supabase.service_role_configured
                  ? "Configured"
                  : "Not configured",
                status?.supabase.service_role_configured ? "ok" : "muted",
              ],
            ]}
          />
        </section>

        <section>
          <SectionHeader
            index={3}
            eyebrow="Mode"
            title="Demo mode"
            description="When enabled the lab returns deterministic seed candidates and skips remote provider calls."
            className="mb-3"
          />
          <div className="panel flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-body font-medium tracking-tightish text-graphite-50">
                Demo mode
              </p>
              <p className="text-caption text-graphite-500">
                Auto-enabled when XAI_API_KEY is missing.
              </p>
            </div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={demoOverride}
                onChange={(e) => setDemoOverride(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-graphite-800 transition-colors peer-checked:bg-accent-600" />
              <span className="relative ml-0.5 block h-5 w-5 translate-x-0 rounded-full bg-graphite-100 shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>
          <p className="mt-2 text-caption text-graphite-500">
            This toggle only affects the local view (header pill). The actual
            provider state is determined by the server&apos;s environment.
          </p>
        </section>

        <section>
          <SectionHeader
            index={4}
            eyebrow="Export"
            title="Audit export formats"
            className="mb-3"
          />
          <ConfigTable
            rows={[
              ["JSON export", "Enabled", "ok"],
              ["Markdown export", "Enabled", "ok"],
              ["GitHub commit note", "Enabled", "ok"],
              ["On-chain anchoring", "Staged for future release", "muted"],
            ]}
          />
        </section>

        <section>
          <SectionHeader
            index={5}
            eyebrow="Local state"
            title="Reset session"
            description="Clear all locally stored candidates, reports, and audit records. This does not touch any remote data."
            className="mb-3"
          />
          <div className="panel flex flex-wrap items-center gap-3 px-5 py-4">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (typeof window === "undefined") return;
                if (
                  window.confirm(
                    "Clear all locally stored candidates, reports, and audit records?",
                  )
                ) {
                  clearAll();
                }
              }}
            >
              Clear local session
            </Button>
            <p className="text-caption text-graphite-500">
              Local storage is scoped to this browser only.
            </p>
          </div>
        </section>

        <ScientificDisclaimer />
      </div>
    </AppShell>
  );
}

type ConfigTone = "ok" | "warn" | "muted" | "mono";

function ConfigTable({ rows }: { rows: Array<[string, string, ConfigTone?]> }) {
  return (
    <dl className="panel divide-y divide-graphite-800">
      {rows.map(([k, v, tone]) => (
        <div
          key={k}
          className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-baseline"
        >
          <dt className="text-eyebrow">{k}</dt>
          <dd className="text-body">
            <ConfigValue value={v} tone={tone} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ConfigValue({ value, tone }: { value: string; tone?: ConfigTone }) {
  if (tone === "ok") {
    return (
      <span className="rounded-sharp border border-accent-700 bg-accent-900/40 px-2 py-0.5 text-eyebrow text-accent-200">
        {value}
      </span>
    );
  }
  if (tone === "warn") {
    return (
      <span className="rounded-sharp border border-amber-700/40 bg-amber-900/30 px-2 py-0.5 text-eyebrow text-amber-200">
        {value}
      </span>
    );
  }
  if (tone === "muted") {
    return (
      <span className="rounded-sharp border border-graphite-700 bg-graphite-900 px-2 py-0.5 text-eyebrow text-graphite-300">
        {value}
      </span>
    );
  }
  if (tone === "mono") {
    return (
      <span className="font-mono text-mono-tab text-graphite-100" data-numeric="">
        {value}
      </span>
    );
  }
  return <span className="text-graphite-100">{value}</span>;
}
