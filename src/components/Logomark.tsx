import { cn } from "@/lib/utils/cn";

/* -----------------------------------------------------------------------------
 * Logomark — Apple-grade SVG reproduction of the X-Hydride Lab brand artwork.
 * ----------------------------------------------------------------------------
 * The mark is a solid pixel-block "X" rendered in vivid teal-cyan with a soft
 * halo. The wordmark uses the system SF Pro stack so Apple's optical metrics
 * carry through to the page; "X-Hydride" is set in semibold and "Lab" sits
 * beside it in regular weight, matching the source artwork.
 * -------------------------------------------------------------------------- */

const TEAL = "#1de9c6";
const TEAL_BRIGHT = "#a7f4e6";
const TEAL_HALO = "rgba(29,233,198,0.55)";
const TEAL_HALO_MID = "rgba(45,212,212,0.18)";

/**
 * Pure mark — the stepped-X glyph alone. `size` is the rendered width in
 * pixels. When `withFloor` is true the SVG keeps a 80×96 viewBox and adds
 * the horizontal cyan reflection seen in the brand banner.
 */
export function Logomark({
  size = 28,
  withFloor = false,
  className,
}: {
  size?: number;
  withFloor?: boolean;
  className?: string;
}) {
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
      className={cn("shrink-0 select-none", className)}
    >
      <defs>
        <radialGradient id="xh-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TEAL_HALO} />
          <stop offset="50%" stopColor={TEAL_HALO_MID} />
          <stop offset="100%" stopColor="rgba(29,233,198,0)" />
        </radialGradient>
        <radialGradient id="xh-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(120,250,230,0.85)" />
          <stop offset="40%" stopColor={TEAL_HALO_MID} />
          <stop offset="100%" stopColor="rgba(29,233,198,0)" />
        </radialGradient>
        <filter id="xh-bloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.65" />
        </filter>
        <filter id="xh-bloom-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Outer halo */}
      <ellipse cx="40" cy="40" rx="34" ry="30" fill="url(#xh-halo)" />

      {/* Soft glow sitting beneath the solid mark */}
      <g fill={TEAL} filter="url(#xh-bloom-strong)" opacity="0.55">
        {LegBlocks()}
        <rect x="35" y="35" width="10" height="10" />
      </g>

      {/* Solid X — pixel blocks in vivid teal */}
      <g fill={TEAL} filter="url(#xh-bloom)">
        {LegBlocks()}
      </g>

      {/* Inner highlight — the same blocks shrunk and brightened */}
      <g fill={TEAL_BRIGHT} opacity="0.85">
        {LegBlocks(1.4)}
      </g>

      {/* Center hub */}
      <rect x="35.5" y="35.5" width="9" height="9" fill={TEAL} />
      <rect x="37.5" y="37.5" width="5" height="5" fill={TEAL_BRIGHT} />

      {/* Floor reflection */}
      {withFloor ? (
        <ellipse cx="40" cy="88" rx="30" ry="2.6" fill="url(#xh-floor)" />
      ) : null}
    </svg>
  );
}

/**
 * Renders the four legs as a sequence of <rect> blocks. `inset` shrinks the
 * blocks symmetrically so the highlight pass can sit on top of the base
 * pass without overdraw at the edges.
 */
function LegBlocks(inset = 0) {
  // Each leg is described by a series of (x, y) top-left coords for 6×6 blocks
  // stepping outward from the center hub. Coordinates are tuned to match the
  // brand banner.
  const baseSize = 6;
  const size = baseSize - inset * 2;
  const off = inset;
  const legs: [number, number][][] = [
    // upper-left
    [
      [33, 33],
      [28, 28],
      [22, 22],
      [17, 17],
    ],
    // upper-right
    [
      [41, 33],
      [46, 28],
      [52, 22],
      [57, 17],
    ],
    // lower-right
    [
      [41, 41],
      [46, 46],
      [52, 52],
      [57, 57],
    ],
    // lower-left
    [
      [33, 41],
      [28, 46],
      [22, 52],
      [17, 57],
    ],
  ];
  return (
    <>
      {legs.flatMap((leg, li) =>
        leg.map(([x, y], bi) => (
          <rect
            key={`${li}-${bi}`}
            x={x + off}
            y={y + off}
            width={size}
            height={size}
          />
        )),
      )}
    </>
  );
}

/**
 * LogomarkLockup — the inline mark + "X-Hydride Lab" wordmark used in the
 * Topbar and landing nav. Wordmark uses the system SF Pro stack with tight
 * Apple-style display tracking; "X-Hydride" semibold, "Lab" regular weight.
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
        "flex items-center gap-2.5 text-graphite-50",
        className,
      )}
    >
      <Logomark size={size} />
      <span
        className={cn(
          "select-none text-[15px] font-semibold tracking-[-0.012em]",
          hideTextOnMobile && "hidden sm:inline-flex",
          "items-baseline gap-1.5",
        )}
      >
        <span>X&#8209;Hydride</span>
        <span className="font-normal text-graphite-300">Lab</span>
      </span>
    </span>
  );
}

/**
 * LogomarkBanner — large hero-format brand artwork. Mark is rendered with
 * its floor reflection; wordmark is set in display weight beside it.
 */
export function LogomarkBanner({
  className,
  markSize = 96,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <div className={cn("flex items-center gap-6 sm:gap-8", className)}>
      <Logomark size={markSize} withFloor />
      <span className="inline-flex items-baseline gap-3 text-white">
        <span
          className="text-[34px] font-semibold tracking-[-0.022em] sm:text-[44px] lg:text-[56px]"
        >
          X&#8209;Hydride
        </span>
        <span className="text-[26px] font-normal tracking-[-0.016em] text-graphite-300 sm:text-[34px] lg:text-[42px]">
          Lab
        </span>
      </span>
    </div>
  );
}
