# X-Hydride Lab

A Grok-native AI discovery platform for hydride-based superconductors.

X-Hydride Lab extends the Grokene discovery framework into hydride research, providing structured candidate generation, weighted X-Score evaluation, simulation input templates, cautious academic-style research notes, and audit-grade provenance records suitable for open DeSci workflows.

This repository is the MVP described in the X-Hydride Lab specification. It is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. The default AI provider is xAI Grok; the app falls back to high-quality demo data when no API key is configured.

> **Project isolation.** This is an isolated, brand-new project named `x-hydride-lab`. It does not touch, modify, or connect to any existing GitHub, Vercel, or Supabase project. Demo mode is the default. You will not push to GitHub, deploy to Vercel, or connect to Supabase until you explicitly choose to.

---

## 1. Setup

```bash
npm install
cp .env.example .env.local
# (optional) edit .env.local to add XAI_API_KEY when you are ready
npm run dev
```

The app runs on `http://localhost:3000`. The landing page links to the lab console at `/overview`.

### Demo mode (default)

If `XAI_API_KEY` is empty, X-Hydride Lab automatically operates in demo mode:

- Candidate generation returns deterministic, scientifically cautious seed candidates.
- Research notes use a built-in fallback template that mirrors the academic-style structure.
- Simulation bundles, X-Score breakdowns, and audit hashes are computed locally without any external service call.

Demo mode is shown as a `Demo Mode` pill in the top-right of the application chrome.

### xAI Grok mode

When `XAI_API_KEY` is present, server-side route handlers call the xAI `/chat/completions` endpoint with strict JSON output. Keys are read **server-side only**. Browsers never see the key.

```env
XAI_API_KEY=...
XAI_MODEL=grok-4.3
XAI_BASE_URL=https://api.x.ai/v1
```

---

## 2. Project structure

```
x-hydride-lab/
├── public/                       # static assets (currently empty)
├── supabase/schema.sql           # draft schema for FUTURE Supabase use
├── src/
│   ├── app/
│   │   ├── page.tsx              # landing page
│   │   ├── overview/page.tsx     # research console dashboard
│   │   ├── candidates/page.tsx   # candidate generator form
│   │   ├── candidates/[id]/page.tsx
│   │   ├── x-score/page.tsx      # weighted X-Score lab
│   │   ├── simulation/page.tsx   # simulation builder
│   │   ├── reports/page.tsx      # academic-style research notes
│   │   ├── audit/page.tsx        # audit log
│   │   ├── settings/page.tsx     # provider + Supabase status (read-only)
│   │   ├── api/
│   │   │   ├── generate-candidates/route.ts
│   │   │   ├── generate-report/route.ts
│   │   │   ├── generate-simulation/route.ts
│   │   │   ├── create-audit-log/route.ts
│   │   │   └── settings/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/               # AppShell, Sidebar, Topbar, MetricCard,
│   │                             # CandidateCard, CandidateTable, XScoreBadge,
│   │                             # XScoreRadar, StatusBadge, PipelineStepper,
│   │                             # ResearchPanel, CodeBlock, AuditRecordCard,
│   │                             # ScientificDisclaimer, EmptyState,
│   │                             # LoadingState, Button
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── providers/xai.ts
│   │   │   ├── types.ts
│   │   │   ├── prompts.ts
│   │   │   ├── jsonExtract.ts
│   │   │   ├── generateHydrideCandidates.ts
│   │   │   ├── generateReport.ts
│   │   │   └── generateSimulation.ts
│   │   ├── audit/hash.ts
│   │   ├── data/seedCandidates.ts
│   │   ├── scoring/xScore.ts
│   │   ├── store/labStore.ts
│   │   └── utils/cn.ts
│   └── types/index.ts
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Pages

| Path | Purpose |
| ---- | ------- |
| `/` | Landing page introducing X-Hydride Lab as a Grok-native research preview. |
| `/overview` | Dashboard with metrics, pipeline visualization, recent candidates, and recent audit records. |
| `/candidates` | Candidate generator form. Submits to `/api/generate-candidates`. |
| `/candidates/[id]` | Candidate detail view with X-Score radar, status timeline, report controls, and audit controls. |
| `/x-score` | Interactive weighted X-Score laboratory. |
| `/simulation` | Simulation Builder with CIF / QE / GPAW / phonon / EPW / convergence templates. |
| `/reports` | Cautious academic-style research notes. |
| `/audit` | Audit log with JSON / Markdown / commit-note exports. |
| `/settings` | Read-only provider, Supabase, and demo-mode status. |

---

## 4. AI provider architecture

```
src/lib/ai/
├── providers/xai.ts          # OpenAI-compatible /chat/completions client
├── types.ts                  # AIProvider, ChatCompletionRequest/Response
├── prompts.ts                # system + user prompt templates
├── jsonExtract.ts            # tolerant JSON extraction
├── generateHydrideCandidates.ts
├── generateReport.ts
└── generateSimulation.ts
```

- The xAI provider speaks the OpenAI-compatible chat completions schema.
- Every generator falls back to deterministic demo data when the provider is unavailable or returns malformed output.
- All API keys are read server-side only. Browser bundles never contain the key.

---

## 5. Scoring framework

`src/lib/scoring/xScore.ts` defines the weighted X-Score formula:

| Subscore | Weight |
| -------- | ------ |
| Thermodynamic Stability | 15% |
| Phonon Stability | 15% |
| EPC Potential | 20% |
| DOS / Fermi-Level Relevance | 10% |
| Pressure Feasibility | 15% |
| Synthesis Feasibility | 10% |
| Novelty | 5% |
| Validation Readiness | 10% |

The overall X-Score is the weighted mean rounded to the nearest integer. Risk flags and the next-validation-step recommendation are derived from the breakdown.

---

## 6. Supabase (NOT YET CONNECTED)

`supabase/schema.sql` defines the future schema (`candidates`, `reports`, `simulation_files`, `audit_logs`). It is **not** executed automatically. To enable persistence later:

1. Create a brand-new Supabase project named `x-hydride-lab` (do not reuse existing projects).
2. Apply `supabase/schema.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
4. Replace the in-memory loaders inside `src/lib/store/labStore.ts` with Supabase calls.

Until you decide to do this, the lab persists candidates, reports, and audit logs to `localStorage` only.

---

## 7. Vercel (NOT YET DEPLOYED)

The project is build-ready for Vercel but is intentionally not deployed. To deploy when ready:

1. Create a brand-new Vercel project (do not reuse existing projects).
2. Push this repository to a brand-new GitHub repo named `x-hydride-lab`.
3. Set environment variables in the Vercel dashboard:
   - `XAI_API_KEY`
   - `XAI_MODEL` (default `grok-4.3`)
   - `XAI_BASE_URL` (default `https://api.x.ai/v1`)
   - Optional Supabase keys (only when you are ready to persist data).
4. Trigger a build. Next.js 14 / App Router runs on the default Vercel runtime.

---

## 8. Disclaimers

This software generates exploratory AI research hypotheses only. It does not validate superconductivity. All candidates, scores, reports, and simulation templates are exploratory artifacts and require DFT, DFPT, EPW, Eliashberg, RPA, and experimental validation before any scientific claim can be made.

X-Hydride Lab is a Grok-native research preview. The default AI provider is xAI Grok, configured via `XAI_API_KEY` and `XAI_MODEL` (default `grok-4.3`).
