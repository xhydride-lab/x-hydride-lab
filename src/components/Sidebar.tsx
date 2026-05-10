"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  /** Two-character institutional code rendered to the left of the label. */
  code: string;
}

const NAV: NavItem[] = [
  { href: "/overview", label: "Overview", code: "01" },
  { href: "/candidates", label: "Candidate Generator", code: "02" },
  { href: "/x-score", label: "X-Score Lab", code: "03" },
  { href: "/simulation", label: "Simulation Builder", code: "04" },
  { href: "/reports", label: "Research Reports", code: "05" },
  { href: "/audit", label: "Audit Log", code: "06" },
  { href: "/settings", label: "Settings", code: "07" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden w-64 shrink-0 border-r border-graphite-800 lg:flex lg:flex-col"
      aria-label="Primary navigation"
    >
      <div className="border-b border-graphite-800 px-5 py-5">
        <p className="text-eyebrow">Workspace</p>
        <p className="mt-2 text-body font-medium tracking-tightish text-graphite-50">
          Hydride Discovery Console
        </p>
        <p className="mt-1 text-caption text-graphite-500">
          Grok-native research environment
        </p>
      </div>

      <nav className="flex-1 px-2 py-3">
        <ol className="flex flex-col gap-px">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(`${item.href}/`));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-sharp border-l px-3 py-2 text-caption transition-colors",
                    active
                      ? "border-l-accent-400 bg-graphite-900 text-graphite-50"
                      : "border-l-transparent text-graphite-400 hover:bg-graphite-900/60 hover:text-graphite-100",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-mono-tab text-eyebrow",
                      active ? "text-accent-300" : "text-graphite-500",
                    )}
                    data-numeric=""
                  >
                    {item.code}
                  </span>
                  <span className="text-body font-medium tracking-tightish">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="border-t border-graphite-800 px-5 py-4">
        <p className="text-eyebrow">Scientific notice</p>
        <p className="mt-1.5 text-caption leading-relaxed text-graphite-500">
          All outputs are exploratory hypotheses. Validation via DFT, DFPT,
          EPW, Eliashberg, RPA, and experiment is required before any claim
          can be made.
        </p>
      </div>
    </aside>
  );
}
