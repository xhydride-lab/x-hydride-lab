"use client";

import { useEffect, useState } from "react";
import type { ActivityEvent } from "@/lib/store/activityLog";

interface ActivityResponse {
  events: ActivityEvent[];
  generated_at: string;
}

/**
 * LatestDropCard — surfaces the most recent Hydride Drop on the landing
 * hero. Polls `/api/activity` every 30s so the card refreshes when the
 * daily cron writes a new drop or when an operator triggers one manually.
 *
 * Rendered as a graphite panel with eyebrow / candidate name / metadata
 * row / Solscan link when the audit was anchored on Solana.
 */
export function LatestDropCard() {
  const [latest, setLatest] = useState<ActivityEvent | null>(null);
  const [counts, setCounts] = useState<{ total: number; anchored: number }>({
    total: 0,
    anchored: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        const res = await fetch("/api/activity?limit=30", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ActivityResponse;
        if (aborted) return;
        // Prefer the most recent anchored drop; fall back to most recent
        // candidate event.
        const anchored = data.events.find((e) => e.type === "audit_anchored");
        const generated = data.events.find(
          (e) => e.type === "candidate_generated",
        );
        setLatest(anchored ?? generated ?? null);
        const anchoredCount = data.events.filter(
          (e) => e.type === "audit_anchored",
        ).length;
        const generatedCount = data.events.filter(
          (e) => e.type === "candidate_generated",
        ).length;
        setCounts({
          total: generatedCount,
          anchored: anchoredCount,
        });
      } catch {
        // Silent — the card just hides until next tick.
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      aborted = true;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="panel flex flex-col gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-eyebrow text-graphite-400">Latest Hydride Drop</p>
        <p className="text-[13px] text-graphite-500">Loading recent activity…</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="panel flex flex-col gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-eyebrow text-graphite-400">Latest Hydride Drop</p>
        <p className="text-[13px] text-graphite-500">
          Daily drop has not started yet. New candidates appear here as the
          cron runs (13:00 UTC) or when an operator triggers one manually.
        </p>
      </div>
    );
  }

  const anchored = latest.type === "audit_anchored" && latest.tx_signature;
  const explorerUrl = latest.tx_signature
    ? `https://solscan.io/tx/${latest.tx_signature}`
    : null;
  const ts = new Date(latest.timestamp);
  const rel = formatRelative(ts);

  return (
    <div className="panel relative flex flex-col gap-4 overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
      <span
        aria-hidden
        className="absolute right-5 top-5 inline-flex h-2.5 w-2.5"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent-500/60" />
        <span className="absolute inset-0 rounded-full bg-accent-500" />
      </span>

      <div className="flex flex-col gap-1">
        <p className="text-eyebrow text-graphite-300">
          Latest Hydride Drop {anchored ? "· anchored on Solana" : ""}
        </p>
        <p className="text-[18px] font-semibold tracking-tight text-graphite-50">
          {latest.candidate_name ?? latest.candidate_id ?? "New candidate"}
        </p>
        {latest.chemical_family ? (
          <p className="text-caption text-graphite-400">
            {latest.chemical_family}
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-caption">
        <Metric label="X-Score" value={latest.x_score ?? "—"} numeric />
        <Metric label="Anchored" value={counts.anchored} numeric />
        <Metric label="Generated" value={counts.total} numeric />
      </dl>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] text-graphite-500">
        <span>{rel}</span>
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-md text-accent-300 hover:text-accent-200"
          >
            View on Solscan ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  numeric,
}: {
  label: string;
  value: string | number;
  numeric?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10.5px] uppercase tracking-[0.14em] text-graphite-500">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "font-mono text-mono-tab text-[15px] font-semibold text-graphite-50"
            : "text-[15px] font-semibold text-graphite-50"
        }
        data-numeric={numeric ? "" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
