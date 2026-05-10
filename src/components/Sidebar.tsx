"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { href: "/overview", label: "Overview", icon: <OverviewIcon /> },
  { href: "/candidates", label: "Candidate Generator", icon: <BeakerIcon /> },
  { href: "/x-score", label: "X-Score Lab", icon: <ChartIcon /> },
  { href: "/simulation", label: "Simulation Builder", icon: <CodeIcon /> },
  { href: "/reports", label: "Research Reports", icon: <DocIcon /> },
  { href: "/audit", label: "Audit Log", icon: <ShieldIcon /> },
  { href: "/settings", label: "Settings", icon: <GearIcon /> },
];

/**
 * Sidebar — primary navigation column.
 *
 * Uses small monochrome icons + label, with a subtle active highlight
 * (background + accent indicator). Numeric ordering is dropped from the
 * launch chrome; the focus is on readable labels.
 */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden w-60 shrink-0 border-r border-graphite-800/80 lg:flex lg:flex-col"
      aria-label="Primary navigation"
    >
      <nav className="flex-1 px-3 py-5">
        <ol className="flex flex-col gap-0.5">
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
                    "focus-ring group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
                    active
                      ? "bg-white/[0.06] text-graphite-50"
                      : "text-graphite-400 hover:bg-white/[0.03] hover:text-graphite-100",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center transition-colors",
                      active ? "text-accent-300" : "text-graphite-500 group-hover:text-graphite-300",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium tracking-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="border-t border-graphite-800/80 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-graphite-500">
          AI-generated candidates are exploratory hypotheses. DFT, DFPT,
          EPW, Eliashberg, RPA, and experimental validation are required
          before any scientific claim.
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------- Icons ------------------------------- */

function OverviewIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="8" height="8" rx="1.4" />
      <rect x="13" y="3" width="8" height="5" rx="1.4" />
      <rect x="13" y="10" width="8" height="11" rx="1.4" />
      <rect x="3" y="13" width="8" height="8" rx="1.4" />
    </svg>
  );
}

function BeakerIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 3v6L4.5 17a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L15 9V3" />
      <path d="M8 3h8" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M8 15v-4" strokeLinecap="round" />
      <path d="M12 15V7" strokeLinecap="round" />
      <path d="M16 15v-6" strokeLinecap="round" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.8a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
    </svg>
  );
}
