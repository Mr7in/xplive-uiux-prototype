import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Clock, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/components/auth";
import { multiplier, pool, yesPct, type Market, type Side } from "@/data/markets";
import { streamerByHandle } from "@/data/streamers";
import { SplitBar } from "@/components/xp";
import { cn, fmt, fmtUSD2, fmtUSDC, timeLeft } from "@/lib/utils";
import { NETWORK } from "@/lib/chain";
import { useWalletUI } from "@/components/WalletDialogs";
import { PositionSteps, ResolutionBlock, SideText, TrackRecordLine, estimateBack, positionOutcome, useReceipt } from "@/components/trust";

const AMOUNTS = [1, 5, 10, 25, 50];

/** A figure that flashes once and shows its previous value when it changes while visible. */
function Moving({ value, className }: { value: number; className?: string }) {
  const prev = React.useRef(value);
  const [was, setWas] = React.useState<number | null>(null);
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (Math.abs(prev.current - value) >= 0.005) {
      setWas(prev.current);
      setN((x) => x + 1);
      prev.current = value;
    }
  }, [value]);
  return (
    <span className={cn("inline-flex flex-col items-end", className)}>
      <span key={n} className={cn("rounded px-1 -mx-1", n > 0 && "flash")}>{fmtUSDC(value)}</span>
      {was !== null && <span className="font-sans text-[11px] font-normal text-muted-foreground">was {fmtUSD2(was)}</span>}
    </span>
  );
}

function SummaryRow({ k, children, strong, indent }: { k: React.ReactNode; children: React.ReactNode; strong?: boolean; indent?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-1", indent && "pl-3")}>
      <dt className={cn("text-sm", strong ? "font-semibold" : "text-label")}>{k}</dt>
      <dd className={cn("text-right font-mono text-sm tabular", strong && "font-bold")}>{children}</dd>
    </div>
  );
}

