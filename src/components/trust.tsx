/**
 * Trust layer: receipt sheet, position status steps, resolution block, evidence frame and
 * creator track record. Everything reads from the store + lib/ledger so figures agree everywhere.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useStore, backToYou, type Position, type PosState } from "@/lib/store";
import { multiplier, type Market, type Side } from "@/data/markets";
import { streamerByHandle } from "@/data/streamers";
import { NETWORK, short } from "@/lib/chain";
import { at, clock, closedAt, disputeLine, paidAt, settledAt, trackRecord, when, winners, sideCounts } from "@/lib/ledger";
import { durLabel } from "@/lib/autoclip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StreamThumb } from "@/components/xp";
import { TxLink } from "@/components/WalletDialogs";
import { cn, fmt, fmtUSD2, fmtUSDC } from "@/lib/utils";

/* ───────────────────────── Status steps ───────────────────────── */

const STEPS: { key: PosState; label: string }[] = [
  { key: "submitting", label: "Submitting" },
  { key: "recorded", label: "Recorded" },
  { key: "confirmed", label: `Confirmed on Polygon${NETWORK.testnet ? " (testnet)" : ""}` },
];

/** Submitting > Recorded > Confirmed on Polygon (testnet). */
export function PositionSteps({ tx, className }: { tx: PosState; className?: string }) {
  if (tx === "failed") return <p className={cn("text-xs text-coral-soft", className)}>Not placed. The chain didn’t take it, nothing left your balance.</p>;
  const idx = STEPS.findIndex((s) => s.key === tx);
  return (
    <ol className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", className)} aria-label="Transaction status">
      {STEPS.map((s, i) => {
        const done = i < idx || tx === "confirmed";
        const now = i === idx && tx !== "confirmed";
        return (
          <li key={s.key} className={cn("inline-flex items-center gap-1", done ? "text-foreground" : now ? "text-foreground" : "text-muted-foreground")} aria-current={now ? "step" : undefined}>
            {done ? <Check className="h-3 w-3 text-neon" /> : now ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────────────────────── Outcome of a position ───────────────────────── */

export function positionOutcome(m: Market, p: Position) {
  const est = backToYou(m, p);
  if (p.tx === "failed") return { key: "failed", label: "Not placed", back: 0, line: "Nothing left your balance" };
  if (m.status === "open") return { key: "open", label: "Open", back: est, line: `Estimated ${fmtUSDC(est)} back if ${p.side} wins` };
  if (m.status === "awaiting") return { key: "awaiting", label: "Waiting for result", back: est, line: `${fmtUSDC(est)} back if ${p.side} wins (locked)` };
  if (m.status === "voided") return { key: "refunded", label: "Refunded", back: p.amount, line: `${fmtUSDC(p.amount)} returned` };
  if (m.dispute) return { key: "held", label: "Under review", back: 0, line: "A dispute is open. Payouts are held." };
  if (m.outcome === p.side) return { key: "won", label: "Won", back: est, line: paidAt(m) && paidAt(m)! <= Date.now() ? `${fmtUSDC(est)} back to you` : `${fmtUSDC(est)} back to you · paying` };
  return { key: "lost", label: "Lost", back: 0, line: `Result ${m.outcome}` };
}

/* ───────────────────────── Receipt sheet ───────────────────────── */

const ReceiptCtx = React.createContext<{ open: (positionId: string) => void } | null>(null);
export const useReceipt = () => {
  const c = React.useContext(ReceiptCtx);
  if (!c) throw new Error("useReceipt outside ReceiptProvider");
  return c;
};

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = React.useState<string | null>(null);
  const value = React.useMemo(() => ({ open: (pid: string) => setId(pid) }), []);
  return (
    <ReceiptCtx.Provider value={value}>
      {children}
      <Sheet open={!!id} onOpenChange={(o) => !o && setId(null)}>
        <SheetContent side="right" className="w-[440px] max-w-full p-0" aria-describedby={undefined}>
          {id && <Receipt id={id} onNavigate={() => setId(null)} />}
        </SheetContent>
      </Sheet>
    </ReceiptCtx.Provider>
  );
}

function Row({ k, children, mono }: { k: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-sm text-muted-foreground">{k}</dt>
      <dd className={cn("min-w-0 text-right text-sm", mono && "font-mono tabular")}>{children}</dd>
    </div>
  );
}

function CopyHash({ hash }: { hash: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button type="button" className="inline-flex items-center gap-1 font-mono text-xs text-label hover:text-foreground" onClick={() => { try { navigator.clipboard?.writeText(hash); } catch { /* clipboard blocked */ } setDone(true); toast("Transaction reference copied"); window.setTimeout(() => setDone(false), 1500); }}>
      {short(hash, 10, 8)} {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}<span className="sr-only">Copy</span>
    </button>
  );
}

function Receipt({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  const { positions, markets } = useStore();
  const p = positions.find((x) => x.id === id);
  const m = p && markets.find((x) => x.id === p.marketId);
  if (!p || !m) return <div className="p-6 text-sm text-muted-foreground">This receipt is no longer available.</div>;
  const s = streamerByHandle(m.handle);
  const o = positionOutcome(m, p);
  const placed = at(p.placedMinsAgo, p.placedAt);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 pb-4 pt-6">
        <SheetTitle className="font-display text-xl font-bold">Receipt</SheetTitle>
        <p className="mt-3 font-display text-lg font-semibold leading-snug">{m.question}</p>
        <Link to={`/${m.handle}`} onClick={onNavigate} className="mt-1 inline-block text-sm text-label hover:text-foreground">{s?.name}</Link>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <dl className="divide-y">
          <Row k="Your pick"><SideText side={p.side} /></Row>
          <Row k="Stake" mono>{fmtUSDC(p.amount)}</Row>
          {o.key === "open" || o.key === "awaiting" ? (
            <Row k="Estimated return" mono>{fmtUSDC(o.back)}<span className="block font-sans text-xs text-muted-foreground">{o.key === "open" ? "Moves until the question closes" : "Locked at close"}</span></Row>
          ) : o.key === "won" ? (
            <Row k="Back to you" mono><span className="font-bold text-neon">{fmtUSDC(o.back)}</span><span className="block text-xs text-neon">+{fmtUSD2(o.back - p.amount)} profit</span></Row>
          ) : o.key === "refunded" ? (
            <Row k="Refunded" mono>{fmtUSDC(p.amount)}</Row>
          ) : o.key === "lost" ? (
            <Row k="Back to you" mono>0.00 USDC</Row>
          ) : o.key === "held" ? (
            <Row k="Back to you">Held during review</Row>
          ) : null}
          <Row k="Placed">{when(placed)}</Row>
          <Row k="Status">{p.tx === "confirmed" ? o.label : <PositionSteps tx={p.tx} className="justify-end" />}</Row>
          <Row k="Transaction"><span className="flex flex-col items-end gap-1">{p.tx === "failed" ? <span className="text-xs text-muted-foreground">No transaction</span> : <><CopyHash hash={p.txHash} />{p.tx === "confirmed" ? <span onClick={onNavigate}><TxLink hash={p.txHash} label={`View on Polygonscan${NETWORK.testnet ? " (testnet)" : ""}`} className="font-sans" /></span> : <TxLink hash={p.txHash} pending />}</>}</span></Row>
        </dl>
        {(m.status === "settled" || m.status === "voided" || m.status === "awaiting") && <ResolutionBlock m={m} className="mt-5" />}
      </div>
      <div className="border-t px-6 py-4 text-sm"><Link to="/how-it-works" onClick={onNavigate} className="text-label underline underline-offset-2 hover:text-foreground">How payouts work</Link></div>
    </div>
  );
}

export function SideText({ side }: { side: Side }) {
  return <span className={cn("font-bold", side === "YES" ? "text-yes" : "text-no")}>{side}</span>;
}

/* ───────────────────────── Evidence frame ───────────────────────── */

/** PLACEHOLDER: evidence clip from the auto-clipper (new results) or a frame (seed results). Production: play the clip from the media CDN. */
export function EvidenceButton({ m }: { m: Market }) {
  const [open, setOpen] = React.useState(false);
  const s = streamerByHandle(m.handle);
  if (!m.clipAt || !s) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-label underline underline-offset-2 hover:text-foreground"><Play className="h-3 w-3" />{m.clip ? `Watch ${durLabel(m.clip.sec)} clip at ${m.clipAt}` : `View frame at ${m.clipAt}`}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evidence · {m.question}</DialogTitle>
            <DialogDescription>{m.clip
              ? <>Clipped automatically by balz from {s.name}’s stream when the result was posted: {durLabel(m.clip.sec)}, {m.clip.start} to {m.clip.end}, moment at {m.clip.moment}. The clipper scanned {m.clip.scannedFrom} to {m.clip.scannedTo}.</>
              : <>{m.evidence}. Captured from {s.name}’s stream at stream time {m.clipAt} and attached to the result.</>}</DialogDescription>
          </DialogHeader>
          <StreamThumb s={{ ...s, live: true }} frame={3} className="rounded-lg">
            <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-xs text-white">{m.clip ? `${m.clip.start} – ${m.clip.end}` : m.clipAt}</span>
            {m.clip && <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-black/70 text-white"><Play className="h-5 w-5" /></span></span>}
          </StreamThumb>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ───────────────────────── Resolution block ───────────────────────── */

export function ResolutionBlock({ m, className }: { m: Market; className?: string }) {
  const s = streamerByHandle(m.handle);
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => { const t = window.setInterval(force, 15_000); return () => window.clearInterval(t); }, []);
  const name = s?.name ?? m.handle;
  if (m.status === "awaiting") {
    return (
      <div className={cn("rounded-xl border p-4 text-sm", className)}>
        <p className="font-semibold">Waiting for the result</p>
        <p className="mt-1 text-muted-foreground">{name}, who asked this question, posts the result with evidence from the stream. If there’s no result within 60 minutes of closing ({clock(closedAt(m) + 3_600_000)}), the question is voided and every stake is returned.</p>
      </div>
    );
  }
  if (m.status === "voided") {
    return (
      <div className={cn("rounded-xl border p-4", className)}>
        <dl className="text-sm">
          <Line k="Result"><span className="font-semibold">Voided</span></Line>
          <Line k="Voided by">{name} (creator of this question)</Line>
          <Line k="Reason">{m.voidReason}</Line>
          <Line k="Refunds">All {fmt(m.predictors)} stakes returned in full</Line>
        </dl>
      </div>
    );
  }
  if (m.status !== "settled") return null;
  const d = disputeLine(m);
  const paid = paidAt(m);
  const paying = !paid || paid > Date.now();
  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <dl className="text-sm">
        <Line k="Result"><span className={cn("font-display text-base font-bold", m.outcome === "YES" ? "text-yes" : "text-no")}>{m.outcome}</span></Line>
        <Line k="Resolved by">{name} <span className="text-muted-foreground">(creator of this question)</span> · {clock(settledAt(m))}</Line>
        <Line k="Evidence"><span className="block">{m.evidence}</span><EvidenceButton m={m} /></Line>
        <Line k="Dispute">{d.text}</Line>
        <Line k="Payout">{m.dispute ? "Held until the dispute is decided" : paying ? <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Paying {fmt(winners(m))} winners</span> : <>Paid to {fmt(winners(m))} winners · {clock(paid!)}</>}</Line>
      </dl>
    </div>
  );
}

function Line({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/* ───────────────────────── Creator track record ───────────────────────── */

/** PLACEHOLDER: aggregates computed from the creator's settled questions. */
export function useTrackRecord(handle: string) {
  const { markets } = useStore();
  return React.useMemo(() => trackRecord(handle, markets), [handle, markets]);
}

export function TrackRecordLine({ handle, className }: { handle: string; className?: string }) {
  const t = useTrackRecord(handle);
  if (!t.resolved) return <p className={cn("text-sm text-muted-foreground", className)}>No questions resolved yet.</p>;
  return (
    <p className={cn("text-sm text-label", className)}>
      <span className="font-mono tabular text-foreground">{t.resolved}</span> questions resolved · <span className="font-mono tabular text-foreground">{t.disputesRaised}</span> {t.disputesRaised === 1 ? "dispute" : "disputes"} raised, <span className="font-mono tabular text-foreground">{t.disputesUpheld}</span> upheld{t.medianCloseToPayout > 0 && <> · <span className="whitespace-nowrap">median <span className="font-mono tabular text-foreground">{t.medianCloseToPayout} min</span></span> from close to payout</>}
    </p>
  );
}

export function TrackRecordGrid({ handle }: { handle: string }) {
  const t = useTrackRecord(handle);
  const items = [
    ["Resolved", String(t.resolved)],
    ["Disputes raised", String(t.disputesRaised)],
    ["Disputes upheld", String(t.disputesUpheld)],
    ["Close to payout", t.medianCloseToPayout ? `${t.medianCloseToPayout} min` : "–"],
  ];
  return (
    <dl className="grid grid-cols-4 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-lg bg-secondary px-2.5 py-2">
          <dt className="text-[11px] leading-tight text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 font-mono text-sm font-bold tabular">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Estimated back-to-you for a hypothetical stake, including the stake itself in the pool. */
export function estimateBack(m: Pick<Market, "yesPool" | "noPool">, side: Side, amount: number) {
  if (amount <= 0) return 0;
  const after = { yesPool: m.yesPool + (side === "YES" ? amount : 0), noPool: m.noPool + (side === "NO" ? amount : 0) };
  return Math.round(amount * multiplier(after, side) * 100) / 100;
}

export { sideCounts };
