import Link from "next/link";
import { LinkButton } from "@/components/Button";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { FrameworkDiagram } from "@/components/FrameworkDiagram";
import { LogomarkBanner, LogomarkLockup } from "@/components/Logomark";

const LINEAGE = [
  {
    code: "00",
    label: "Grokene",
    summary:
      "First proof-of-concept for AI-guided superconducting candidate discovery. Established the structured prompt → candidate JSON → audit hash pipeline.",
  },
  {
    code: "01",
    label: "X-Hydride Lab",
    summary:
      "Extends the Grokene workflow into hydride-based superconductors with stricter scoring, simulation handoff, and a provenance ledger.",
  },
];

const WORKFLOW = [
  {
    code: "01",
    label: "Generate",
    body: "Submit a structured research request. xAI Grok returns strict-JSON candidate hypotheses constrained by an explicit schema.",
  },
  {
    code: "02",
    label: "Score",
    body: "Eight weighted subscores produce a single overall X-Score. Risk flags surface phonon, thermodynamic, and pressure concerns.",
  },
  {
    code: "03",
    label: "Prepare",
    body: "Generate CIF, Quantum ESPRESSO, GPAW/ASE, DFPT phonon, EPW, and convergence templates as a deterministic bundle for review.",
  },
  {
    code: "04",
    label: "Document",
    body: "Draft a cautious academic-style research note framed as a hypothesis requiring DFT, DFPT, EPW, Eliashberg, and RPA validation.",
  },
  {
    code: "05",
    label: "Anchor",
    body: "SHA-256 hashes for input, output, report, and simulation artifacts are written to a provenance ledger ready for on-chain anchoring.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100">
      <LandingNav />

      <main>
        <Hero />
        <Lineage />
        <Framework />
        <Workflow />
        <Validation />
        <FooterBlock />
      </main>
    </div>
  );
}

