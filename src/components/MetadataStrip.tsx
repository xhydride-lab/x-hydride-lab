import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MetadataItem {
  label: string;
  value: ReactNode;
  /** When true, value is rendered in tabular-monospace numerals. */
  mono?: boolean;
  /** Make this column take twice the space. */
  wide?: boolean;
}

interface MetadataStripProps {
  items: MetadataItem[];
  className?: string;
  /** Layout style. `inline` is for dense headers; `grid` for dossiers. */
  layout?: "inline" | "grid";
}

/**
 * MetadataStrip — a horizontal row of label/value pairs separated by
 * hairlines. Used in dossier headers and ledger overviews. There is no
 * card decoration; the strip is intended to feel like the metadata
 * frontmatter of a research document.
 */
export function MetadataStrip({
  items,
  className,
  layout = "inline",
}: MetadataStripProps) {
  if (layout === "grid") {
    return (
      <dl
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          className,
        )}
      >
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className={cn(
              "flex flex-col gap-1.5 border-graphite-800 px-5 py-4",
              i !== 0 && "border-l-0 lg:border-l",
              "border-t lg:border-t-0",
              i === 0 && "lg:border-l-0",
              item.wide && "lg:col-span-2",
            )}
          >
            <dt className="text-eyebrow">{item.label}</dt>
            <dd
              className={cn(
                "text-body text-graphite-50",
                item.mono && "font-mono text-mono-tab",
              )}
              data-numeric={item.mono ? "" : undefined}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={cn(
        "flex flex-wrap items-stretch divide-x divide-graphite-800",
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="flex flex-col gap-1 px-4 py-2">
          <dt className="text-eyebrow">{item.label}</dt>
          <dd
            className={cn(
              "text-body text-graphite-100",
              item.mono && "font-mono text-mono-tab text-graphite-50",
            )}
            data-numeric={item.mono ? "" : undefined}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
