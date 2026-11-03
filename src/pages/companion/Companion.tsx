import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, ChevronDown, Clock, Eye, EyeOff, Hourglass, Keyboard, Lock, LogOut, Menu, MonitorSmartphone, Pencil, Plus, Smartphone, Sun, TimerReset, Unlock, Vibrate, XCircle } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { accounts, useStore } from "@/lib/store";
import { streamerByHandle, type Streamer } from "@/data/streamers";
import { pool, yesPct, type Market, type Side } from "@/data/markets";
import { DURATIONS, EVIDENCE, VOID_REASONS, genericPresets, type Preset } from "@/data/companion";
import { LOAD, closedAt, sideCounts, paidOut, ago } from "@/lib/ledger";
import { ChannelAvatar, LiveBadge, SplitBar } from "@/components/xp";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn, compact, fmt, fmtUSDC, timeLeft } from "@/lib/utils";

/* ───────────────────────── helpers ───────────────────────── */

function useNow(ms = 1000) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), ms); return () => window.clearInterval(t); }, [ms]);
  return now;
}

const two = (n: number) => String(n).padStart(2, "0");
const hms = (sec: number) => { const s = Math.max(0, Math.floor(sec)); return `${Math.floor(s / 3600)}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`; };
const streamStart = (s: Streamer) => LOAD - (s.startedMinsAgo ?? 0) * 60_000;
const AUTO_VOID_MS = 60 * 60_000;

