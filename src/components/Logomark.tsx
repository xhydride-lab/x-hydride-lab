import { cn } from "@/lib/utils/cn";

/**
 * Logomark — the X-Hydride Lab brand mark.
 *
 * Faithful SVG reproduction of the official banner artwork: a stepped /
 * pixelated X with a circular center hub, four corner pixels, four inner
 * pixels, and a soft cyan halo. Renders as inline SVG so it stays sharp
 * at any size. The optional `withFloor` flag adds the horizontal cyan
 * floor reflection seen in the brand banner.
 */
export function Logomark({
  size = 48,
  withFloor = false,
  className,
}: {
  size?: number;
  withFloor?: boolean;
  className?: string;
}) {
  // viewBox is square when no floor; taller when floor reflection is shown
  const vbW = 80;
  const vbH = withFloor ? 96 : 80;

  return (
    <svg
      width={size}
      height={(size * vbH) / vbW}
      viewBox={`0 0 ${vbW} ${vbH}`}
      fill="none"
      role="img"
      aria-label="X-Hydride Lab mark"
      className={cn("shrink-0", className)}
    >
      <defs>
        {/* Soft halo behind the mark */}
        <radialGradient id="xh-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(120,200,255,0.55)" />
          <stop offset="45%" stopColor="rgba(95,185,255,0.18)" />
          <stop offset="100%" stopColor="rgba(95,185,255,0)" />
        </radialGradient>

        {/* Floor reflection halo */}
        <radialGradient id="xh-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(110,200,255,0.65)" />
          <stop offset="50%" stopColor="rgba(95,185,255,0.18)" />
          <stop offset="100%" stopColor="rgba(95,185,255,0)" />
        </radialGradient>

        {/* Soft glow filter for the strokes */}
        <filter id="xh-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>

        {/* Stronger glow for inner highlights */}
        <filter id="xh-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* Outer halo */}
      <ellipse cx="40" cy="40" rx="38" ry="34" fill="url(#xh-halo)" />

      {/* The four stepped legs of the X.
          Center is at (40, 40). Each leg is a polyline of unit-step
          increments going to the corners. Coordinates are tuned so the
          shape matches the brand banner. */}
      <g
        stroke="#bfe2ff"
        strokeWidth="2.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
        filter="url(#xh-glow)"
      >
        {/* upper-left */}
        <polyline points="36,36 33,36 33,33 30,33 30,30 26,30 26,26 22,26 22,22 18,22 18,18" />
        {/* upper-right */}
        <polyline points="44,36 47,36 47,33 50,33 50,30 54,30 54,26 58,26 58,22 62,22 62,18" />
        {/* lower-right */}
        <polyline points="44,44 47,44 47,47 50,47 50,50 54,50 54,54 58,54 58,58 62,58 62,62" />
        {/* lower-left */}
        <polyline points="36,44 33,44 33,47 30,47 30,50 26,50 26,54 22,54 22,58 18,58 18,62" />
      </g>

      {/* Crisper bright overlay on the same legs (not blurred) */}
      <g
        stroke="#eaf5ff"
        strokeWidth="1.1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
        opacity="0.95"
      >
        <polyline points="36,36 33,36 33,33 30,33 30,30 26,30 26,26 22,26 22,22 18,22 18,18" />
        <polyline points="44,36 47,36 47,33 50,33 50,30 54,30 54,26 58,26 58,22 62,22 62,18" />
        <polyline points="44,44 47,44 47,47 50,47 50,50 54,50 54,54 58,54 58,58 62,58 62,62" />
        <polyline points="36,44 33,44 33,47 30,47 30,50 26,50 26,54 22,54 22,58 18,58 18,62" />
      </g>

      {/* Four corner pixels (terminator dots at the ends of each leg) */}
      <g fill="#dff0ff">
        <rect x="16.6" y="16.6" width="2.8" height="2.8" />
        <rect x="60.6" y="16.6" width="2.8" height="2.8" />
        <rect x="60.6" y="60.6" width="2.8" height="2.8" />
        <rect x="16.6" y="60.6" width="2.8" height="2.8" />
      </g>

      {/* Inner accent pixels just outside the hub */}
      <g fill="#9bd4ff">
        <rect x="32.2" y="32.2" width="1.8" height="1.8" />
        <rect x="46.0" y="32.2" width="1.8" height="1.8" />
        <rect x="46.0" y="46.0" width="1.8" height="1.8" />
        <rect x="32.2" y="46.0" width="1.8" height="1.8" />
      </g>

      {/* Center hub */}
      <circle
        cx="40"
        cy="40"
        r="4"
        fill="#0a0c13"
        stroke="#9bd4ff"
        strokeWidth="1.6"
      />
      <circle cx="40" cy="40" r="1.6" fill="#dff0ff" />
      <circle
        cx="40"
        cy="40"
        r="2"
        fill="#5fb9ff"
        opacity="0.55"
        filter="url(#xh-glow-strong)"
      />

      {/* Floor reflection — wide thin cyan halo beneath the mark */}
      {withFloor ? (
        <ellipse cx="40" cy="86" rx="34" ry="3" fill="url(#xh-floor)" />
      ) : null}
    </svg>
  );
}

/**
 * LogomarkLockup — Logomark + "X-HYDRIDE LAB" wordmark.
 *
 * The wordmark uses the Orbitron geometric sans (loaded via next/font in
 * the root layout) so it picks up the futuristic, evenly-tracked feel
 * shown in the brand banner. "X-HYDRIDE" is set bold, "LAB" lighter,
 * matching the source artwork.
 */
export function LogomarkLockup({
  size = 28,
  className,
  hideTextOnMobile = false,
}: {
  size?: number;
  className?: string;
  hideTextOnMobile?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 text-graphite-50",
        className,
      )}
    >
      <Logomark size={size} />
      <span
        className={cn(
          "select-none font-[family-name:var(--font-orbitron)]",
          hideTextOnMobile && "hidden sm:inline-flex",
          "inline-flex items-baseline gap-2",
        )}
      >
        <span
          className="text-[15px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ fontStretch: "expanded" }}
        >
          X&#8209;Hydride
        </span>
        <span className="text-[13px] font-normal uppercase tracking-[0.18em] text-graphite-300">
          Lab
        </span>
      </span>
    </span>
  );
}

/**
 * LogomarkBanner — Full hero-format brand artwork.
 *
 * Reproduces the official banner: large stepped X with floor reflection
 * on the left, "X-HYDRIDE LAB" wordmark on the right. Use on hero
 * surfaces where the brand should read at maximum scale.
 */
export function LogomarkBanner({
  className,
  markSize = 96,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-7 sm:gap-10",
        className,
      )}
    >
      <Logomark size={markSize} withFloor />
      <span className="inline-flex items-baseline gap-3 font-[family-name:var(--font-orbitron)] text-white">
        <span
          className="text-[28px] font-bold uppercase tracking-[0.12em] sm:text-[38px] lg:text-[48px]"
          style={{ fontStretch: "expanded" }}
        >
          X&#8209;Hydride
        </span>
        <span className="text-[22px] font-normal uppercase tracking-[0.18em] text-graphite-300 sm:text-[30px] lg:text-[38px]">
          Lab
        </span>
      </span>
    </div>
  );
}