/* ----------------------------- Top nav ----------------------------- */

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-graphite-800/60 bg-graphite-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-graphite-950/60">
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-md"
          aria-label="X-Hydride Lab home"
        >
          <LogomarkLockup />
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/overview">Overview</NavLink>
          <NavLink href="/candidates">Generate</NavLink>
          <NavLink href="/x-score">X-Score</NavLink>
          <span className="ml-2">
            <Link
              href="/overview"
              className="focus-ring inline-flex h-9 items-center justify-center rounded-full bg-accent-500 px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-400"
            >
              Open Lab
            </Link>
          </span>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-graphite-300 transition-colors hover:bg-white/[0.04] hover:text-graphite-50 sm:inline-flex"
    >
      {children}
    </Link>
  );
}

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-graphite-800/80">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[88rem] px-6 pb-28 pt-24 sm:px-10 sm:pt-32 lg:px-14 lg:pt-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="flex flex-col items-start gap-9">
            <LogomarkBanner markSize={104} />
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.03em] text-graphite-50 sm:text-[64px] sm:leading-[1.05] lg:text-[76px]">
              The Grok-native discovery platform for hydride superconductors.
            </h1>
            <p className="max-w-2xl text-subtitle text-graphite-300">
              X-Hydride Lab extends the Grokene framework into structured
              candidate generation, weighted X-Score evaluation, simulation
              preparation, and audit-grade provenance. Every output is an
              exploratory hypothesis intended to enter a rigorous
              computational and experimental validation pipeline.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <LinkButton href="/overview" size="lg">
                Open Lab
              </LinkButton>
              <LinkButton href="/x-score" size="lg" variant="secondary">
                View Framework
              </LinkButton>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <p className="text-eyebrow">Operating parameters</p>
            <dl className="panel grid grid-cols-1 divide-y divide-graphite-800/80">
              {[
                ["Provider", "xAI Grok"],
                ["Model", "grok-4.3"],
                ["Output", "json_schema (strict)"],
                ["Audit hash", "SHA-256"],
                ["Provenance", "Off-chain ledger"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between px-5 py-3"
                >
                  <dt className="text-[12.5px] text-graphite-400">{k}</dt>
                  <dd
                    className="font-mono text-mono-tab text-[12.5px] text-graphite-100"
                    data-numeric=""
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Lineage ----------------------------- */

function Lineage() {
  return (
    <section className="border-b border-graphite-800/80 py-24">
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-14">
        <SectionHeading
          eyebrow="Lineage"
          title="From Grokene to X-Hydride."
          description="X-Hydride Lab inherits Grokene's discipline and extends it to the rigor required by hydride superconductor research."
        />
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-graphite-800 lg:grid-cols-2">
          {LINEAGE.map((entry) => (
            <article key={entry.code} className="bg-graphite-925 px-8 py-9">
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-mono-tab text-[12px] text-accent-300"
                  data-numeric=""
                >
                  {entry.code}
                </span>
                <h3 className="text-section font-semibold text-graphite-50">
                  {entry.label}
                </h3>
              </div>
              <p className="mt-4 max-w-prose text-body leading-relaxed text-graphite-300">
                {entry.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Framework ---------------------------- */

function Framework() {
  return (
    <section className="border-b border-graphite-800/80 py-24">
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-14">
        <SectionHeading
          eyebrow="Framework"
          title="A discovery pipeline you can audit."
          description="Inputs feed candidate generation; validation gates govern progression. Every artifact in between is hashed and recorded."
        />
        <div className="mt-10">
          <FrameworkDiagram />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Workflow ----------------------------- */

function Workflow() {
  return (
    <section className="border-b border-graphite-800/80 py-24">
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-14">
        <SectionHeading
          eyebrow="Workflow"
          title="Five disciplined steps."
          description="Generate, score, prepare, document, anchor. Each step produces a reviewable artifact."
        />
        <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-graphite-800 md:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW.map((step) => (
            <li key={step.code} className="flex flex-col gap-3 bg-graphite-925 px-6 py-7">
              <span
                className="font-mono text-mono-tab text-[12px] text-accent-300"
                data-numeric=""
              >
                {step.code}
              </span>
              <p className="text-[15px] font-semibold tracking-tight text-graphite-50">
                {step.label}
              </p>
              <p className="text-[13px] leading-relaxed text-graphite-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------- Validation ---------------------------- */

function Validation() {
  return (
    <section className="border-b border-graphite-800/80 py-24">
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-14">
        <SectionHeading
          eyebrow="Validation"
          title="Hypothesis, not claim."
        />
        <div className="mt-8">
          <ScientificDisclaimer />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Footer ----------------------------- */

function FooterBlock() {
  return (
    <footer className="mx-auto w-full max-w-[88rem] px-6 py-12 text-[12.5px] text-graphite-500 sm:px-10 lg:px-14">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} X-Hydride Lab</p>
        <nav className="flex flex-wrap gap-6 text-graphite-400">
          <Link className="focus-ring rounded-md hover:text-graphite-100" href="/overview">
            Overview
          </Link>
          <Link className="focus-ring rounded-md hover:text-graphite-100" href="/candidates">
            Generate
          </Link>
          <Link className="focus-ring rounded-md hover:text-graphite-100" href="/x-score">
            X-Score
          </Link>
          <Link className="focus-ring rounded-md hover:text-graphite-100" href="/audit">
            Provenance
          </Link>
        </nav>
      </div>

      <CommunityTokenBlock />
    </footer>
  );
}

/**
 * CommunityTokenBlock — surfaces the canonical Solana mint address solely so
 * the community can verify which on-chain address is the official one and
 * avoid scam clones. Published for verification only — not investment advice,
 * not a solicitation, no claim that research outputs affect token value.
 */
function CommunityTokenBlock() {
  const CA = "7wABWr1g1AEZaszbZkm8bJ6hKN7i4sEDa39HtrxPpump";
  return (
    <section
      aria-label="Community verification"
      className="mt-10 flex flex-col gap-3 rounded-2xl border border-graphite-800/80 bg-graphite-925/60 px-5 py-5 sm:px-7 sm:py-6"
    >
      <p className="text-eyebrow text-graphite-300">Community · verification</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <p className="text-[12.5px] leading-relaxed text-graphite-400">
          Official community token (Pump.fun · Solana). Listed solely so
          observers can verify which on-chain address is canonical and avoid
          impersonators.
        </p>
        <code className="break-all font-mono text-mono-tab text-[11.5px] text-graphite-100">
          {CA}
        </code>
      </div>
      <p className="text-[11.5px] leading-relaxed text-graphite-500">
        Not an offer, solicitation, or investment, financial, legal, or tax
        advice. The token is independent of the scientific output of this
        software; no candidate, X-Score, report, or simulation here implies any
        financial result. Do your own research.
      </p>
    </section>
  );
}

/* ---------------------------- Helpers ---------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <p className="text-eyebrow">{eyebrow}</p>
      <h2 className="text-[40px] font-semibold tracking-[-0.025em] text-graphite-50 sm:text-[48px] sm:leading-[1.1]">
        {title}
      </h2>
      {description ? (
        <p className="text-subtitle text-graphite-400">{description}</p>
      ) : null}
    </div>
  );
}
