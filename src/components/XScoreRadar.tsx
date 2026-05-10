import type { XScoreBreakdown } from "@/types";
import { X_SCORE_CATEGORIES, type XScoreCategory } from "@/lib/scoring/xScore";
import { cn } from "@/lib/utils/cn";

interface XScoreRadarProps {
  breakdown: XScoreBreakdown;
  size?: number;
  className?: string;
}

/**
 * Pure-SVG radar chart for the eight X-Score subscores.
 * Deterministic and dependency-free so it renders identically server-side
 * and client-side.
 */
export function XScoreRadar({
  breakdown,
  size = 360,
  className,
}: XScoreRadarProps) {
  const radius = size / 2 - 36;
  const center = size / 2;
  const categories = X_SCORE_CATEGORIES;
  const angleStep = (Math.PI * 2) / categories.length;

  const ringValues = [25, 50, 75, 100];

  const points = categories.map((cat, i) => {
    const value = breakdown[cat.key as XScoreCategory] ?? 0;
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle,
      value,
      cat,
    };
  });

  const polygon = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  const labelPoints = categories.map((cat, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = radius + 22;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      cat,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full max-w-md", className)}
      role="img"
      aria-label="X-Score radar chart"
    >
      <defs>
        <radialGradient id="xs-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(95,185,255,0.32)" />
          <stop offset="100%" stopColor="rgba(95,185,255,0.10)" />
        </radialGradient>
      </defs>

      {ringValues.map((rv) => {
        const r = (rv / 100) * radius;
        const ringPoints = categories
          .map((_, i) => {
            const a = -Math.PI / 2 + i * angleStep;
            return `${(center + r * Math.cos(a)).toFixed(2)},${(
              center + r * Math.sin(a)
            ).toFixed(2)}`;
          })
          .join(" ");
        return (
          <polygon
            key={rv}
            points={ringPoints}
            fill="none"
            stroke="rgba(170,177,191,0.16)"
            strokeWidth={1}
          />
        );
      })}

      {categories.map((_, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        return (
          <line
            key={`spoke-${i}`}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(a)}
            y2={center + radius * Math.sin(a)}
            stroke="rgba(170,177,191,0.12)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={polygon}
        fill="url(#xs-fill)"
        stroke="rgba(95,185,255,0.85)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {points.map((p) => (
        <circle
          key={`pt-${p.cat.key}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#5fb9ff"
          stroke="#0a0c13"
          strokeWidth={1.5}
        />
      ))}

      {labelPoints.map(({ x, y, cat }, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const cos = Math.cos(a);
        const anchor = cos < -0.2 ? "end" : cos > 0.2 ? "start" : "middle";
        return (
          <text
            key={`label-${cat.key}`}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="font-mono"
            fill="rgba(170,177,191,0.85)"
            fontSize={10}
            letterSpacing="0.04em"
          >
            {shortLabel(cat.key as XScoreCategory)}
          </text>
        );
      })}
    </svg>
  );
}

function shortLabel(key: XScoreCategory): string {
  switch (key) {
    case "thermodynamic_stability":
      return "Thermo";
    case "phonon_stability":
      return "Phonon";
    case "epc_potential":
      return "EPC";
    case "dos_fermi_relevance":
      return "DOS/EF";
    case "pressure_feasibility":
      return "Pressure";
    case "synthesis_feasibility":
      return "Synth";
    case "novelty":
      return "Novelty";
    case "validation_readiness":
      return "Validate";
  }
}
