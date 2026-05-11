# X-Hydride Lab

A Grok-native AI discovery platform for hydride-based superconductors.

X-Hydride Lab extends the Grokene discovery framework into hydride research, providing structured candidate generation, weighted X-Score evaluation, simulation input templates, cautious academic-style research notes, and audit-grade provenance records suitable for open DeSci workflows.

Live: **<https://xhydride.xyz>**

---

## Disclaimer

> **Research preview — exploratory AI hypotheses only.**
>
> X-Hydride Lab generates *exploratory* AI-derived candidate hypotheses. Nothing this software outputs is a validated scientific result and nothing here is investment, financial, or trading advice. Every candidate, X-Score, research note, and simulation template **must** be independently validated through DFT, DFPT, EPW, Eliashberg, RPA, and experimental work before any scientific claim is made. Use at your own risk.

---

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- AI provider: **xAI Grok** (default model `grok-4.3`), called server-side over the OpenAI-compatible `/chat/completions` endpoint with strict `json_schema` response format
- Persistence: Supabase (Postgres) with SHA-256 provenance hashing
- Hosting: Vercel

---

## 1. Local setup

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
├── public/                       # static assets (brand artwork)
├── supabase/schema.sql           # candidates / reports / simulation_files / audit_logs
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── page.tsx              # landing
│   │   ├── overview/             # dashboard
│   │   ├── candidates/           # generator + detail
│   │   ├── x-score/              # weighted X-Score lab
│   │   ├── simulation/           # CIF / QE / GPAW / phonon / EPW / convergence bundle
│   │   ├── reports/              # academic-style research notes
│   │   ├── audit/                # SHA-256 audit ledger
│   │   ├── settings/             # provider + Supabase status
│   │   └── api/                  # generate-candidates · generate-report ·
│   │                             # generate-simulation · create-audit-log · settings
│   ├── components/               # AppShell, Sidebar, Topbar, Logomark,
│   │                             # CandidateCard/Table, XScoreRadar, StatusBadge,
│   │                             # ResearchPanel, CodeBlock, AuditRecordCard,
│   │                             # ScientificDisclaimer, MetricStrip, …
│   ├── lib/
│   │   ├── ai/                   # xAI provider + prompts + JSON schema + extractors
│   │   ├── audit/hash.ts         # SHA-256 over stable JSON payloads
│   │   ├── data/seedCandidates.ts
│   │   ├── data/domainChecklist.ts
│   │   ├── scoring/xScore.ts     # weighted X-Score formula
│   │   ├── store/labStore.ts
│   │   └── utils/cn.ts
│   └── types/index.ts
├── .env.example
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
| `/` | Landing page introducing X-Hydride Lab. |
| `/overview` | Dashboard with metrics, pipeline visualization, recent candidates, recent audit records. |
| `/candidates` | Candidate generator form (submits to `/api/generate-candidates`). |
| `/candidates/[id]` | Candidate detail view with X-Score radar, status timeline, report controls, audit controls. |
| `/x-score` | Interactive weighted X-Score laboratory. |
| `/simulation` | Simulation builder — CIF, Quantum ESPRESSO, GPAW/ASE, DFPT phonon, EPW, convergence templates. |
| `/reports` | Cautious academic-style research notes. |
| `/audit` | Audit ledger with JSON / Markdown / commit-note exports. |
| `/settings` | Provider, Supabase, and demo-mode status (read-only). |

---

## 4. AI provider architecture

```
src/lib/ai/
├── providers/xai.ts          # OpenAI-compatible /chat/completions client
├── types.ts                  # AIProvider, ChatCompletionRequest/Response
├── prompts.ts                # system + user prompt templates
├── schemas.ts                # strict json_schema definitions
├── jsonExtract.ts            # tolerant JSON extraction
├── generateHydrideCandidates.ts
├── generateReport.ts
└── generateSimulation.ts
```

- The xAI provider speaks the OpenAI-compatible chat-completions schema.
- All generators fall back to deterministic demo data when the provider is unavailable or returns malformed output.
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

## 6. Provenance hashing

Every AI generation cycle anchors a SHA-256 hash row:

| Field | Source |
| ----- | ------ |
| `input_hash` | Stable JSON of the generator input. |
| `output_hash` | Stable JSON of the candidate / generator output. |
| `report_hash` | Stable JSON of the academic-style note. |
| `simulation_hash` | Stable JSON of the simulation bundle. |

Hashes are computed over a canonicalised JSON payload (sorted keys, no whitespace) so identical inputs always produce identical hashes — suitable for downstream on-chain anchoring if desired.

---

## 7. Contributing

PRs welcome. Please:

1. Keep generators conservative and cautious; never claim Tc, claim superconductivity, or imply commercial readiness.
2. Add `validation_priorities` for every new candidate path.
3. Run `npm run type-check && npm run build` before submitting.

---

## 8. Community · verification

Canonical X-Hydride Lab channels:

- **Website:** <https://xhydride.xyz>
- **X (Twitter):** [@xhydride](https://x.com/xhydride?s=21)
- **GitHub:** <https://github.com/xhydride-lab/x-hydride-lab>

The official community token is launched on **Pump.fun** (Solana). Its canonical mint address is:

```
7wABWr1g1AEZaszbZkm8bJ6hKN7i4sEDa39HtrxPpump
```

All of the above are listed **solely for verification** so that observers can confirm which channels and on-chain address are canonical and avoid scam clones or impersonators.

> Nothing in this repository is an offer, solicitation, recommendation, or any form of investment, financial, legal, or tax advice. The community token is independent of the scientific output of this software. No candidate, X-Score, research note, or simulation in this repository implies any financial outcome, and no claim of superconductivity is being made. Do your own research.

---

## 9. License

[MIT](./LICENSE)
