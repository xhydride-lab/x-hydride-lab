"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { AuditLog, Candidate, ResearchReport } from "@/types";
import { getDemoCandidates } from "@/lib/data/seedCandidates";

/**
 * Lightweight client-side store for X-Hydride Lab.
 *
 * Persists generated candidates, reports, and audit logs to localStorage so
 * navigating between pages preserves state without requiring a backend.
 * The store is intentionally Supabase-shaped so that swapping in a real
 * Supabase client later is a one-line change inside the loaders.
 */

const STORAGE_KEY = "x-hydride-lab.state.v1";

export interface LabState {
  candidates: Candidate[];
  reports: ResearchReport[];
  audits: AuditLog[];
}

const listeners = new Set<() => void>();
let state: LabState = createInitialState();
let hydrated = false;

function createInitialState(): LabState {
  return {
    candidates: getDemoCandidates(),
    reports: [],
    audits: [],
  };
}

function notify() {
  for (const listener of listeners) listener();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function hydrate() {
  if (typeof window === "undefined") return;
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<LabState>;
    if (parsed && typeof parsed === "object") {
      state = {
        candidates: Array.isArray(parsed.candidates)
          ? parsed.candidates
          : state.candidates,
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        audits: Array.isArray(parsed.audits) ? parsed.audits : [],
      };
      notify();
    }
  } catch {
    // ignore corrupt local storage
  }
}

const SERVER_SNAPSHOT: LabState = {
  candidates: getDemoCandidates(),
  reports: [],
  audits: [],
};

export function getSnapshot(): LabState {
  return state;
}

export function getServerSnapshot(): LabState {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLabState(): LabState {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    hydrate();
  }, []);
  return value;
}

export function addCandidates(candidates: Candidate[]) {
  if (candidates.length === 0) return;
  const existing = new Map(state.candidates.map((c) => [c.candidate_id, c]));
  for (const c of candidates) existing.set(c.candidate_id, c);
  state = {
    ...state,
    candidates: Array.from(existing.values()).sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    ),
  };
  persist();
  notify();
}

export function upsertReport(report: ResearchReport) {
  const others = state.reports.filter(
    (r) => r.candidate_id !== report.candidate_id,
  );
  state = { ...state, reports: [report, ...others] };
  persist();
  notify();
}

export function upsertAudit(audit: AuditLog) {
  const others = state.audits.filter((a) => a.audit_id !== audit.audit_id);
  state = { ...state, audits: [audit, ...others] };
  persist();
  notify();
}

export function clearAll() {
  state = createInitialState();
  persist();
  notify();
}

export function findCandidate(id: string): Candidate | undefined {
  return state.candidates.find((c) => c.candidate_id === id);
}

export function findReport(candidateId: string): ResearchReport | undefined {
  return state.reports.find((r) => r.candidate_id === candidateId);
}

export function findAuditsForCandidate(candidateId: string): AuditLog[] {
  return state.audits.filter((a) => a.candidate_id === candidateId);
}