interface Settings { hold: number; haptics: boolean; awake: boolean }
const SETTINGS_KEY = "xplive.companion";
function readSettings(): Settings {
  const d: Settings = { hold: 800, haptics: true, awake: true };
  try { return { ...d, ...JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return d; }
}
const SettingsCtx = React.createContext<Settings>(readSettings());
function buzz(on: boolean, pattern: number | number[]) {
  if (!on) return;
  try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
}

/**
 * Press-and-hold button: the action only fires after the button has been held for the hold time,
 * so a bump or a stray tap during a game can't settle a question. Works with touch, mouse,
 * Space/Enter and an optional global hotkey (desktop second monitor).
 */
function HoldButton({ onConfirm, children, className, fill = "bg-black/25", disabled, hotkey, label, ms }: {
  onConfirm: () => void; children: React.ReactNode; className?: string; fill?: string; disabled?: boolean; hotkey?: string; label: string; ms?: number;
}) {
  const settings = React.useContext(SettingsCtx);
  const hold = ms ?? settings.hold;
  const [p, setP] = React.useState(0);
  const raf = React.useRef<number>();
  const start = React.useRef<number | null>(null);
  const cb = React.useRef(onConfirm);
  cb.current = onConfirm;
  const begin = React.useCallback(() => {
    if (disabled || start.current !== null) return;
    start.current = performance.now();
    buzz(settings.haptics, 8);
    const step = (t: number) => {
      if (start.current === null) return;
      const k = Math.min(1, (t - start.current) / hold);
      setP(k);
      if (k >= 1) {
        start.current = null;
        buzz(settings.haptics, 35);
        cb.current();
        window.setTimeout(() => setP(0), 180);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [disabled, hold, settings.haptics]);
  const cancel = React.useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (start.current !== null) setP(0);
    start.current = null;
  }, []);
  React.useEffect(() => {
    if (!hotkey) return;
    const typing = () => { const el = document.activeElement; return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA"); };
    const down = (e: KeyboardEvent) => { if (e.key.toLowerCase() === hotkey && !e.repeat && !typing() && !e.metaKey && !e.ctrlKey) begin(); };
    const up = (e: KeyboardEvent) => { if (e.key.toLowerCase() === hotkey) cancel(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [hotkey, begin, cancel]);
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${label}. Press and hold to confirm.`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); begin(); }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") cancel(); }}
      onContextMenu={(e) => e.preventDefault()}
      className={cn("relative touch-none select-none overflow-hidden transition-transform active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", className)}
    >
      <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0", fill)} style={{ width: `${p * 100}%` }} />
      <span className="relative flex h-full w-full flex-col items-center justify-center">{children}</span>
    </button>
  );
}

const Kbd = ({ k }: { k: string }) => <kbd className="hidden rounded border border-current/30 px-1.5 font-mono text-[11px] leading-5 opacity-70 lg:inline">{k}</kbd>;

/* ───────────────────────── login ───────────────────────── */

function CompanionLogin({ s }: { s: Streamer }) {
  const { user, signIn, signOut } = useStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const wrongUser = user && user.channel !== s.handle;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter the email you log in to xp.live with.");
    if (password.length < 6) return setError("Passwords are at least 6 characters.");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const acc = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!acc) return setError("That email and password don’t match an account.");
      if (acc.channel !== s.handle) return setError(`This account doesn’t own ${s.name}. Only the channel owner can use these controls.`);
      signIn(acc.email);
      toast.success("Controls unlocked", { description: "Keep this screen beside your game." });
    }, 350);
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-sm text-label"><LogoMark size={28} /> Streamer controls</div>
        <div className="flex items-center gap-3">
          <ChannelAvatar s={s} size={56} />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold">{s.name}</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">{s.live ? <><LiveBadge /> {compact(s.viewers)} watching</> : "Offline"}</p>
          </div>
        </div>
        <p className="mt-5 text-label">Log in to start, close and settle your questions from this screen while you play.</p>

        {wrongUser && (
          <div className="mt-5 rounded-xl border bg-card p-4 text-sm">
            <p>You’re logged in as <b>{user!.name}</b>, which doesn’t own this channel.</p>
            <button type="button" onClick={signOut} className="mt-2 font-semibold underline underline-offset-2">Log out and switch account</button>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-pass">Password</Label>
            <div className="relative">
              <Input id="c-pass" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pr-11 text-base" />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral-soft">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Checking…" : "Unlock controls"}</Button>
        </form>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          This link belongs to {s.name}. Anyone else who opens it only sees this screen. You can sign devices out in Studio › Companion app.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── panels ───────────────────────── */

function Countdown({ sec }: { sec: number }) {
  const low = sec <= 10;
  return <span className={cn("font-mono font-bold tabular-nums", low && "text-coral")}>{timeLeft(sec)}</span>;
}

function RunningPanel({ m, onVoid }: { m: Market; onVoid: (id: string) => void }) {
  const { closeMarket, extendMarket } = useStore();
  const settings = React.useContext(SettingsCtx);
  const sec = m.secondsLeft ?? 0;
  return (
    <section aria-label="Running question" className="flex h-full flex-col gap-4 rounded-3xl border border-neon/30 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-neon"><span className="h-2.5 w-2.5 animate-live-pulse rounded-full bg-lime" /> Live on stream</span>
        <span className="font-mono text-xs text-muted-foreground">{fmt(m.predictors)} in · {fmtUSDC(pool(m))}</span>
      </div>
      <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{m.question}</p>
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs text-muted-foreground">Closes in</p><p className="text-6xl leading-none sm:text-7xl"><Countdown sec={sec} /></p></div>
        <div className="text-right font-mono text-sm"><p className="text-yes">YES {yesPct(m)}%</p><p className="text-no">NO {100 - yesPct(m)}%</p></div>
      </div>
      <SplitBar m={m} />
      <div className="mt-auto grid grid-cols-3 gap-2">
        {[30, 60, 300].map((x) => (
          <Button key={x} variant="secondary" className="h-14 text-base" onClick={() => { extendMarket(m.id, x); buzz(settings.haptics, 10); }}>
            <TimerReset /> +{x < 60 ? `${x}s` : `${x / 60}m`}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <HoldButton label="Close predictions now" hotkey="c" ms={500} onConfirm={() => { closeMarket(m.id); toast("Predictions closed", { description: "Settle it once it’s decided on stream." }); }} className="h-16 rounded-2xl bg-foreground text-lg font-bold text-background" fill="bg-background/25">
          <span className="flex items-center gap-2"><XCircle className="h-5 w-5" /> Hold to close now <Kbd k="C" /></span>
        </HoldButton>
        <Button variant="outline" className="h-16 rounded-2xl px-5 text-base" onClick={() => onVoid(m.id)}>Void</Button>
      </div>
    </section>
  );
}

function AskPanel({ s, blocked }: { s: Streamer; blocked: boolean }) {
  const { presets, createMarket } = useStore();
  const list = presets[s.handle] ?? genericPresets;
  const [pick, setPick] = React.useState<Preset | null>(null);
  const [custom, setCustom] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [dur, setDur] = React.useState(120);
  const question = custom ? q.trim() : pick?.question ?? "";
  const ok = question.length >= 10 && question.endsWith("?");
  const choose = (p: Preset) => { setCustom(false); setPick(p); setDur(p.seconds); };
  const start = () => {
    if (!ok || blocked) return;
    createMarket(s.handle, question, (!custom && pick?.rule) || "Settled on what viewers can see on stream.", dur);
    toast.success("Question is live", { description: `Open for ${DURATIONS.find((d) => d.s === dur)?.l ?? timeLeft(dur)}.` });
    setPick(null); setQ(""); setCustom(false);
  };
  return (
    <section aria-label="Ask a question" className="flex h-full flex-col gap-4 rounded-3xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Ask a question</h2>
        <span className="text-xs text-muted-foreground">YES / NO only</span>
      </div>
      <div role="radiogroup" aria-label="Saved questions" className="grid gap-2">
        {list.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={!custom && pick?.id === p.id} onClick={() => choose(p)}
            className={cn("flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition", !custom && pick?.id === p.id ? "border-neon bg-neon-dim" : "hover:border-input")}>
            <span className="font-medium leading-snug">{p.question}</span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{timeLeft(p.seconds)}</span>
          </button>
        ))}
        {!custom ? (
          <button type="button" onClick={() => { setCustom(true); setPick(null); }} className="flex min-h-[52px] items-center gap-2 rounded-2xl border border-dashed px-4 text-sm text-label hover:border-input hover:text-foreground"><Pencil className="h-4 w-4" /> Write a new one</button>
        ) : (
          <div className="grid gap-1.5">
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value.slice(0, 120))} placeholder="Will the next spin land a bonus?" className="h-12 text-base" aria-label="Your question" />
            <p className="text-xs text-muted-foreground">{q && !q.trim().endsWith("?") ? "End with a question mark." : "About one event viewers will see on stream."}</p>
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <span className="text-sm text-label">Open for</span>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Open for">
          {DURATIONS.map((d) => (
            <button key={d.s} type="button" role="radio" aria-checked={dur === d.s} onClick={() => setDur(d.s)} className={cn("h-12 rounded-xl border text-sm font-semibold transition", dur === d.s ? "border-foreground bg-secondary" : "text-label hover:border-input")}>{d.l}</button>
          ))}
        </div>
      </div>
      <Button size="lg" className="mt-auto h-16 rounded-2xl text-lg" disabled={!ok || blocked} onClick={start}><Plus className="!size-5" /> Start question</Button>
    </section>
  );
}

function SettleCard({ m, s, preVoid, onDone }: { m: Market; s: Streamer; preVoid: boolean; onDone: (id: string) => void }) {
  const { proposeResult } = useStore();
  const now = useNow();
  const closed = closedAt(m);
  const [stamp, setStamp] = React.useState(() => hms((closed - streamStart(s)) / 1000));
  const [evidence, setEvidence] = React.useState(EVIDENCE[0]);
  const [showEv, setShowEv] = React.useState(false);
  const [voiding, setVoiding] = React.useState(preVoid);
  const [reason, setReason] = React.useState<string | null>(null);
  React.useEffect(() => { if (preVoid) setVoiding(true); }, [preVoid]);
  const counts = sideCounts(m);
  const left = AUTO_VOID_MS - (now - closed);
  const settle = (r: Side | "VOID") => {
    const note = r === "VOID" ? reason ?? "" : `${evidence} at ${stamp}`;
    proposeResult(m.id, r, note);
    onDone(m.id);
  };
  return (
    <section aria-label={`Settle: ${m.question}`} className="flex flex-col gap-4 rounded-3xl border-2 border-warn/60 bg-warn-bg p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warn"><Hourglass className="h-4 w-4" /> Needs your result</span>
        <span className="font-mono text-xs text-label">{fmt(m.predictors)} waiting · auto-void in {timeLeft(Math.max(0, Math.floor(left / 1000)))}</span>
      </div>
      <div>
        <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{m.question}</p>
        <p className="mt-1 text-sm text-muted-foreground">{m.rule}</p>
      </div>

      {!voiding ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <HoldButton label="Settle as YES" hotkey="y" onConfirm={() => settle("YES")} className="min-h-[128px] rounded-2xl bg-yes-fill text-yes-ink">
              <span className="font-display text-4xl font-black">YES</span>
              <span className="mt-1 text-sm opacity-80">{fmtUSDC(m.yesPool)} · {fmt(counts.YES)} viewers</span>
              <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold opacity-80">Hold <Kbd k="Y" /></span>
            </HoldButton>
            <HoldButton label="Settle as NO" hotkey="n" onConfirm={() => settle("NO")} className="min-h-[128px] rounded-2xl bg-no-fill text-no-ink">
              <span className="font-display text-4xl font-black">NO</span>
              <span className="mt-1 text-sm opacity-80">{fmtUSDC(m.noPool)} · {fmt(counts.NO)} viewers</span>
              <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold opacity-80">Hold <Kbd k="N" /></span>
            </HoldButton>
          </div>
          <div className="rounded-2xl border bg-card px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-label">Evidence at</span>
              <span className="font-mono font-bold">{stamp}</span>
              <button type="button" className="ml-auto h-9 rounded-lg border px-3 text-xs font-semibold hover:border-input" onClick={() => setStamp(hms((Date.now() - streamStart(s)) / 1000))}>Mark now</button>
            </div>
            <button type="button" onClick={() => setShowEv((v) => !v)} className="mt-2 flex w-full items-center justify-between text-left text-label" aria-expanded={showEv}>
              <span className="truncate">{evidence}</span><ChevronDown className={cn("h-4 w-4 shrink-0 transition", showEv && "rotate-180")} />
            </button>
            {showEv && (
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="How viewers can check it">
                {EVIDENCE.map((e) => <button key={e} type="button" role="radio" aria-checked={evidence === e} onClick={() => { setEvidence(e); setShowEv(false); }} className={cn("h-10 rounded-full border px-3 text-xs transition", evidence === e ? "border-foreground bg-secondary font-semibold" : "hover:border-input")}>{e}</button>)}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setVoiding(true)} className="h-12 rounded-xl border bg-card text-sm font-semibold text-label hover:text-foreground">Can’t decide fairly? Void and refund</button>
        </>
      ) : (
        <>
          <p className="text-sm text-label">Why void it? Everyone gets their USDC back ({fmtUSDC(pool(m))}).</p>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Void reason">
            {VOID_REASONS.map((r) => (
              <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={cn("flex min-h-[52px] items-center gap-3 rounded-xl border bg-card px-4 text-left text-sm transition", reason === r ? "border-foreground font-semibold" : "hover:border-input")}>
                <span className={cn("h-4 w-4 shrink-0 rounded-full border-2", reason === r ? "border-neon bg-lime" : "border-input")} />{r}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button variant="secondary" className="h-16 rounded-2xl px-5" onClick={() => { setVoiding(false); setReason(null); }}>Back</Button>
            <HoldButton label="Void and refund everyone" disabled={!reason} onConfirm={() => settle("VOID")} className="h-16 rounded-2xl bg-foreground text-lg font-bold text-background" fill="bg-background/25">Hold to void and refund</HoldButton>
          </div>
        </>
      )}
    </section>
  );
}

function DoneCard({ m, onNext }: { m: Market; onNext: () => void }) {
  return (
    <section className="flex flex-col items-center gap-2 rounded-3xl border border-neon/30 bg-card p-6 text-center" aria-live="polite">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-lime-ink"><Check className="h-6 w-6" strokeWidth={3} /></span>
      <p className="font-display text-2xl font-bold">{m.status === "settled" ? `Settled as ${m.outcome}` : "Voided, everyone refunded"}</p>
      <p className="text-sm text-label">{m.status === "settled" ? `${fmtUSDC(paidOut(m))} to ${fmt(sideCounts(m)[m.outcome!])} viewers. Shown in chat now. Viewers can dispute for 2 hours.` : `${fmtUSDC(pool(m))} back to ${fmt(m.predictors)} viewers.`}</p>
      <Button className="mt-2 h-12 w-full rounded-xl" variant="secondary" onClick={onNext}>Done</Button>
    </section>
  );
}

function RecentPanel({ mine }: { mine: Market[] }) {
  const now = useNow(15_000);
  const done = mine.filter((m) => m.status === "settled" || m.status === "voided").sort((a, b) => (b.settledAt ?? 0) - (a.settledAt ?? 0) || (a.settledMinsAgo ?? 1e9) - (b.settledMinsAgo ?? 1e9)).slice(0, 6);
  return (
    <section aria-label="Recent results" className="rounded-3xl border bg-card p-5">
      <h2 className="mb-3 font-display text-lg font-bold">Recent results</h2>
      {done.length ? (
        <ul className="divide-y">
          {done.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className={cn("w-12 shrink-0 rounded-md py-1 text-center font-display text-xs font-bold", m.status === "voided" ? "bg-secondary text-muted-foreground" : m.outcome === "YES" ? "bg-yes-tint text-yes" : "bg-no-tint text-no")}>{m.status === "voided" ? "VOID" : m.outcome}</span>
              <span className="min-w-0 flex-1 truncate">{m.question}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{m.settledAt ? ago(m.settledAt, now) : m.settledMinsAgo !== undefined ? ago(LOAD - m.settledMinsAgo * 60_000, now) : ""}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">Settled questions show here.</p>}
    </section>
  );
}

/* ───────────────────────── console ───────────────────────── */

type Tab = "live" | "results" | "recent";

function Console({ s }: { s: Streamer }) {
  const { user, markets, signOut, closeMarket } = useStore();
  const [settings, setSettings] = React.useState<Settings>(readSettings);
  const [menu, setMenu] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("live");
  const [preVoid, setPreVoid] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string[]>([]);
  const now = useNow();
  usePageMeta(`Controls · ${s.name}`);

  const mine = markets.filter((m) => m.handle === s.handle);
  const open = mine.find((m) => m.status === "open");
  const awaiting = mine.filter((m) => m.status === "awaiting").sort((a, b) => closedAt(a) - closedAt(b));
  const doneMarkets = done.map((id) => mine.find((m) => m.id === id)).filter((m): m is Market => !!m && m.status !== "awaiting");

  const save = (patch: Partial<Settings>) => setSettings((x) => {
    const next = { ...x, ...patch };
    try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    return next;
  });

  // When the running question closes (timer or another screen), jump to the result and buzz.
  const prevOpen = React.useRef<string | undefined>(open?.id);
  React.useEffect(() => {
    const was = prevOpen.current;
    prevOpen.current = open?.id;
    if (was && was !== open?.id && awaiting.some((m) => m.id === was)) {
      setTab("results");
      buzz(settings.haptics, [60, 40, 60]);
      if (preVoid !== was) toast("Time’s up", { description: "Your question needs a result." });
    }
  }, [open?.id, awaiting, settings.haptics, preVoid]);

  // Keep the screen on while the controls are open. PLACEHOLDER: native wrapper / PWA for background-safe wake lock.
  React.useEffect(() => {
    if (!settings.awake) return;
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null; } catch { /* not allowed */ }
    };
    req();
    const vis = () => { if (document.visibilityState === "visible") req(); };
    document.addEventListener("visibilitychange", vis);
    return () => { document.removeEventListener("visibilitychange", vis); lock?.release().catch(() => undefined); };
  }, [settings.awake]);

  const voidRunning = (id: string) => {
    setPreVoid(id);
    closeMarket(id);
    setTab("results");
  };

  const streamSec = (now - streamStart(s)) / 1000;
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "live", label: open ? "Live" : "Ask" },
    { id: "results", label: "Results", badge: awaiting.length || undefined },
    { id: "recent", label: "Recent" },
  ];

  return (
    <SettingsCtx.Provider value={settings}>
      <div className="min-h-[100dvh] bg-background pb-[env(safe-area-inset-bottom)]">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <ChannelAvatar s={s} size={36} ring={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold leading-tight">{s.name}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                {s.live ? <><LiveBadge /><span className="font-mono">{hms(streamSec)}</span><span className="hidden sm:inline">· {compact(s.viewers)} watching</span></> : "Offline"}
              </p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-label sm:flex" title="Changes show on stream straight away"><span className="h-2 w-2 rounded-full bg-cyan" /> Synced</span>
            <Button variant="outline" size="icon" aria-label="Lock controls" onClick={() => { setLocked(true); buzz(settings.haptics, 15); }}><Lock /></Button>
            <Button variant="outline" size="icon" aria-label="Menu" onClick={() => setMenu(true)}><Menu /></Button>
          </div>
          <nav className="mx-auto grid max-w-6xl grid-cols-3 gap-1 px-4 pb-3 md:hidden" aria-label="Sections">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
                className={cn("flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition", tab === t.id ? "bg-secondary text-foreground" : "text-muted-foreground")}>
                {t.label}{t.badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-warn px-1.5 font-mono text-[11px] text-black">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-2 md:items-start">
          <div className={cn("md:block", tab === "live" ? "block" : "hidden")}>
            {open ? <RunningPanel m={open} onVoid={voidRunning} /> : <AskPanel s={s} blocked={!!open} />}
          </div>
          <div className={cn("space-y-4 md:block", tab === "results" ? "block" : "hidden")}>
            {doneMarkets.map((m) => <DoneCard key={m.id} m={m} onNext={() => { setDone((d) => d.filter((x) => x !== m.id)); setTab("live"); }} />)}
            {awaiting.map((m) => <SettleCard key={m.id} m={m} s={s} preVoid={preVoid === m.id} onDone={(id) => { setDone((d) => [id, ...d]); setPreVoid(null); }} />)}
            {!awaiting.length && !doneMarkets.length && (
              <section className="rounded-3xl border border-dashed p-6 text-center">
                <p className="font-display text-lg font-bold">Nothing to settle</p>
                <p className="mt-1 text-sm text-muted-foreground">When a question closes it lands here with big YES / NO buttons.</p>
              </section>
            )}
          </div>
          <div className={cn("md:col-span-2 md:block", tab === "recent" ? "block" : "hidden")}>
            <RecentPanel mine={mine} />
            <p className="mt-4 hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><Keyboard className="h-4 w-4" /> Hold <Kbd k="Y" /> or <Kbd k="N" /> to settle the oldest question, <Kbd k="C" /> to close the running one.</p>
          </div>
        </main>
      </div>

      {locked && <LockOverlay onUnlock={() => setLocked(false)} open={open} awaiting={awaiting.length} />}

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="right" className="gap-5">
          <SheetTitle className="font-display text-lg font-bold">Controls</SheetTitle>
          <div className="rounded-xl border p-3 text-sm">
            <p className="text-muted-foreground">Logged in as</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="grid gap-4">
            <label className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Sun className="h-4 w-4" /> Keep screen on</span><Switch checked={settings.awake} onCheckedChange={(v) => save({ awake: v })} /></label>
            <label className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Vibrate className="h-4 w-4" /> Vibrate on actions</span><Switch checked={settings.haptics} onCheckedChange={(v) => save({ haptics: v })} /></label>
            <div className="grid gap-2 text-sm">
              <span>Hold to confirm</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[{ v: 500, l: "Short" }, { v: 800, l: "Normal" }, { v: 1200, l: "Long" }].map((o) => (
                  <button key={o.v} type="button" onClick={() => save({ hold: o.v })} className={cn("h-10 rounded-lg border text-xs font-semibold", settings.hold === o.v ? "border-foreground bg-secondary" : "text-label")}>{o.l}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Settling and voiding always need a hold, so a bump can’t pay out the wrong side.</p>
            </div>
          </div>
          <div className="mt-auto grid gap-2">
            <Button asChild variant="secondary"><Link to="/studio/companion"><MonitorSmartphone /> Companion settings in Studio</Link></Button>
            <Button variant="outline" onClick={() => { setMenu(false); signOut(); }}><LogOut /> Log out of this device</Button>
          </div>
        </SheetContent>
      </Sheet>
    </SettingsCtx.Provider>
  );
}

function LockOverlay({ onUnlock, open, awaiting }: { onUnlock: () => void; open?: Market; awaiting: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 px-6 text-center backdrop-blur" role="dialog" aria-modal="true" aria-label="Controls locked">
      <Lock className="h-10 w-10 text-label" />
      <div>
        <p className="font-display text-2xl font-bold">Controls locked</p>
        <p className="mt-1 text-sm text-muted-foreground">Taps are ignored so nothing changes by accident.</p>
      </div>
      {open && <p className="rounded-xl border bg-card px-4 py-3 text-sm">Running: <b>{open.question}</b> · <span className="font-mono">{timeLeft(open.secondsLeft ?? 0)}</span></p>}
      {awaiting > 0 && <p className="text-sm font-semibold text-warn">{awaiting} {awaiting === 1 ? "question needs" : "questions need"} a result</p>}
      <HoldButton label="Unlock controls" ms={1000} onConfirm={onUnlock} className="h-16 w-full max-w-xs rounded-2xl border bg-card text-base font-semibold" fill="bg-lime/30">
        <span className="flex items-center gap-2"><Unlock className="h-5 w-5" /> Hold to unlock</span>
      </HoldButton>
    </div>
  );
}

/* ───────────────────────── route ───────────────────────── */

export default function Companion() {
  const { handle = "" } = useParams();
  const { user } = useStore();
  const s = streamerByHandle(handle);
  usePageMeta(s ? `Controls · ${s.name}` : "Streamer controls");
  if (!s) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          <Smartphone className="mx-auto h-10 w-10 text-label" />
          <p className="mt-4 font-display text-2xl font-bold">No controls at this address</p>
          <p className="mt-1 text-muted-foreground">Check the link in Studio › Companion app.</p>
          <Button asChild variant="secondary" className="mt-6"><Link to="/">Go to xp.live</Link></Button>
        </div>
      </div>
    );
  }
  if (!user || user.channel !== s.handle) return <CompanionLogin s={s} />;
  return <Console s={s} />;
}