export function PredictPanel({ m, className }: { m: Market; className?: string }) {
  const { user, balance, positions, predict } = useStore();
  const guard = useRequireAuth();
  const receipt = useReceipt();
  const ui = useWalletUI();
  const s = streamerByHandle(m.handle);
  const [side, setSide] = React.useState<Side | null>(null);
  const [amount, setAmount] = React.useState(10);
  const [custom, setCustom] = React.useState("");
  /** The ticket was open when the question closed: keep it, read-only. */
  const [closedOnTicket, setClosedOnTicket] = React.useState<{ side: Side; amount: number } | null>(null);
  const mine = user ? positions.filter((p) => p.marketId === m.id) : [];
  const p = yesPct(m);
  const open = m.status === "open";
  const secs = m.secondsLeft ?? 0;
  const urgent = open && secs <= 30;
  const tooMuch = amount > balance;
  const back = side ? estimateBack(m, side, amount) : 0;

  React.useEffect(() => { setSide(null); setClosedOnTicket(null); }, [m.id]);
  React.useEffect(() => {
    if (!open && side) { setClosedOnTicket({ side, amount }); setSide(null); }
  }, [open, side, amount]);

  const place = () =>
    guard(() => {
      if (!side || tooMuch || amount < 1 || !open) return;
      predict(m.id, side, amount);
      toast(`${side} · ${fmtUSDC(amount)} submitted`, { description: `Your position is being confirmed on ${NETWORK.name}.` });
      setSide(null);
      setCustom("");
    });

  return (
    <section aria-labelledby={`q-${m.id}`} className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={`q-${m.id}`} className="font-display text-xl font-bold leading-tight text-balance">{m.question}</h2>
        {open && (
          <span role="timer" aria-live="off" aria-label={`Closes in ${timeLeft(secs)}`} className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-mono text-sm font-bold tabular", urgent ? "bg-warn-bg text-warn" : "bg-secondary")}>
            <Clock className="h-3.5 w-3.5" /> {timeLeft(secs)}
          </span>
        )}
      </div>
      <p className="mt-1.5 flex gap-1.5 text-xs text-muted-foreground"><Info className="mt-px h-3.5 w-3.5 shrink-0" />{m.rule}</p>

      <div className="mt-4">
        <SplitBar m={m} />
        <div className="mt-2 flex justify-between font-mono text-xs tabular">
          <span className="text-yes">YES {p}% · {fmtUSD2(m.yesPool)}</span>
          <span className="text-no">{fmtUSD2(m.noPool)} · {100 - p}% NO</span>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">Pool {fmtUSDC(pool(m))} from {fmt(m.predictors)} predictors</p>
      </div>

      {/* ── Ticket ─────────────────────────────────────────── */}
      {open && (
        <div className="mt-4 grid gap-3">
          <div role="radiogroup" aria-label="Pick a side" className="grid grid-cols-2 gap-2">
            {(["YES", "NO"] as Side[]).map((sd) => {
              const on = side === sd;
              const isYes = sd === "YES";
              return (
                <button key={sd} role="radio" aria-checked={on} onClick={() => guard(() => setSide(sd))}
                  className={cn("flex min-h-[60px] flex-col items-start justify-center rounded-xl border-2 px-4 text-left transition",
                    isYes ? (on ? "border-yes-fill bg-yes-fill text-yes-ink" : "border-yes/25 bg-yes-tint text-yes hover:border-yes/60") : on ? "border-no-fill bg-no-fill text-no-ink" : "border-no/25 bg-no-tint text-no hover:border-no/60")}>
                  <span className="font-display text-lg font-extrabold">{isYes ? "Yes" : "No"}</span>
                  <span className="font-mono text-xs">pays {multiplier(m, sd).toFixed(2)}×</span>
                </button>
              );
            })}
          </div>

          {side && (
            <div className="grid gap-3 border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-label">Stake</span>
                <button type="button" onClick={() => ui.open("add")} className="inline-flex items-center gap-0.5 text-xs text-label hover:text-foreground"><Plus className="h-3 w-3" />Add funds</button>
              </div>
              <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Quick amounts">
                {AMOUNTS.map((a) => (
                  <button key={a} aria-pressed={amount === a && !custom} onClick={() => { setAmount(a); setCustom(""); }} disabled={a > balance}
                    className={cn("h-10 rounded-lg border font-mono text-sm transition disabled:opacity-35", amount === a && !custom ? "border-foreground bg-foreground font-bold text-background" : "hover:border-input")}>{a}</button>
                ))}
              </div>
              <div className="relative">
                <Input inputMode="decimal" placeholder="Custom amount" value={custom} aria-label="Custom amount in USDC" className="pr-16"
                  onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, "").slice(0, 8); setCustom(v); setAmount(Number(v) || 0); }} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDC</span>
              </div>

              <dl className="rounded-xl bg-secondary/60 px-3 py-2" aria-label="Ticket summary">
                <SummaryRow k="Your pick"><SideText side={side} /></SummaryRow>
                <SummaryRow k="Stake">{fmtUSDC(amount)}</SummaryRow>
                <SummaryRow k="Balance after"><span className={cn(tooMuch && "text-coral-soft")}>{fmtUSDC(balance - amount)}</span><span className="block font-sans text-[11px] text-muted-foreground">now {fmtUSD2(balance)}</span></SummaryRow>
                <div className="my-1 border-t" />
                <SummaryRow k={<>If <SideText side={side} /> wins</>} strong>{""}</SummaryRow>
                <SummaryRow k="Back to you" indent><Moving value={back} /></SummaryRow>
                <SummaryRow k="Profit" indent><span className="text-neon">+{fmtUSD2(Math.max(0, back - amount))} USDC</span></SummaryRow>
                <SummaryRow k={<>If <SideText side={side === "YES" ? "NO" : "YES"} /> wins</>} strong>{""}</SummaryRow>
                <SummaryRow k="You lose" indent>{fmtUSDC(amount)}</SummaryRow>
                <p className="pb-1 pt-2 text-xs leading-relaxed text-muted-foreground">
                  Estimate. Payout moves as others join and locks when the question closes in <span className={cn("font-mono tabular", urgent && "font-bold text-warn")}>{timeLeft(secs)}</span>.
                </p>
              </dl>

              {tooMuch && <p className="flex items-center justify-between gap-2 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral-soft">That’s more than your balance. <Button size="sm" variant="outline" onClick={() => ui.open("add")}>Add funds</Button></p>}
              {amount > 0 && amount < 1 && <p className="text-sm text-coral-soft">The minimum is 1.00 USDC.</p>}
              <Button size="lg" onClick={place} disabled={tooMuch || amount < 1}>Confirm prediction · {fmtUSDC(amount)}</Button>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <Link to="/how-it-works" className="text-label underline underline-offset-2 hover:text-foreground">How payouts work</Link>
                <span>18+ · {NETWORK.name}{NETWORK.testnet ? " (testnet)" : ""}</span>
              </div>
              {s && <TrackRecordLine handle={s.handle} className="text-xs" />}
            </div>
          )}
          {!user && <p className="text-center text-sm text-muted-foreground">Log in to predict with USDC.</p>}
        </div>
      )}

      {/* ── Closed while the ticket was open ─────────────────── */}
      {closedOnTicket && !open && (
        <div className="mt-4 rounded-xl border border-dashed p-3" role="status">
          <dl className="opacity-70">
            <SummaryRow k="Your pick"><SideText side={closedOnTicket.side} /></SummaryRow>
            <SummaryRow k="Stake">{fmtUSDC(closedOnTicket.amount)}</SummaryRow>
          </dl>
          <p className="mt-2 text-sm font-semibold">This question closed before you confirmed. No funds were taken.</p>
          <button type="button" onClick={() => document.getElementById(`result-${m.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="mt-1 inline-block text-sm text-label underline underline-offset-2 hover:text-foreground">{m.status === "awaiting" ? "The result appears below when it settles" : "See the result"}</button>
        </div>
      )}

      {/* ── Your position ─────────────────────────────────── */}
      {mine.length > 0 && (
        <div className="mt-4 rounded-xl border border-neon/40 p-3 text-sm">
          <p className="mb-2 font-semibold">Your position</p>
          <ul className="space-y-3">
            {mine.map((pos) => {
              const o = positionOutcome(m, pos);
              return (
                <li key={pos.id} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="whitespace-nowrap"><SideText side={pos.side} /> · <span className="font-mono tabular">{fmtUSDC(pos.amount)}</span></span>
                    <button type="button" onClick={() => receipt.open(pos.id)} className="text-xs text-label underline underline-offset-2 hover:text-foreground">View receipt</button>
                  </div>
                  <p className={cn("text-xs", o.key === "won" ? "font-bold text-neon" : "text-label")}>{o.line}</p>
                  <PositionSteps tx={pos.tx} className={pos.tx === "confirmed" ? "text-muted-foreground" : undefined} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(m.status === "settled" || m.status === "voided" || m.status === "awaiting") && <div id={`result-${m.id}`}><ResolutionBlock m={m} className="mt-4" /></div>}
    </section>
  );
}
