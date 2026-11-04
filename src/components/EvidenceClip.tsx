/**
 * "Please wait while the evidence clip is created" step, shared by the companion app and
 * Studio › Propose result. Opens after the creator says YES or NO, runs the auto-clipper and only
 * then posts the result with the clip attached. Cancel leaves the question waiting for a result.
 *
 * PLACEHOLDER: progress events from the auto-clipper service (scan → detect → render → upload).
 */
import * as React from "react";
import { Check, Film, Loader2, Play, ScanSearch, Scissors, Paperclip } from "lucide-react";
import type { EvidenceClip, Market, Side } from "@/data/markets";
import { streamerByHandle } from "@/data/streamers";
import { buildClip, clipPlan, durLabel } from "@/lib/autoclip";
import { StreamThumb } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STEPS = [
  { at: 0, icon: ScanSearch, label: (c: EvidenceClip, _todo?: boolean) => `Scanning the stream ${c.scannedFrom} to ${c.scannedTo}` },
  { at: 0.38, icon: Film, label: (c: EvidenceClip, todo?: boolean) => (todo ? "Finding the moment" : `Found the moment at ${c.moment}`) },
  { at: 0.52, icon: Scissors, label: (c: EvidenceClip, todo?: boolean) => (todo ? `Cutting a ${durLabel(c.sec)} clip` : `Cutting a ${durLabel(c.sec)} clip, ${c.start} to ${c.end}`) },
  { at: 0.86, icon: Paperclip, label: (_c: EvidenceClip, _todo?: boolean) => "Attaching it to your result" },
];

export function EvidenceClipDialog({ m, result, onCancel, onDone }: {
  /** The question being settled. Null keeps the dialog closed. */
  m: Market | null;
  result: Side | null;
  onCancel: () => void;
  onDone: (clip: EvidenceClip) => void;
}) {
  const open = !!m && !!result;
  const [started, setStarted] = React.useState(0);
  const [now, setNow] = React.useState(Date.now());
  const clip = React.useMemo(() => (m ? buildClip(m) : null), [m?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = m ? clipPlan(m) : null;
  const doneRef = React.useRef(onDone);
  doneRef.current = onDone;

  React.useEffect(() => {
    if (!open) return;
    const t0 = Date.now();
    setStarted(t0);
    setNow(t0);
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(t);
  }, [open, m?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const elapsed = open ? now - started : 0;
  const k = plan ? Math.min(1, elapsed / plan.waitMs) : 0;
  const ready = k >= 1;
  const secsLeft = plan ? Math.max(0, Math.ceil((plan.waitMs - elapsed) / 1000)) : 0;

  // Hand the clip over a beat after it's ready, so the creator sees what was attached.
  React.useEffect(() => {
    if (!ready || !clip) return;
    const t = window.setTimeout(() => doneRef.current(clip), 1400);
    return () => window.clearTimeout(t);
  }, [ready, clip]);

  if (!m || !result || !clip || !plan) return <Dialog open={false} />;
  const s = streamerByHandle(m.handle);
  const step = STEPS.reduce((i, st, idx) => (k >= st.at ? idx : i), 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !ready) onCancel(); }}>
      <DialogContent
        className="max-w-md gap-5"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => { e.preventDefault(); if (!ready) onCancel(); }}
        aria-describedby="clip-desc"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ready ? <><Check className="h-5 w-5 text-neon" strokeWidth={3} /> Evidence clip ready</> : <><Loader2 className="h-5 w-5 animate-spin text-neon" /> Please wait while the evidence clip is created</>}
          </DialogTitle>
          <DialogDescription id="clip-desc">
            {ready
              ? <>Posting the result as <b className={result === "YES" ? "text-yes" : "text-no"}>{result}</b> with this clip attached.</>
              : <>You picked <b className={result === "YES" ? "text-yes" : "text-no"}>{result}</b>. Your question was open for {durLabel(plan.durationSec)}, so we clip {durLabel(plan.clipSec)} around the moment. Keep playing, nothing else to do.</>}
          </DialogDescription>
        </DialogHeader>

        {s && (
          <StreamThumb s={{ ...s, live: true }} frame={3} className="rounded-xl">
            <span className={cn("absolute inset-0 grid place-items-center transition", ready ? "bg-black/20" : "bg-black/55")}>
              {ready ? <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-lime-ink"><Play className="h-5 w-5" /></span> : <ScanSearch className="h-8 w-8 animate-pulse text-white/80" />}
            </span>
            {!ready && <span aria-hidden className="absolute inset-y-0 w-0.5 bg-lime shadow-[0_0_12px_2px_rgba(200,255,0,.6)]" style={{ left: `${Math.min(100, (k / 0.38) * 100)}%`, opacity: k < 0.38 ? 1 : 0 }} />}
            <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-xs text-white">{k >= 0.38 ? `${clip.start} – ${clip.end}` : "scanning…"}</span>
            {k >= 0.52 && <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 font-mono text-xs text-white">{durLabel(clip.sec)}</span>}
          </StreamThumb>
        )}

        <div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(k * 100)} aria-label="Creating evidence clip">
            <div className="h-full rounded-full bg-lime transition-[width] duration-100" style={{ width: `${k * 100}%` }} />
          </div>
          <p className="mt-1.5 flex justify-between font-mono text-xs text-muted-foreground"><span>{Math.round(k * 100)}%</span><span>{ready ? "done" : `about ${secsLeft} s left`}</span></p>
        </div>

        <ol className="grid gap-2 text-sm" aria-live="polite">
          {STEPS.map((st, i) => {
            const Icon = st.icon;
            const state = ready || i < step ? "done" : i === step ? "now" : "todo";
            return (
              <li key={i} className={cn("flex items-center gap-2.5", state === "todo" && "text-muted-foreground/60")}>
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", state === "done" && "border-neon bg-lime text-lime-ink", state === "now" && "border-neon text-neon")}>
                  {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : state === "now" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className={cn(state === "now" && "font-semibold")}>{st.label(clip, state === "todo")}</span>
              </li>
            );
          })}
        </ol>

        {!ready && (
          <Button variant="secondary" className="h-12" onClick={onCancel}>Stop, don’t settle yet</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** One-line clip summary for done states and viewer evidence. */
export function ClipLine({ clip, className }: { clip: EvidenceClip; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs", className)}>
      <Film className="h-3.5 w-3.5" /> {durLabel(clip.sec)} clip · {clip.start} – {clip.end}
    </span>
  );
}
