import * as React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, CheckCircle2, CircleSlash, Hourglass, Radio, BadgeCheck } from "lucide-react";
import { cn, compact, compactUSDC, fmt, fmtUSDC, timeLeft } from "@/lib/utils";
import { avatarUrl } from "@/lib/avatar";
import { frameUrl } from "@/data/videos";
import { channelState } from "@/lib/ledger";
import { LivePlayer } from "@/components/LivePlayer";
import { BoxArt } from "@/components/brand/BoxArt";
import { categories, categoryBySlug, type Category } from "@/data/categories";
import { streamerByHandle, streamers, initials, type Streamer } from "@/data/streamers";
import { multiplier, pool, yesPct, type Market } from "@/data/markets";
import { CoverArt } from "@/components/brand/CoverArt";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

/** balz.tv LiveBadge: coral-soft pill, pulsing coral dot (1.6s), sentence case. Coral is only ever NO or live. */
export function LiveBadge({ className, children = "Live" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-2.5 py-1 text-xs font-semibold leading-4 text-foreground", className)}>
      <span className="h-2 w-2 animate-live-pulse rounded-full bg-live motion-reduce:animate-none" aria-hidden="true" />
      {children}
    </span>
  );
}

/** balz.tv OddsRing: the logo's ring, carrying live odds. YES lime from the top clockwise, NO coral; animates over 400ms. */
export function OddsRing({ yes, size = 56, className }: { yes: number; size?: number; className?: string }) {
  const y = Math.max(0, Math.min(100, yes));
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`YES ${y}%, NO ${100 - y}%`} className={cn("shrink-0", className)}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="rgb(var(--no))" strokeWidth={16} />
      <circle cx={50} cy={50} r={r} fill="none" stroke="rgb(var(--yes))" strokeWidth={16} strokeDasharray={`${(c * y) / 100} ${c}`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 400ms ease-out" }} />
    </svg>
  );
}

export function ViewerCount({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px] tabular", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
      {compact(n)}
      <span className="sr-only">viewers</span>
    </span>
  );
}

