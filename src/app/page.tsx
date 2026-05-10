import Link from "next/link";
import { LinkButton } from "@/components/Button";
import { ProviderPill } from "@/components/Topbar";
import { ScientificDisclaimer } from "@/components/ScientificDisclaimer";
import { FrameworkDiagram } from "@/components/FrameworkDiagram";
import { Logomark, LogomarkLockup } from "@/components/Logomark";

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
      "Extends the Grokene workflow into hydride-based superconductors with stricter scoring, simulation handoff, and provenance ledger.",
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

      <main className="mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-12">
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

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-graphite-800 bg-graphite-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[88rem] items-center justify-between px-6 sm:px-10 lg:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 rounded-sharp"
            aria-label="X-Hydride Lab home"
          >
            <LogomarkLockup />
          </Link>
          <span className="hidden h-4 w-px bg-graphite-800 sm:block" />
          <span className="hidden text-eyebrow sm:inline">
            Research Preview · v0.1.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ProviderPill demoMode />
          <Link
            href="/overview"
            className="focus-ring hidden rounded-sharp border border-graphite-700 bg-graphite-900 px-3 py-1.5 text-caption text-graphite-100 transition-colors hover:border-graphite-600 sm:inline-block"
          >
            Open lab
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid grid-cols-1 gap-10 border-b border-graphite-800 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
      <div className="flex max-w-3xl flex-col gap-6">
        <div className="flex items-center gap-3 text-eyebrow">
          <span className="font-mono text-mono-tab text-graphite-500" data-numeric="">
            00
          </span>
          <span className="text-graphite-400">Research manifesto</span>
        </div>
        <div className="flex items-center gap-4">
          <Logomark size={48} />
          <span className="text-eyebrow text-graphite-400">X · Hydride · Lab</span>
        </div>
        <h1 className="text-manifesto font-semibold text-graphite-50">
          A Grok-native discovery platform for hydride-based superconductors.
        </h1>
        <p className="text-subtitle text-graphite-300">
          X-Hydride Lab extends the Grokene framework into structured candidate generation, weighted X-Score evaluation, simulation preparation, and audit-grade provenance. Every output is an exploratory hypothesis intended to enter a rigorous computational and experimental validation pipeline.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <LinkButton href="/overview" size="lg">
            Launch Lab
          </LinkButton>
          <LinkButton href="/x-score" size="lg" variant="secondary">
            View Framework
          </LinkButton>
        </div>
      </div>

      <aside className="flex flex-col gap-3">
        <p className="text-eyebrow">Operating parameters</p>
        <dl className="panel grid grid-cols-1 divide-y divide-graphite-800">
          {[
            ["Default provider", "xAI Grok"],
            ["Default model", "grok-4.3"],
            ["Output format", "json_schema (strict)"],
            ["Audit hash", "SHA-256"],
            ["Demo mode", "Enabled when API key absent"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between px-4 py-2.5">
              <dt className="text-eyebrow">{k}</dt>
              <dd className="font-mono text-mono-tab text-caption text-graphite-100" data-numeric="">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}

function Lineage() {
  return (
    <section className="border-b border-graphite-800 py-14">
      <header className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-mono-tab text-eyebrow text-graphite-500" data-numeric="">
          01
        </span>
        <h2 className="text-section font-medium text-graphite-50">From Grokene to X-Hydride</h2>
      </header>
      <div className="grid grid-cols-1 divide-y divide-graphite-800 border border-graphite-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {LINEAGE.map((entry) => (
          <article key={entry.code} className="px-6 py-6">
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono text-mono-tab text-eyebrow text-accent-300"
                data-numeric=""
              >
                {entry.code}
              </span>
              <h3 className="text-section font-medium text-graphite-50">
                {entry.label}
              </h3>
            </div>
            <p className="mt-3 max-w-prose text-body leading-relaxed text-graphite-300">
              {entry.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Framework() {
  return (
    <section className="border-b border-graphite-800 py-14">
      <header className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-mono-tab text-eyebrow text-graphite-500" data-numeric="">
          02
        </span>
        <h2 className="text-section font-medium text-graphite-50">Discovery framework</h2>
      </header>
      <FrameworkDiagram />
    </section>
  );
}

function Workflow() {
  return (
    <section className="border-b border-graphite-800 py-14">
      <header className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-mono-tab text-eyebrow text-graphite-500" data-numeric="">
          03
        </span>
        <h2 className="text-section font-medium text-graphite-50">Scientific workflow</h2>
      </header>
      <ol className="grid grid-cols-1 divide-y divide-graphite-800 border border-graphite-800 md:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        {WORKFLOW.map((step) => (
          <li key={step.code} className="flex flex-col gap-2 px-5 py-5">
            <span
              className="font-mono text-mono-tab text-eyebrow text-accent-300"
              data-numeric=""
            >
              {step.code}
            </span>
            <p className="text-body font-medium tracking-tightish text-graphite-50">
              {step.label}
            </p>
            <p className="text-caption leading-relaxed text-graphite-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Validation() {
  return (
    <section className="border-b border-graphite-800 py-14">
      <header className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-mono-tab text-eyebrow text-graphite-500" data-numeric="">
          04
        </span>
        <h2 className="text-section font-medium text-graphite-50">Validation disclaimer</h2>
      </header>
      <ScientificDisclaimer />
    </section>
  );
}

function FooterBlock() {
  return (
    <footer className="flex flex-col gap-4 py-10 text-caption text-graphite-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} X-Hydride Lab · Research preview · Grok-native discovery
      </p>
      <nav className="flex flex-wrap gap-5 text-graphite-400">
        <Link className="focus-ring rounded-sharp hover:text-graphite-100" href="/overview">
          Overview
        </Link>
        <Link className="focus-ring rounded-sharp hover:text-graphite-100" href="/candidates">
          Candidate Generator
        </Link>
        <Link className="focus-ring rounded-sharp hover:text-graphite-100" href="/x-score">
          X-Score Lab
        </Link>
        <Link className="focus-ring rounded-sharp hover:text-graphite-100" href="/audit">
          Audit Log
        </Link>
      </nav>
    </footer>
  );
}
