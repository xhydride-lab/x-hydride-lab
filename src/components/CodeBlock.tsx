"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  maxHeightClass?: string;
  /** When true, renders line numbers in a left gutter. */
  showLineNumbers?: boolean;
}

/**
 * CodeBlock — flat code surface used inside reports and small inline
 * snippets. For larger multi-file workstations, use `FileWorkstation`.
 */
export function CodeBlock({
  code,
  language = "text",
  filename,
  className,
  maxHeightClass = "max-h-[24rem]",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "x-hydride-lab.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("panel overflow-hidden", className)}>
      <div className="hairline-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-caption text-graphite-200">
            {filename ?? "snippet"}
          </span>
          <span className="rounded-sharp border border-graphite-800 bg-graphite-950 px-1.5 text-eyebrow text-graphite-400">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="focus-ring rounded-sharp border border-graphite-800 bg-graphite-950 px-2 py-1 text-eyebrow text-graphite-200 hover:border-graphite-600"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {filename ? (
            <button
              type="button"
              onClick={handleDownload}
              className="focus-ring rounded-sharp border border-graphite-800 bg-graphite-950 px-2 py-1 text-eyebrow text-graphite-200 hover:border-graphite-600"
            >
              Download
            </button>
          ) : null}
        </div>
      </div>
      <div className={cn("overflow-auto", maxHeightClass)}>
        {showLineNumbers ? (
          <pre className="m-0 grid grid-cols-[3rem_minmax(0,1fr)] font-mono text-[12.5px] leading-[1.55]">
            <code
              aria-hidden
              className="select-none border-r border-graphite-800 bg-graphite-925 py-3 pr-3 text-right text-graphite-600"
            >
              {lines.map((_, i) => (
                <span key={i} className="block">
                  {String(i + 1).padStart(3, " ")}
                </span>
              ))}
            </code>
            <code className="py-3 pl-4 pr-5 text-graphite-200">
              {lines.map((ln, i) => (
                <span key={i} className="block whitespace-pre">
                  {ln || " "}
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <pre className="overflow-auto p-4 font-mono text-[12.5px] leading-[1.55] text-graphite-200">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
