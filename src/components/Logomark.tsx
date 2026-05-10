import { cn } from "@/lib/utils/cn";

/**
 * Logomark — the X-Hydride Lab brand mark.
 *
 * Renders the official stepped-X icon as inline SVG so it stays sharp at
 * any size and can be re-colored via Tailwind classes.
 */
export function Logomark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="X-Hydride Lab mark"
      className={cn("shrink-0", className)}
    >
      <defs>
        <radialGradient id="xh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(95,185,255,0.55)" />
          <stop offset="60%" stopColor="rgba(95,185,255,0.18)" />
          <stop offset="100%" stopColor="rgba(95,185,255,0.0)" />
        </radialGradient>
        <filter id="xh-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      <circle cx="24" cy="24" r="22" fill="url(#xh-glow)" />

      <g
        stroke="#9bd4ff"
        strokeWidth="2"
        strokeLinecap="square"
        filter="url(#xh-soft)"
      >
        <polyline points="24,24 21,24 21,21 18,21 18,18 14,18 14,14 10,14 10,10" />
        <polyline points="24,24 27,24 27,21 30,21 30,18 34,18 34,14 38,14 38,10" />
        <polyline points="24,24 27,24 27,27 30,27 30,30 34,30 34,34 38,34 38,38" />
        <polyline points="24,24 21,24 21,27 18,27 18,30 14,30 14,34 10,34 10,38" />
      </g>

      <g fill="#cfeaff">
        <rect x="9" y="9" width="2" height="2" />
        <rect x="37" y="9" width="2" height="2" />
        <rect x="37" y="37" width="2" height="2" />
        <rect x="9" y="37" width="2" height="2" />
      </g>

      <g fill="#5fb9ff" opacity="0.85">
        <rect x="17" y="17" width="1.4" height="1.4" />
        <rect x="29.6" y="17" width="1.4" height="1.4" />
        <rect x="29.6" y="29.6" width="1.4" height="1.4" />
        <rect x="17" y="29.6" width="1.4" height="1.4" />
      </g>

      <circle cx="24" cy="24" r="3" fill="#070910" stroke="#9bd4ff" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="1.2" fill="#cfeaff" />
    </svg>
  );
}

/**
 * LogomarkLockup — Logomark + "X-Hydride Lab" wordmark, used in the
 * navigation bars. Wordmark uses tighter Apple-style tracking and
 * regular weight so the brand reads as a single mark, not as two
 * separate words competing for attention.
 */
export function LogomarkLockup({
  size = 24,
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
          "select-none text-[15px] font-semibold tracking-tight",
          hideTextOnMobile && "hidden sm:inline",
        )}
      >
        X&#8209;Hydride
        <span className="ml-1 font-normal text-graphite-400">Lab</span>
      </span>
    </span>
  );
}
