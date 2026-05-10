import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Brand artwork — single canonical PNG that contains both the stepped-X
 * mark and the "X-HYDRIDE LAB" wordmark with the floor reflection. We
 * render it via next/image and expose three named entry points so the
 * existing call sites keep working without changes.
 */
const SRC = "/x-hydride-lab-logo.png";
const INTRINSIC_W = 1672;
const INTRINSIC_H = 941;
const RATIO = INTRINSIC_W / INTRINSIC_H; // ≈ 1.777

/**
 * Logomark — small inline brand artwork. `size` is the rendered HEIGHT
 * in pixels; width follows the intrinsic aspect ratio.
 */
export function Logomark({
  size = 28,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const w = Math.round(size * RATIO);
  return (
    <Image
      src={SRC}
      alt="X-Hydride Lab"
      width={w}
      height={size}
      priority={priority}
      sizes={`${w}px`}
      className={cn("shrink-0 select-none", className)}
      style={{ height: size, width: "auto" }}
      draggable={false}
    />
  );
}

/**
 * LogomarkLockup — alias of Logomark. The artwork already contains the
 * wordmark, so the historical "lockup" concept folds into a single
 * component. The `hideTextOnMobile` prop is retained as a no-op for
 * backward compatibility with existing call sites.
 */
export function LogomarkLockup({
  size = 28,
  className,
  hideTextOnMobile: _hideTextOnMobile,
}: {
  size?: number;
  className?: string;
  hideTextOnMobile?: boolean;
}) {
  void _hideTextOnMobile;
  return <Logomark size={size} className={className} />;
}

/**
 * LogomarkBanner — large hero-format brand artwork. Same PNG, sized for
 * landing-hero usage. `markSize` is kept as the parameter name so the
 * existing landing page call site keeps working; it now refers to the
 * rendered height of the full banner.
 */
export function LogomarkBanner({
  className,
  markSize = 96,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <Logomark
      size={markSize}
      className={cn("max-w-full", className)}
      priority
    />
  );
}
