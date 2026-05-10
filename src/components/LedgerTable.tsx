import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface LedgerColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Tabular-monospace column. */
  mono?: boolean;
  /** Right-align numeric columns. */
  align?: "left" | "right";
  /** Width hint, e.g. "w-32" or "w-48". */
  widthClass?: string;
}

interface LedgerTableProps<T> {
  columns: LedgerColumn<T>[];
  rows: T[];
  /** Optional caption shown above the table for context. */
  caption?: ReactNode;
  /** Optional empty-state element. */
  empty?: ReactNode;
  /** Row key getter. */
  rowKey: (row: T) => string;
  /** Optional click handler that turns rows into navigable items. */
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * LedgerTable — a flat, tabular-monospace, hairline-separated record
 * table. Used for audit logs, candidate registries, and other places
 * where a card grid would feel decorative. The table has no rounded
 * corners and no internal shadows; only structural hairlines.
 */
export function LedgerTable<T>({
  columns,
  rows,
  caption,
  empty,
  rowKey,
  onRowClick,
  className,
}: LedgerTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <div className={cn("panel px-6 py-12", className)}>{empty}</div>;
  }

  return (
    <div className={cn("panel overflow-hidden", className)}>
      {caption ? (
        <div className="hairline-b px-5 py-3 text-eyebrow">{caption}</div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="hairline-b bg-graphite-900/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-5 py-2.5 text-left text-eyebrow font-medium",
                    col.align === "right" && "text-right",
                    col.widthClass,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "ledger-row align-middle",
                  onRowClick &&
                    "cursor-pointer transition-colors hover:bg-graphite-900/50",
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3 text-body text-graphite-100",
                      col.mono &&
                        "font-mono text-mono-tab text-caption text-graphite-200",
                      col.align === "right" && "text-right",
                    )}
                    data-numeric={col.mono ? "" : undefined}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
