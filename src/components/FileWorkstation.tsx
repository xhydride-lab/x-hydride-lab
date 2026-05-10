"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface WorkstationFile {
  id: string;
  /** Filename shown in the tree and editor header. */
  filename: string;
  /** Optional grouping label (e.g. "Quantum ESPRESSO", "EPW"). */
  group?: string;
  language?: string;
  contents: string;
  /** Optional badge text rendered next to the filename. */
  badge?: string;
}

interface FileWorkstationProps {
  files: WorkstationFile[];
  /** Optional initial file id. Falls back to the first file. */
  initialFileId?: string;
  /** Right-rail node, e.g. validation checklist. */
  rail?: ReactNode;
  className?: string;
  /** Optional toolbar above the editor (copy/download already provided). */
  toolbar?: ReactNode;
}

/**
 * FileWorkstation — computational-notebook style file viewer with a left
 * file tree, an editor pane in the middle, and an optional right rail
 * for things like validation checklists. The pane shows line numbers
 * and a sticky filename header. There is no mock-IDE chrome.
 */
export function FileWorkstation({
  files,
  initialFileId,
  rail,
  className,
  toolbar,
}: FileWorkstationProps) {
  const [activeId, setActiveId] = useState<string>(
    initialFileId ?? files[0]?.id ?? "",
  );
  const [copied, setCopied] = useState(false);
  const active = files.find((f) => f.id === activeId) ?? files[0];

  // Group files by their `group` field (or "Files" when missing).
  const groups = new Map<string, WorkstationFile[]>();
  for (const f of files) {
    const g = f.group ?? "Files";
    const arr = groups.get(g) ?? [];
    arr.push(f);
    groups.set(g, arr);
  }

  if (!active) {
    return (
      <div className={cn("panel px-6 py-12 text-caption text-graphite-400", className)}>
        No files in this workstation.
      </div>
    );
  }

  const lines = active.contents.split("\n");
  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(active.contents);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([active.contents], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = active.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "panel grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)]",
        rail ? "xl:grid-cols-[14rem_minmax(0,1fr)_18rem]" : "",
        className,
      )}
    >
      {/* File tree */}
      <aside className="border-b border-graphite-800 lg:border-b-0 lg:border-r">
        <div className="hairline-b px-4 py-2.5">
          <p className="text-eyebrow">Files</p>
        </div>
        <nav className="p-2">
          {Array.from(groups.entries()).map(([group, list]) => (
            <div key={group} className="mb-3 last:mb-0">
              <p className="px-2 py-1 text-eyebrow text-graphite-500">{group}</p>
              <ul className="flex flex-col">
                {list.map((file) => {
                  const selected = file.id === activeId;
                  return (
                    <li key={file.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(file.id)}
                        className={cn(
                          "focus-ring flex w-full items-center justify-between gap-2 rounded-sharp px-2 py-1.5 text-left text-caption font-mono transition-colors",
                          selected
                            ? "bg-graphite-900 text-graphite-50"
                            : "text-graphite-300 hover:bg-graphite-900/60 hover:text-graphite-100",
                        )}
                      >
                        <span className="truncate">{file.filename}</span>
                        {file.badge ? (
                          <span className="rounded-sharp border border-graphite-700 bg-graphite-950 px-1.5 text-eyebrow text-graphite-300">
                            {file.badge}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Editor pane */}
      <section className="flex min-h-[24rem] flex-col">
        <header className="hairline-b flex items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <p className="font-mono text-caption text-graphite-100">
              {active.filename}
            </p>
            {active.language ? (
              <span className="rounded-sharp border border-graphite-800 bg-graphite-950 px-2 py-0.5 text-eyebrow text-graphite-400">
                {active.language}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            <button
              type="button"
              onClick={handleCopy}
              className="focus-ring rounded-sharp border border-graphite-800 bg-graphite-950 px-2.5 py-1 text-eyebrow text-graphite-200 hover:border-graphite-600"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="focus-ring rounded-sharp border border-graphite-800 bg-graphite-950 px-2.5 py-1 text-eyebrow text-graphite-200 hover:border-graphite-600"
            >
              Download
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <pre className="m-0 grid grid-cols-[3rem_minmax(0,1fr)] font-mono text-[12.5px] leading-[1.55]">
            <code aria-hidden className="select-none border-r border-graphite-800 bg-graphite-925 py-3 pr-3 text-right text-graphite-600">
              {lines.map((_, i) => (
                <span key={i} className="block">
                  {String(i + 1).padStart(3, " ")}
                </span>
              ))}
            </code>
            <code className="py-3 pl-4 pr-5 text-graphite-200">
              {lines.map((ln, i) => (
                <span key={i} className="block whitespace-pre">
                  {ln || " "}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </section>

      {/* Right rail */}
      {rail ? (
        <aside className="border-t border-graphite-800 xl:border-l xl:border-t-0">
          {rail}
        </aside>
      ) : null}
    </div>
  );
}
