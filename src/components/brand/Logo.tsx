import { cn } from "@/lib/utils";

/** Compact horizontal wordmark from the xp.live CVI: x with neon underline, neon p, ".live" and the coral live dot. */
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex select-none items-baseline leading-none", className)} aria-label="xp.live">
      <span className="font-display font-black text-foreground" style={{ fontSize: size, letterSpacing: -size * 0.07 }} aria-hidden="true">
        <span className="relative inline-block">
          x
          <span className="absolute rounded-full" style={{ background: "rgb(var(--logo-accent))", left: size * 0.04, right: -size * 0.04, bottom: size * 0.05, height: Math.max(2, size * 0.075) }} />
        </span>
        <span style={{ color: "rgb(var(--logo-accent))" }}>p</span>
      </span>
      <span className="font-display text-muted-foreground" style={{ fontSize: size * 0.44, marginLeft: 1, letterSpacing: -size * 0.01 }} aria-hidden="true">
        <span className="font-extrabold" style={{ color: "rgb(var(--logo-accent))" }}>.</span>live
      </span>
      <span className="ml-1 inline-block animate-live-pulse rounded-full bg-live" style={{ width: Math.max(4, size * 0.13), height: Math.max(4, size * 0.13), transform: `translateY(-${size * 0.5}px)` }} aria-hidden="true" />
    </span>
  );
}

/** App icon / favicon mark: "xp" on surface with the neon bar. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center border border-input bg-surface-2", className)}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
      aria-hidden="true"
    >
      <span className="font-display font-black text-foreground" style={{ fontSize: size * 0.45, letterSpacing: -size * 0.04, lineHeight: 1, marginTop: -size * 0.06 }}>xp</span>
      <span className="absolute rounded-full bg-lime" style={{ bottom: size * 0.17, width: size * 0.3, height: Math.max(2, size * 0.04) }} />
    </span>
  );
}
