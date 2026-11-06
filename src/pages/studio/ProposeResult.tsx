import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, CircleSlash, Film, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { pool, type Side } from "@/data/markets";
import { MarketStatus, PageHeader } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clipPlan, durLabel } from "@/lib/autoclip";
import { ClipLine, EvidenceClipDialog } from "@/components/EvidenceClip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, fmt, fmtUSDC } from "@/lib/utils";

type Choice = Side | "VOID" | null;
const VOID_REASONS = ["The event didn’t happen", "Stream cut out", "The question was unclear", "I made a mistake asking it"];

export default function ProposeResult() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { markets, proposeResult, user } = useStore();
  const m = markets.find((x) => x.id === id && x.handle === user?.channel);
  usePageMeta("Propose the result · Studio");
  const [choice, setChoice] = React.useState<Choice>(params.get("void") ? "VOID" : null);
  const [reason, setReason] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState(false);
  const [clipping, setClipping] = React.useState<Side | null>(null);

  if (!m) return <div className="mx-auto max-w-2xl py-16 text-center"><p className="font-display text-2xl font-bold">Question not found</p><Button asChild variant="secondary" className="mt-4"><Link to="/studio/predictions">Back to predictions</Link></Button></div>;

  const done = m.status === "settled" || m.status === "voided";
  const winners = choice === "YES" || choice === "NO" ? Math.round(m.predictors * ((choice === "YES" ? m.yesPool : m.noPool) / Math.max(1, pool(m)))) : m.predictors;
  const ready = choice === "VOID" ? !!reason : !!choice;
  const plan = clipPlan(m);

  const Big = ({ v, title, sub, cls }: { v: Choice; title: string; sub: string; cls: string }) => (
    <button
      type="button"
      role="radio"
      aria-checked={choice === v}
      onClick={() => setChoice(v)}
      className={cn("flex min-h-[132px] flex-col items-start justify-between rounded-2xl border-2 p-5 text-left transition", choice === v ? cls : "border-border bg-card hover:border-input")}
    >
      <span className="flex w-full items-center justify-between">
        <span className="font-display text-3xl font-black">{title}</span>
        <span className={cn("grid h-7 w-7 place-items-center rounded-full border-2", choice === v ? "border-current bg-current" : "border-input")}>{choice === v && <Check className="h-4 w-4 text-background" strokeWidth={3} />}</span>
      </span>
      <span className="text-sm opacity-90">{sub}</span>
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/studio/predictions" className="inline-flex items-center gap-1.5 text-sm text-label hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Predictions</Link>
      <PageHeader title="Propose the result" description="Tell viewers what happened. Winnings pay out straight away; viewers can dispute for 2 hours." />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-5">
          <div className="min-w-0 flex-1"><p className="font-display text-xl font-bold leading-snug">{m.question}</p><p className="mt-1 text-sm text-muted-foreground">{m.rule}</p></div>
          <div className="text-right"><MarketStatus m={m} /><p className="mt-1 font-mono text-xs text-muted-foreground">{fmtUSDC(pool(m))} · {fmt(m.predictors)} predictors</p></div>
        </CardContent>
      </Card>

      {done ? (
        <Card className="border-neon/30"><CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          {m.status === "settled" ? <CheckCircle2 className="h-10 w-10 text-neon" /> : <CircleSlash className="h-10 w-10 text-label" />}
          <p className="font-display text-2xl font-bold">{m.status === "settled" ? `Settled as ${m.outcome}` : "Voided, everyone refunded"}</p>
          {m.status === "settled" && m.clip && <ClipLine clip={m.clip} className="rounded-full border border-neon/30 px-3 py-1 text-neon" />}
          <p className="text-muted-foreground">Viewers have been notified. The result shows in chat and on your channel.</p>
          <Button asChild><Link to="/studio/predictions">Ask the next question</Link></Button>
        </CardContent></Card>
      ) : m.status === "open" ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">This question is still open. Close it first, then propose the result.</CardContent></Card>
      ) : (
        <>
          <section aria-labelledby="what">
            <h2 id="what" className="mb-3 font-display text-lg font-bold">1. What happened on stream?</h2>
            <div role="radiogroup" aria-labelledby="what" className="grid gap-3 sm:grid-cols-3">
              <Big v="YES" title="YES" sub={`${fmtUSDC(m.yesPool)} was on YES`} cls="border-yes-fill bg-yes-fill text-yes-ink" />
              <Big v="NO" title="NO" sub={`${fmtUSDC(m.noPool)} was on NO`} cls="border-no-fill bg-no-fill text-no-ink" />
              <Big v="VOID" title="Void" sub="Can’t be decided fairly. Everyone gets their USDC back." cls="border-foreground bg-foreground text-background" />
            </div>
          </section>

          {choice && choice !== "VOID" && (
            <section aria-labelledby="ev" className="space-y-2">
              <h2 id="ev" className="font-display text-lg font-bold">2. Evidence</h2>
              <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm">
                <Film className="mt-0.5 h-5 w-5 shrink-0 text-neon" />
                <div>
                  <p className="font-semibold">Clipped for you when you settle</p>
                  <p className="mt-0.5 text-label">This question was open for {durLabel(plan.durationSec)}, so xp.live scans the stream from when it opened, finds the moment and attaches a {durLabel(plan.clipSec)} clip. Takes about {Math.round(plan.waitMs / 1000)} s.</p>
                </div>
              </div>
            </section>
          )}

          {choice === "VOID" && (
            <section aria-labelledby="why" className="space-y-3">
              <h2 id="why" className="font-display text-lg font-bold">2. Why void it?</h2>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="why">
                {VOID_REASONS.map((r) => (
                  <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={cn("flex h-12 items-center gap-3 rounded-xl border px-4 text-left text-sm transition", reason === r ? "border-foreground bg-secondary font-semibold" : "hover:border-input")}>
                    <span className={cn("h-4 w-4 rounded-full border-2", reason === r ? "border-neon bg-lime" : "border-input")} />{r}
                  </button>
                ))}
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldAlert className="h-4 w-4" /> Frequent voids are reviewed by the xp.live team.</p>
            </section>
          )}

          {choice && (
            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-popover/95 p-4 shadow-2xl backdrop-blur">
              <p className="text-sm">
                {choice === "VOID" ? <>Returns <b className="font-mono">{fmtUSDC(pool(m))}</b> to {fmt(m.predictors)} predictors.</> : <>Pays <b className="font-mono">{fmtUSDC(pool(m) * 0.96)}</b> to about {fmt(winners)} viewers who picked {choice}.</>}
              </p>
              <Button size="lg" variant={choice === "YES" ? "yes" : choice === "NO" ? "no" : "default"} disabled={!ready} onClick={() => setConfirm(true)}>
                {choice === "VOID" ? "Void and refund" : `Settle as ${choice}`}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{choice === "VOID" ? "Void and refund everyone?" : `Settle as ${choice}?`}</DialogTitle>
            <DialogDescription>You can’t undo this. {choice === "VOID" ? "All predictions are returned." : "We create the evidence clip first, then winners are paid. If viewers dispute, an admin reviews the clip and the recording."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Go back</Button>
            <Button variant={choice === "YES" ? "yes" : choice === "NO" ? "no" : "default"} onClick={() => {
              setConfirm(false);
              if (choice === "VOID") { proposeResult(m.id, "VOID", reason ?? ""); toast.success("Voided. Everyone refunded."); return; }
              setClipping(choice as Side);
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EvidenceClipDialog
        m={clipping ? m : null}
        result={clipping}
        onCancel={() => { setClipping(null); toast("Not settled", { description: "The question is still waiting for your result." }); }}
        onDone={(clip) => { proposeResult(m.id, clipping!, `Auto-clip of the moment (${durLabel(clip.sec)})`, clip); setClipping(null); toast.success(`Settled as ${clipping}`, { description: "Evidence clip attached." }); }}
      />
    </div>
  );
}
