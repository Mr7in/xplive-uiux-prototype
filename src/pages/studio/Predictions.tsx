import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Clock, Hourglass, Lock, Plus, TimerReset, XCircle } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { pool, yesPct, type Market } from "@/data/markets";
import { EmptyState, MarketStatus, PageHeader, SplitBar } from "@/components/xp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, fmt, fmtUSDC, timeLeft } from "@/lib/utils";
import { CompanionPromo } from "./Companion";

const DURATIONS = [
  { v: "60", l: "1 min" }, { v: "120", l: "2 min" }, { v: "300", l: "5 min" }, { v: "600", l: "10 min" }, { v: "900", l: "15 min" },
];
const STARTERS = ["Will the next bonus buy pay over 100×?", "Will I hit a max win tonight?", "Will the next spin land a bonus?"];

/** Ask a YES/NO question. Outcomes are fixed: there is no free-text outcome field. */
export function AskQuestion({ compact = false }: { compact?: boolean }) {
  const { user, markets, createMarket } = useStore();
  const [q, setQ] = React.useState("");
  const [rule, setRule] = React.useState("");
  const [dur, setDur] = React.useState("300");
  const busy = markets.find((m) => m.handle === user?.channel && m.status === "open");
  const qOk = q.trim().length >= 10 && q.trim().endsWith("?");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.channel || !qOk || busy) return;
    createMarket(user.channel, q.trim(), rule.trim() || "Settled on what viewers can see on stream.", Number(dur));
    toast.success("Question is live", { description: `Viewers can predict for ${DURATIONS.find((d) => d.v === dur)?.l}.` });
    setQ(""); setRule("");
  };
  return (
    <Card className={cn()}>
      <CardHeader>
        <CardTitle className="text-lg">Ask a question</CardTitle>
        <CardDescription>Viewers answer YES or NO before the timer ends. Ask about something that’s decided after it closes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="q">Question</Label>
            <Input id="q" value={q} onChange={(e) => setQ(e.target.value.slice(0, 120))} placeholder="Will the next bonus buy pay over 100×?" className="h-12 text-base" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>{q && !q.trim().endsWith("?") ? "End with a question mark." : "Clear, about one event, answerable with YES or NO."}</span><span className="font-mono">{q.length}/120</span></div>
            {!compact && !q && (
              <div className="flex flex-wrap gap-1.5">{STARTERS.map((s) => <button type="button" key={s} onClick={() => setQ(s)} className="rounded-full border px-3 py-1 text-xs text-label hover:border-input hover:text-foreground">{s}</button>)}</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Outcomes</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex h-11 items-center justify-between rounded-lg bg-yes-tint px-3 font-display font-bold text-yes">YES <Lock className="h-3.5 w-3.5 opacity-70" /></div>
              <div className="flex h-11 items-center justify-between rounded-lg bg-no-tint px-3 font-display font-bold text-no">NO <Lock className="h-3.5 w-3.5 opacity-70" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Every question has exactly two outcomes, YES and NO.</p>
          </div>
          {!compact && (
            <div className="grid gap-2">
              <Label htmlFor="rule">How it’s decided <span className="font-normal text-muted-foreground">(shown to viewers)</span></Label>
              <Textarea id="rule" rows={2} value={rule} onChange={(e) => setRule(e.target.value.slice(0, 200))} placeholder="Next bonus buy after the question closes. Multiplier as shown by the game." />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Open for</Label>
            <ToggleGroup type="single" value={dur} onValueChange={(v) => v && setDur(v)} className="w-fit flex-wrap" aria-label="Open for">
              {DURATIONS.map((d) => <ToggleGroupItem key={d.v} value={d.v}>{d.l}</ToggleGroupItem>)}
            </ToggleGroup>
          </div>
          {busy && <p className="rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">“{busy.question}” is still open. Close it before asking the next one.</p>}
          <Button type="submit" size="lg" disabled={!qOk || !!busy}><Plus /> Start question</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function RunningQuestion({ m }: { m: Market }) {
  const { closeMarket, extendMarket } = useStore();
  const [confirmVoid, setConfirmVoid] = React.useState(false);
  const nav = useNavigate();
  return (
    <Card className="">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"><span className="h-2 w-2 animate-live-pulse rounded-full bg-live" /> Running now</span><span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-sm font-bold"><Clock className="h-3.5 w-3.5" />{timeLeft(m.secondsLeft ?? 0)}</span></div>
        <p className="font-display text-xl font-bold leading-snug">{m.question}</p>
        <SplitBar m={m} />
        <div className="flex justify-between font-mono text-xs"><span className="text-yes">YES {yesPct(m)}% · {fmt(m.yesPool)}</span><span className="text-muted-foreground">{fmt(m.predictors)} in</span><span className="text-no">{fmt(m.noPool)} · {100 - yesPct(m)}% NO</span></div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="secondary" onClick={() => { closeMarket(m.id); toast("Predictions closed", { description: "Propose the result once it’s decided on stream." }); }}><XCircle /> Close now</Button>
          <Button variant="outline" onClick={() => extendMarket(m.id, 60)}><TimerReset /> +1 min</Button>
          <Button variant="ghost" onClick={() => setConfirmVoid(true)}>Void</Button>
        </div>
      </CardContent>
      <Dialog open={confirmVoid} onOpenChange={setConfirmVoid}>
        <DialogContent>
          <DialogHeader><DialogTitle>Void this question?</DialogTitle><DialogDescription>Predictions close and all {fmt(m.predictors)} predictors get their USDC back. You’ll pick a reason on the next screen.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="secondary" onClick={() => setConfirmVoid(false)}>Keep it running</Button><Button variant="destructive" onClick={() => { closeMarket(m.id); setConfirmVoid(false); nav(`/studio/predictions/${m.id}/result?void=1`); }}>Close and void</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function NeedsResult({ m }: { m: Market }) {
  return (
    <Card className="border-2 border-warn/60 bg-warn-bg">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"><Hourglass className="h-3.5 w-3.5" /> Needs your result</span><span className="text-xs text-label">Closed {m.closedMinsAgo ?? 0} min ago · {fmt(m.predictors)} waiting</span></div>
        <p className="font-display text-xl font-bold leading-snug">{m.question}</p>
        <p className="text-sm text-label">{fmtUSDC(pool(m))} is waiting to be paid out. Unresolved questions are voided automatically after 60 minutes.</p>
        <Button asChild size="lg" className="w-full"><Link to={`/studio/predictions/${m.id}/result`}>Propose the result</Link></Button>
      </CardContent>
    </Card>
  );
}

export default function StudioPredictions() {
  usePageMeta("Predictions · Studio");
  const { user, markets } = useStore();
  const mine = markets.filter((m) => m.handle === user?.channel);
  const open = mine.find((m) => m.status === "open");
  const awaiting = mine.filter((m) => m.status === "awaiting");
  const history = mine.filter((m) => m.status === "settled" || m.status === "voided");
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title="Predictions" description="Ask YES/NO questions about what happens on your stream. One question runs at a time." />
      <CompanionPromo />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <AskQuestion />
        <div className="space-y-4">
          {awaiting.map((m) => <NeedsResult key={m.id} m={m} />)}
          {open ? <RunningQuestion m={open} /> : !awaiting.length && <EmptyState title="Nothing running" body="Start a question and it appears beside your player for every viewer." />}
          <Card>
            <CardHeader><CardTitle>Good questions</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-label">
              <p>✓ About one event that viewers will see on stream.</p>
              <p>✓ Decided after the timer ends, not already happening.</p>
              <p>✗ Not about you breaking rules, age, or personal details.</p>
              <p>✗ Never about outcomes you control in secret.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <section>
        <h2 className="mb-3 font-display text-xl font-bold">History</h2>
        {history.length ? (
          <Table>
            <TableHeader><TableRow><TableHead>Question</TableHead><TableHead className="text-right">Pool</TableHead><TableHead className="text-right">Predictors</TableHead><TableHead>Result</TableHead><TableHead className="text-right">Your fee (1%)</TableHead></TableRow></TableHeader>
            <TableBody>{history.map((m) => <TableRow key={m.id}><TableCell className="font-semibold">{m.question}</TableCell><TableCell className="text-right font-mono">{fmt(pool(m))}</TableCell><TableCell className="text-right font-mono">{fmt(m.predictors)}</TableCell><TableCell><MarketStatus m={m} /></TableCell><TableCell className="text-right font-mono">{m.status === "settled" ? fmt(Math.round(pool(m) * 0.01)) : "0"}</TableCell></TableRow>)}</TableBody>
          </Table>
        ) : <EmptyState title="No finished questions yet" body="Settled and voided questions appear here with their pool and your creator fee." />}
      </section>
    </div>
  );
}
