"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DocumentSection {
  id: string;
  label: string;
  content: ReactNode;
}

interface DocumentShellProps {
  /** Eyebrow text above the title (e.g. "Research note · 2026-05-10"). */
  eyebrow?: string;
  title: string;
  /** Authors, model attribution, generated date — rendered below title. */
  byline?: ReactNode;
  /** Abstract paragraph rendered as a leading block. */
  abstract?: ReactNode;
  /** Sections in order. The shell renders the document column on the
   *  right and a sticky section navigator on the left for desktop. */
  sections: DocumentSection[];
  /** Optional toolbar (export buttons, etc.) rendered above the document. */
  toolbar?: ReactNode;
  /** Optional bottom note, e.g. AI-generated disclaimer. */
  footnote?: ReactNode;
  className?: string;
}

/**
 * DocumentShell — a preprint-style layout for academic-feeling research
 * documents. Two-column on desktop (TOC + body), single column on mobile.
 * Sections are anchored so the TOC links scroll the user to that section.
 *
 * The component is intentionally typographic. There are no decorative
 * cards; surfaces are plain hairlined panels.
 */
export function DocumentShell({
  eyebrow,
  title,
  byline,
  abstract,
  sections,
  toolbar,
  footnote,
  className,
}: DocumentShellProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  // Track scroll position to highlight the active section in the TOC.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <article
      className={cn(
        "grid grid-cols-1 gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]",
        className,
      )}
    >
      {/* Section navigator (TOC) — sticky on desktop. */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-2">
          <p className="text-eyebrow">Sections</p>
          <ol className="flex flex-col gap-0.5">
            {sections.map((s, i) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      "focus-ring flex items-center gap-3 rounded-sharp px-2 py-1.5 text-caption transition-colors",
                      active
                        ? "bg-graphite-900 text-graphite-50"
                        : "text-graphite-400 hover:text-graphite-100",
                    )}
                  >
                    <span
                      className="font-mono text-mono-tab text-graphite-500"
                      data-numeric=""
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <div>
        <header className="border-b border-graphite-800 pb-6">
          {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-display font-semibold text-graphite-50">
            {title}
          </h1>
          {byline ? (
            <p className="mt-3 text-caption text-graphite-400">{byline}</p>
          ) : null}
          {toolbar ? <div className="mt-5 flex flex-wrap gap-2">{toolbar}</div> : null}
        </header>

        {abstract ? (
          <section className="border-b border-graphite-800 px-0 py-6">
            <p className="text-eyebrow">Abstract</p>
            <div className="mt-3 max-w-prose text-body leading-7 text-graphite-200">
              {abstract}
            </div>
          </section>
        ) : null}

        <div>
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="border-b border-graphite-800 py-7"
            >
              <header className="mb-3 flex items-baseline gap-3">
                <span
                  className="font-mono text-mono-tab text-eyebrow text-graphite-500"
                  data-numeric=""
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-section font-medium text-graphite-50">
                  {s.label}
                </h2>
              </header>
              <div className="doc-prose max-w-prose">{s.content}</div>
            </section>
          ))}
        </div>

        {footnote ? (
          <footer className="pt-6 text-caption text-graphite-500">
            {footnote}
          </footer>
        ) : null}
      </div>
    </article>
  );
}
