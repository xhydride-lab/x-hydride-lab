import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const X_HANDLE_URL = "https://x.com/xhydride?s=21";

/**
 * XLink — small inline link to the project's X (formerly Twitter) account.
 * Renders the official X glyph; subtle by default so it doesn't compete
 * with primary product navigation.
 */
export function XLink({
  className,
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href={X_HANDLE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="X-Hydride Lab on X"
      className={cn(
        "focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full text-graphite-300 transition-colors hover:bg-white/[0.05] hover:text-graphite-50",
        className,
      )}
    >
      <XGlyph size={size} />
    </Link>
  );
}

/**
 * Raw X logo glyph. Used inside XLink, but exported so other call sites can
 * reuse it (e.g. on the community footer block).
 */
export function XGlyph({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export { X_HANDLE_URL };
