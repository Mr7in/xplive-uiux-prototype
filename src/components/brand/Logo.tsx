import { cn } from "@/lib/utils";

/*
 * balz.tv "Odds Ball" logo, from the balz.tv design system.
 * "balz" in Outfit ExtraBold, outlined; the "a" is an odds ring split 62 / 38
 * (YES lime from the left over the top, NO coral underneath) with a solid stem.
 * The split is fixed: live odds belong to <OddsRing>, never the logo. The logo never animates in product UI.
 * Letters use currentColor (ink), so the wordmark follows the light/dark theme.
 */
const LIME = "#C8FF00";
const CORAL = "#FF4D6D";

const B = "M342 -10Q295 -10 255 9Q237 17 221 28V0H51V729H225V466Q239 476 256 483Q296 499 342 499Q413 499 467.0 466.5Q521 434 551.5 376.0Q582 318 582 244Q582 171 551.5 113.5Q521 56 467.0 23.0Q413 -10 342 -10ZM311 145Q339 145 360.5 158.0Q382 171 394.0 193.5Q406 216 406 245Q406 273 394.0 295.5Q382 318 360.0 331.0Q338 344 310.0 344.0Q282 344 260.5 331.0Q239 318 227.0 296.0Q215 274 215 245Q215 215 227.0 192.5Q239 170 261.0 157.5Q283 145 311 145Z";
const L = "M51 0V729H225V0Z";
const Z = "M22 0V104L223 347H39V489H469V385L268 142H463V0Z";

/** Horizontal wordmark. `size` is the rendered height in px (cap height ≈ 0.95 × size). Minimum 72px wide on screen. */
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  const h = size;
  const w = Math.round((h * 1788) / 765);
  return (
    <svg viewBox="40 -745 1788 765" width={w} height={h} role="img" aria-label="balz" className={cn("block shrink-0 text-foreground", className)}>
      <path transform="scale(1 -1)" d={B} fill="currentColor" />
      <path d="M981.8 -124.1 A180 180 0 0 1 689.5 -159.1" fill="none" stroke={CORAL} strokeWidth="140" />
      <path d="M689.5 -159.1 A180 180 0 0 1 981.8 -364.9" fill="none" stroke={LIME} strokeWidth="140" />
      <rect x="933" y="-499" width="165" height="499" fill="currentColor" />
      <path transform="translate(1113 0) scale(1 -1)" d={L} fill="currentColor" />
      <path transform="translate(1349 0) scale(1 -1)" d={Z} fill="currentColor" />
    </svg>
  );
}

/** The "a" alone: avatars, watermarks, small brand moments. */
export function LogoGlyph({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="-15 -560 600 620" height={size} width={Math.round((size * 600) / 620)} role="img" aria-label="balz" className={cn("block shrink-0 text-foreground", className)}>
      <path d="M418.8 -124.1 A180 180 0 0 1 126.5 -159.1" fill="none" stroke={CORAL} strokeWidth="140" />
      <path d="M126.5 -159.1 A180 180 0 0 1 418.8 -364.9" fill="none" stroke={LIME} strokeWidth="140" />
      <rect x="370" y="-499" width="165" height="499" fill="currentColor" />
    </svg>
  );
}

/** App icon: the mark on a black rounded square (always black, in both themes). */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} aria-hidden="true" className={cn("block shrink-0", className)}>
      <rect width="1024" height="1024" rx="225" fill="#000" />
      <g transform="translate(222 796) scale(1.16) translate(-35 0)">
        <path d="M418.8 -124.1 A180 180 0 0 1 126.5 -159.1" fill="none" stroke={CORAL} strokeWidth="140" />
        <path d="M126.5 -159.1 A180 180 0 0 1 418.8 -364.9" fill="none" stroke={LIME} strokeWidth="140" />
        <rect x="370" y="-499" width="165" height="499" fill="#fff" />
      </g>
    </svg>
  );
}