export function ChannelAvatar({ s, size = 40, ring = true, className }: { s: Pick<Streamer, "name" | "color" | "live"> & { handle?: string; avatar?: string }; size?: number; ring?: boolean; className?: string }) {
  const src = s.avatar ?? avatarUrl(s.handle ?? s.name);
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2", className)}
      style={{ width: size, height: size, boxShadow: ring && s.live ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(var(--live))` : undefined }}
      aria-hidden="true"
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

export function Verified() {
  return <BadgeCheck className="inline h-3.5 w-3.5 text-label" aria-label="Verified creator" />;
}

/** Stream thumbnail: category art cropped per channel (swap for the live preview frame from the media service). */
export function StreamThumb({ s, className, children, frame }: { s: Streamer; className?: string; children?: React.ReactNode; frame?: 1 | 2 | 3 }) {
  const cat = categoryBySlug(s.category)!;
  const seed = s.handle.length + s.name.length;
  const pos = `50% ${15 + (seed % 5) * 12}%`;
  const src = frameUrl(s.handle, frame);
  const [failed, setFailed] = React.useState(false);
  return (
    <span className={cn("relative block aspect-video overflow-hidden rounded-xl bg-surface", className)}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={cn("absolute inset-0 h-full w-full object-cover", !s.live && "opacity-60 grayscale")} />
      ) : (
        <BoxArt c={cat} seed={seed} position={pos} dim={!s.live} size={[600, 800]} imgClassName="scale-105" />
      )}
      {children}
    </span>
  );
}

/** One line under the title saying whether the channel has a question open. */
export function MarketStatusLine({ s, className }: { s: Streamer; className?: string }) {
  const { markets } = useStore();
  const st = channelState(s.handle, markets);
  if (!s.live || st.kind === "none") return null;
  if (st.kind === "soon") return <p className={cn("text-sm text-muted-foreground", className)}>Next question soon</p>;
  return (
    <p className={cn("text-sm font-medium text-foreground", className)}>
      Question open · closes in <span className="font-mono tabular">{timeLeft(st.m.secondsLeft ?? 0)}</span>
    </p>
  );
}

export function StreamCard({ s, className }: { s: Streamer; className?: string }) {
  const cat = categoryBySlug(s.category)!;
  // Hover preview like a real streaming site: after a short dwell, play the live video muted.
  const [preview, setPreview] = React.useState(false);
  const timer = React.useRef<number>();
  const enter = () => { if (!s.live || !window.matchMedia("(hover: hover)").matches) return; timer.current = window.setTimeout(() => setPreview(true), 650); };
  const leave = () => { window.clearTimeout(timer.current); setPreview(false); };
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const Thumb = preview ? LivePlayer : StreamThumb;
  return (
    <div className={cn("group flex min-w-0 flex-col gap-3", className)}>
      <Link to={`/${s.handle}`} onMouseEnter={enter} onMouseLeave={leave} className="block rounded-xl outline-offset-4" aria-label={`${s.name}: ${s.title}`}>
        <Thumb s={s} className="ring-1 ring-transparent transition group-hover:ring-foreground/40">
          <span className="absolute left-2 top-2 flex gap-1.5">{s.live ? <LiveBadge /> : <Badge variant="muted">Offline</Badge>}</span>
          {s.live && (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/80 px-2 py-0.5 text-white">
              <ViewerCount n={s.viewers} />
            </span>
          )}
        </Thumb>
      </Link>
      <div className="flex gap-2.5">
        <Link to={`/${s.handle}`} tabIndex={-1}><ChannelAvatar s={s} size={36} /></Link>
        <div className="min-w-0">
          <Link to={`/${s.handle}`} className="line-clamp-1 font-semibold leading-snug hover:underline">{s.title}</Link>
          <p className="truncate text-sm text-label">
            <Link to={`/${s.handle}`} className="hover:text-foreground">{s.name}</Link> {s.verified && <Verified />} · <Link to={`/category/${cat.slug}`} className="hover:text-foreground">{cat.name}</Link>
          </p>
          <MarketStatusLine s={s} className="mt-0.5" />
        </div>
      </div>
    </div>
  );
}

export function categoryStats(slug: string) {
  const list = streamers.filter((s) => s.category === slug);
  return { viewers: list.reduce((a, s) => a + (s.live ? s.viewers : 0), 0), live: list.filter((s) => s.live).length };
}

export function CategoryCard({ c, className }: { c: Category; className?: string }) {
  const st = categoryStats(c.slug);
  return (
    <Link to={`/category/${c.slug}`} className={cn("group flex min-w-0 flex-col gap-2", className)}>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-surface ring-1 ring-border transition group-hover:-translate-y-0.5 group-hover:ring-foreground/40">
        <BoxArt c={c} />
        {c.adult && <span className="absolute right-2 top-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">18+</span>}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold group-hover:underline">{c.name}</span>
        <span className="block font-mono text-xs text-label tabular">{compact(st.viewers)} watching</span>
        <span className="mt-1 flex flex-wrap gap-1">{c.tags.slice(0, 2).map((t) => <Badge key={t} variant="muted" className="font-normal">{t}</Badge>)}</span>
      </span>
    </Link>
  );
}

export function SplitBar({ m, className, thin }: { m: Pick<Market, "yesPool" | "noPool">; className?: string; thin?: boolean }) {
  const p = yesPct(m);
  return (
    <div className={cn("flex w-full gap-[3px]", thin ? "h-1.5" : "h-2", className)} role="img" aria-label={`${p}% YES, ${100 - p}% NO`}>
      <span className="rounded-[4px] bg-yes-fill transition-[width] [transition-duration:400ms] ease-out" style={{ width: `${p}%` }} />
      <span className="rounded-[4px] bg-no-fill transition-[width] [transition-duration:400ms] ease-out" style={{ width: `${100 - p}%` }} />
    </div>
  );
}

export function MarketStatus({ m }: { m: Market }) {
  if (m.status === "open")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Clock className="h-3.5 w-3.5" /> <span className="font-mono tabular">{timeLeft(m.secondsLeft ?? 0)}</span>
      </span>
    );
  if (m.status === "awaiting") return <Badge variant="warning"><Hourglass className="h-3 w-3" /> Awaiting result</Badge>;
  if (m.status === "voided") return <Badge variant="muted"><CircleSlash className="h-3 w-3" /> Voided</Badge>;
  if (m.dispute) return <Badge variant="danger">Disputed</Badge>;
  return (
    <Badge variant={m.outcome === "YES" ? "yes" : "no"}>
      <CheckCircle2 className="h-3 w-3" /> Result: {m.outcome}
    </Badge>
  );
}

export function SideChip({ side, className }: { side: "YES" | "NO"; className?: string }) {
  return <Badge variant={side === "YES" ? "yes" : "no"} className={cn("font-bold", className)}>{side}</Badge>;
}

/** Compact market tile used in grids (home, markets, category). */
export function MarketCard({ m, className }: { m: Market; className?: string }) {
  const s = streamerByHandle(m.handle)!;
  const p = yesPct(m);
  return (
    <Link
      to={`/${m.handle}`}
      className={cn("group flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 transition hover:border-input", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <ChannelAvatar s={s} size={24} ring={false} />
          <span className="truncate text-sm text-label">{s.name}</span>
          {s.live && m.status === "open" && <LiveBadge />}
        </span>
        <MarketStatus m={m} />
      </div>
      <div className="flex items-center gap-3">
        <OddsRing yes={p} size={48} />
        <p className="line-clamp-2 min-h-[3.25rem] font-display text-xl font-semibold leading-[26px] group-hover:underline">{m.question}</p>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between font-mono text-[13px] leading-[18px] tabular">
          <span className="text-yes">YES <b>{p}%</b></span>
          <span className="text-no">NO <b>{100 - p}%</b></span>
        </div>
        <SplitBar m={m} />
        <p className="text-xs font-medium text-muted-foreground"><span className="font-mono tabular">{compactUSDC(pool(m))}</span> pool · {fmt(m.predictors)} predictors</p>
      </div>
      {m.status === "open" && (
        <div className="grid grid-cols-2 gap-3">
          <span className="flex h-11 items-center justify-between rounded-lg border border-yes-fill px-3 text-[15px] font-semibold text-yes">Yes <span className="font-mono text-xs">{multiplier(m, "YES").toFixed(2)}×</span></span>
          <span className="flex h-11 items-center justify-between rounded-lg border border-no-fill px-3 text-[15px] font-semibold text-no">No <span className="font-mono text-xs">{multiplier(m, "NO").toFixed(2)}×</span></span>
        </div>
      )}
    </Link>
  );
}

export function PageHeader({ title, description, actions, eyebrow, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="font-display text-[32px] font-bold leading-[36px] md:text-[40px] md:leading-[44px]">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({ title, href, linkLabel = "See all", count }: { title: string; href?: string; linkLabel?: string; count?: number }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[22px] font-bold leading-7 md:text-[28px] md:leading-8">
        {title}
        {count !== undefined && <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{count}</span>}
      </h2>
      {href && <Link to={href} className="text-sm text-label hover:text-foreground">{linkLabel} →</Link>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Radio, title, body, action }: { icon?: React.ElementType; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border text-label"><Icon className="h-6 w-6" /></span>
      <p className="font-display text-xl font-semibold leading-[26px]">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, tone, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "neon" | "yes" | "no" | "warn" | "danger"; className?: string }) {
  const toneCls = { neon: "text-neon", yes: "text-yes", no: "text-no", warn: "text-warn", danger: "text-foreground" }[tone ?? "neon"];
  return (
    <div className={cn("rounded-2xl border bg-card p-4", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-[28px] font-bold leading-8 tabular", tone ? toneCls : "text-foreground")}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export const totalPredictors = (list: Market[]) => list.reduce((a, m) => a + m.predictors, 0);
export const allCategories = categories;
export { fmtUSDC };
export { Users };
