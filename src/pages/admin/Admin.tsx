import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Check, Download, Filter, Plus, Search, X } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { pool, type Market } from "@/data/markets";
import { streamerByHandle, streamers } from "@/data/streamers";
import { categories, categoryBySlug } from "@/data/categories";
import {
  adminUsers, appeals, auditLog, treasury, stuckTx, badgeReviews, emoteReviews, farmFlags, killSwitches, paymentIssues, payoutQueue, reports, reservedHandles, sanctions, stopLevers, supportQueue,
} from "@/data/admin";
import { ChannelAvatar, MarketStatus, PageHeader, Stat, categoryStats, EmptyState } from "@/components/xp";
import { BoxArt } from "@/components/brand/BoxArt";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger, PillTabsList, PillTabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, compact, fmt, fmtUSD2, fmtUSDC } from "@/lib/utils";
import { NETWORK, addressUrl, short } from "@/lib/chain";
import { NetworkChip, TxLink } from "@/components/WalletDialogs";

const Page = ({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) => {
  usePageMeta(`${title} · Admin`);
  return <div className="mx-auto max-w-[1400px] space-y-6"><PageHeader title={title} description={description} actions={actions} />{children}</div>;
};

const sevVariant = (s: string) => (s === "Critical" || s === "High" ? "danger" : s === "Medium" ? "warning" : "muted") as "danger" | "warning" | "muted";

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="pl-9" />
    </div>
  );
}

/** Every irreversible admin action asks for a reason that lands in the audit log. */
function ReasonDialog({ open, onOpenChange, title, body, confirm, danger, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: string; confirm: string; danger?: boolean; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{body}</DialogDescription></DialogHeader>
        <div className="grid gap-2"><Label htmlFor="reason">Reason (saved to the audit log)</Label><Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} /></div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={danger ? "destructive" : "default"} disabled={reason.trim().length < 4} onClick={() => { onConfirm(reason); onOpenChange(false); }}>{confirm}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Overview ───────────────────────────────────────────────────────────── */
export function Overview() {
  const { markets } = useStore();
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const live = streamers.filter((s) => s.live);
  const open = markets.filter((m) => m.status === "open");
  const awaiting = markets.filter((m) => m.status === "awaiting");
  const disputed = markets.filter((m) => m.dispute);
  const attention = [
    ...disputed.map((m) => ({ k: m.id, title: m.question, sub: `${streamerByHandle(m.handle)?.name} · creator settled ${m.outcome} · disputed by ${m.dispute!.by}`, type: "Dispute", tone: "warning" as const, due: "1h 12m", href: `/admin/markets/${m.id}`, action: "Review" })),
    ...reports.filter((r) => r.severity === "Critical" || r.severity === "High").map((r) => ({ k: r.id, title: r.target, sub: `${r.category} · reported by ${r.reporter}`, type: "Report", tone: "danger" as const, due: r.severity === "Critical" ? "now" : "3h", href: "/admin/moderation/reports", action: "Open" })),
    ...awaiting.filter((m) => (m.closedMinsAgo ?? 0) > 15).map((m) => ({ k: m.id, title: m.question, sub: `${streamerByHandle(m.handle)?.name} · closed ${m.closedMinsAgo} min ago, no result`, type: "Late result", tone: "muted" as const, due: `auto-void in ${60 - (m.closedMinsAgo ?? 0)}m`, href: `/admin/markets/${m.id}`, action: "Inspect" })),
    ...payoutQueue.filter((p) => p.status === "Needs approval").map((p) => ({ k: p.id, title: `${p.creator} · ${fmtUSDC(p.amount)}`, sub: p.hold || "Weekly payout batch", type: "Payout", tone: "muted" as const, due: "Mon", href: "/admin/payouts", action: "Approve" })),
  ];
  return (
    <Page title="Operations" description="Wednesday 28 October 2026">
      <form onSubmit={(e) => { e.preventDefault(); nav(`/admin/users?q=${encodeURIComponent(q)}`); }}><SearchInput value={q} onChange={setQ} placeholder="Find a user, channel or question by name, email or ID" /></form>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Live channels" value={live.length} /><Stat label="Watching now" value={compact(live.reduce((a, s) => a + s.viewers, 0))} />
        <Stat label="Open questions" value={open.length} tone="neon" /><Stat label="Awaiting result" value={awaiting.length} tone="warn" />
        <Stat label="Open disputes" value={disputed.length} tone="warn" /><Stat label="Open reports" value={reports.filter((r) => r.status !== "Resolved").length} tone="danger" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Needs attention</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Type</TableHead><TableHead>Due</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{attention.map((a) => <TableRow key={a.k + a.type}><TableCell><span className="block font-semibold">{a.title}</span><span className="text-xs text-muted-foreground">{a.sub}</span></TableCell><TableCell><Badge variant={a.tone}>{a.type}</Badge></TableCell><TableCell className="whitespace-nowrap font-mono text-xs">{a.due}</TableCell><TableCell className="text-right"><Button asChild size="sm" variant={a.type === "Dispute" ? "default" : "secondary"}><Link to={a.href}>{a.action}</Link></Button></TableCell></TableRow>)}</TableBody>
          </Table>
          <h2 className="mb-3 mt-8 font-display text-lg font-bold">Live now</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead className="text-right">Viewers</TableHead><TableHead>Open question</TableHead><TableHead className="text-right">Pool</TableHead></TableRow></TableHeader>
            <TableBody>{live.sort((a, b) => b.viewers - a.viewers).slice(0, 10).map((s) => { const m = open.find((x) => x.handle === s.handle); return <TableRow key={s.handle}><TableCell><Link to={`/${s.handle}`} className="flex items-center gap-2 font-semibold hover:text-foreground"><ChannelAvatar s={s} size={26} ring={false} />{s.name}</Link></TableCell><TableCell className="text-right font-mono">{fmt(s.viewers)}</TableCell><TableCell className="max-w-xs truncate text-label">{m?.question ?? "—"}</TableCell><TableCell className="text-right font-mono">{m ? fmt(pool(m)) : "—"}</TableCell></TableRow>; })}</TableBody>
          </Table>
        </section>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Platform controls</CardTitle><CardDescription>Emergency switches. Changes need a reason.</CardDescription></CardHeader>
            <CardContent><ul className="divide-y text-sm">{killSwitches.map((k) => <li key={k.key} className="flex items-center justify-between py-2.5"><span>{k.name}</span>{k.on ? <Badge variant="neon">On</Badge> : <Badge variant="warning">Paused</Badge>}</li>)}</ul></CardContent>
            <CardFooter><Button asChild variant="secondary" className="w-full"><Link to="/admin/controls">Manage controls</Link></Button></CardFooter>
          </Card>
          <Card>
            <CardHeader><CardTitle>Last 30 days</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[["Prediction volume", fmtUSDC(48_120)], ["Platform fees (3%)", fmtUSDC(1_443.6)], ["Tips (gross)", fmtUSDC(4_812)], ["Questions settled", "1,284"], ["Disputes upheld", "3 of 41"], ["Voided questions", "6.2%"]].map(([k, v]) => <p key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></p>)}
            </CardContent>
          </Card>
        </aside>
      </div>
    </Page>
  );
}

/* ── Predictions ────────────────────────────────────────────────────────── */
export function AdminMarkets() {
  const { markets } = useStore();
  const [status, setStatus] = React.useState("all");
  const [q, setQ] = React.useState("");
  const list = markets.filter((m) => (status === "all" || m.status === status || (status === "disputed" && m.dispute)) && (m.question + m.handle).toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="All questions" description="Every prediction question on the platform. Open one to inspect, force-close, void or resolve a dispute.">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search questions or channels" />
        <Tabs value={status} onValueChange={setStatus}><PillTabsList>{[["all", "All"], ["open", "Open"], ["awaiting", "Awaiting result"], ["settled", "Settled"], ["voided", "Voided"], ["disputed", "Disputed"]].map(([v, l]) => <PillTabsTrigger key={v} value={v}>{l} <span className="font-mono text-xs opacity-70">{markets.filter((m) => v === "all" || m.status === v || (v === "disputed" && m.dispute)).length}</span></PillTabsTrigger>)}</PillTabsList></Tabs>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Question</TableHead><TableHead>Channel</TableHead><TableHead className="text-right">Pool USDC</TableHead><TableHead className="text-right">Predictors</TableHead><TableHead>State</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {list.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{m.id}</TableCell>
              <TableCell className="min-w-[280px] font-semibold">{m.question}</TableCell>
              <TableCell className="whitespace-nowrap">{streamerByHandle(m.handle)?.name}</TableCell>
              <TableCell className="text-right font-mono">{fmtUSD2(pool(m))}</TableCell>
              <TableCell className="text-right font-mono">{fmt(m.predictors)}</TableCell>
              <TableCell><MarketStatus m={m} /></TableCell>
              <TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link to={`/admin/markets/${m.id}`}>Open</Link></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Page>
  );
}

export function Disputes() {
  const { markets } = useStore();
  const list = markets.filter((m) => m.dispute);
  return (
    <Page title="Disputes" description="Viewers challenged these results. Payouts are held until you decide.">
      {list.length ? (
        <div className="space-y-3">{list.map((m) => (
          <Card key={m.id} className="border-warn/40"><CardContent className="flex flex-wrap items-center gap-4 pt-5">
            <div className="min-w-0 flex-1"><p className="text-sm text-muted-foreground">{streamerByHandle(m.handle)?.name} · creator settled {m.outcome}</p><p className="font-display text-lg font-bold">{m.question}</p><p className="mt-1 text-sm text-label">“{m.dispute!.statement}”</p></div>
            <div className="text-right text-sm"><p className="font-mono">{fmtUSDC(pool(m))}</p><p className="text-muted-foreground">filed {m.dispute!.filedMinsAgo} min ago</p></div>
            <Button asChild><Link to={`/admin/markets/${m.id}`}>Review</Link></Button>
          </CardContent></Card>
        ))}</div>
      ) : <EmptyState title="No open disputes" body="When a viewer disputes a result it appears here and on the overview." />}
    </Page>
  );
}

export function MarketReview() {
  const { id } = useParams();
  const { markets, adminDecide, closeMarket } = useStore();
  const m = markets.find((x) => x.id === id);
  usePageMeta("Question review · Admin");
  const [decision, setDecision] = React.useState<"YES" | "NO" | "VOID" | null>(null);
  const [reason, setReason] = React.useState("");
  const [confirm, setConfirm] = React.useState(false);
  if (!m) return <EmptyState title="Question not found" />;
  const s = streamerByHandle(m.handle)!;
  const winners = (side: "YES" | "NO") => Math.round(m.predictors * ((side === "YES" ? m.yesPool : m.noPool) / Math.max(1, pool(m))));
  const resolvable = m.status === "awaiting" || !!m.dispute || m.status === "open";
  const opts: { v: "YES" | "NO" | "VOID"; t: string; d: string; cls: string }[] = [
    { v: "YES", t: !m.dispute ? "Settle YES" : m.outcome === "YES" ? "Uphold YES" : "Overturn to YES", d: `${fmt(winners("YES"))} viewers paid from ${fmtUSDC(pool(m))}.${m.dispute && m.outcome === "NO" ? " Disputer’s bond returned." : ""}`, cls: "border-yes bg-yes-tint" },
    { v: "NO", t: !m.dispute ? "Settle NO" : m.outcome === "NO" ? "Uphold NO" : "Overturn to NO", d: `${fmt(winners("NO"))} viewers paid instead.${m.dispute && m.outcome === "YES" ? " Disputer’s bond returned." : ""}`, cls: "border-no bg-no-tint" },
    { v: "VOID", t: "Void", d: "Everyone gets their USDC back. Use when the outcome can’t be verified.", cls: "border-foreground bg-secondary" },
  ];
  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      <Link to="/admin/markets" className="inline-flex items-center gap-1.5 text-sm text-label hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All questions</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="mb-2 flex flex-wrap gap-2"><MarketStatus m={m} />{m.dispute && <Badge variant="warning">Payouts held</Badge>}<span className="font-mono text-xs text-muted-foreground">{m.id}</span></div><h1 className="font-display text-3xl font-extrabold leading-tight">{m.question}</h1><p className="mt-1 text-muted-foreground"><Link to={`/${s.handle}`} className="hover:text-foreground">{s.name}</Link> · {categoryBySlug(s.category)?.name} · {m.rule}</p></div>
        {m.status === "open" && <Button variant="destructive-outline" onClick={() => { closeMarket(m.id); toast("Question force-closed"); }}>Force close</Button>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Pool" value={fmtUSD2(pool(m))} sub="USDC" /><Stat label="On YES" value={fmtUSD2(m.yesPool)} tone="yes" sub="USDC" /><Stat label="On NO" value={fmtUSD2(m.noPool)} tone="no" sub="USDC" /><Stat label="Predictors" value={fmt(m.predictors)} /></div>
          <Card>
            <CardHeader><CardTitle>Evidence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-[16/7] overflow-hidden rounded-xl"><BoxArt c={categoryBySlug(s.category)!} size={[600, 800]} /><span className="absolute left-3 top-3 rounded bg-black/75 px-2 py-0.5 font-mono text-xs text-white">Recording at close · 3:42:10</span></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border p-4"><p className="mb-1 text-xs text-muted-foreground">Creator’s evidence</p><p>{m.evidence ?? "None submitted yet."}</p></div>
                {m.dispute && <div className="rounded-xl border border-warn/40 bg-warn-bg p-4"><p className="mb-1 text-xs text-warn">Dispute · {m.dispute.by} · predicted {m.dispute.side} · {fmtUSDC(m.dispute.stake)}</p><p>“{m.dispute.statement}”</p></div>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><ol className="space-y-3 border-l-2 pl-5 text-sm">
              <li><span className="font-mono text-xs text-muted-foreground">Opened</span> · question asked by {s.name}</li>
              <li><span className="font-mono text-xs text-muted-foreground">{m.closedMinsAgo ?? 0} min ago</span> · closed with {fmt(m.predictors)} predictions</li>
              {m.status === "settled" && <li><span className="font-mono text-xs text-muted-foreground">{m.settledMinsAgo} min ago</span> · creator settled {m.outcome}</li>}
              {m.dispute && <li><span className="font-mono text-xs text-muted-foreground">{m.dispute.filedMinsAgo} min ago</span> · disputed by {m.dispute.by}, payouts held</li>}
              {m.status === "voided" && <li>Voided · {m.voidReason}</li>}
            </ol></CardContent>
          </Card>
        </div>
        <aside>
          <Card className="sticky top-20">
            <CardHeader><CardTitle className="text-lg">{m.dispute ? "Your decision" : "Resolve"}</CardTitle><CardDescription>{resolvable ? "Pick the final outcome. Viewers are notified with your reason." : "This question is closed and needs no action."}</CardDescription></CardHeader>
            {resolvable && (
              <CardContent className="space-y-3">
                <div role="radiogroup" aria-label="Final outcome" className="space-y-2">
                  {opts.map((o) => <button key={o.v} role="radio" aria-checked={decision === o.v} onClick={() => setDecision(o.v)} className={cn("w-full rounded-xl border-2 p-3 text-left transition", decision === o.v ? o.cls : "border-border hover:border-input")}><span className="block font-semibold">{o.t}</span><span className="text-xs text-muted-foreground">{o.d}</span></button>)}
                </div>
                <div className="grid gap-2"><Label htmlFor="r">Reason (shown to creator and disputer)</Label><Textarea id="r" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
                <Button className="w-full" size="lg" disabled={!decision || reason.trim().length < 6} onClick={() => setConfirm(true)}>Confirm decision</Button>
                <div className="grid grid-cols-2 gap-2"><Button variant="secondary" size="sm" onClick={() => toast("Asked creator for evidence")}>Ask creator</Button><Button variant="secondary" size="sm" onClick={() => toast("Escalated to lead")}>Escalate</Button></div>
              </CardContent>
            )}
            <CardFooter className="text-xs text-muted-foreground">Creator history: 14 settled · 1 overturned · 3 voided</CardFooter>
          </Card>
        </aside>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{decision === "VOID" ? "Void and refund everyone?" : `Final result: ${decision}?`}</DialogTitle><DialogDescription>This can’t be undone. {fmt(m.predictors)} viewers will be notified.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={() => { adminDecide(m.id, decision!, reason); setConfirm(false); toast.success("Decision saved and paid out"); }}>Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Controls() {
  const [state, setState] = React.useState(() => Object.fromEntries(killSwitches.map((k) => [k.key, k.on])));
  const [pending, setPending] = React.useState<string | null>(null);
  const k = killSwitches.find((x) => x.key === pending);
  return (
    <Page title="Platform controls" description="Emergency switches for predictions. Pausing holds activity; nothing in flight is lost.">
      <div className="grid gap-3 md:grid-cols-2">
        {killSwitches.map((x) => (
          <Card key={x.key} className={!state[x.key] ? "border-warn/50" : ""}>
            <CardContent className="flex items-start gap-4 pt-5">
              <div className="flex-1"><p className="flex items-center gap-2 font-semibold">{x.name} {state[x.key] ? <Badge variant="neon">On</Badge> : <Badge variant="warning">Paused</Badge>}</p><p className="mt-1 text-sm text-muted-foreground">{x.body}</p><p className="mt-2 text-xs text-muted-foreground">Last changed: {x.changed}</p></div>
              <Switch checked={state[x.key]} onCheckedChange={() => setPending(x.key)} aria-label={`${x.name}`} />
            </CardContent>
          </Card>
        ))}
      </div>
      <ReasonDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} title={k ? `${state[k.key] ? "Pause" : "Resume"} ${k.name.toLowerCase()}?` : ""} body={k?.body ?? ""} confirm={k && state[k.key] ? "Pause" : "Resume"} danger={!!k && state[k.key]} onConfirm={() => { if (k) { setState((s) => ({ ...s, [k.key]: !s[k.key] })); toast.success(`${k.name} ${state[k.key] ? "paused" : "resumed"}`); } }} />
    </Page>
  );
}

export function Referrals() {
  return (
    <Page title="Referral programme" description="Viewers earn a USDC bonus when friends they invite make their first prediction.">
      <div className="grid gap-3 md:grid-cols-4"><Stat label="Status" value="Paused" tone="warn" /><Stat label="Referred sign-ups (30d)" value="412" /><Stat label="Qualified" value="188" /><Stat label="Bonuses paid" value="940.00" sub="USDC" /></div>
      <Card><CardHeader><CardTitle>Rules</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2"><Label>Bonus to referrer (USDC)</Label><Input defaultValue="5.00" className="font-mono" /></div>
        <div className="grid gap-2"><Label>Bonus to new user (USDC)</Label><Input defaultValue="2.50" className="font-mono" /></div>
        <div className="grid gap-2"><Label>Max referrals per user / month</Label><Input defaultValue="20" className="font-mono" /></div>
      </CardContent><CardFooter className="justify-end"><Button onClick={() => toast.success("Saved")}>Save rules</Button></CardFooter></Card>
    </Page>
  );
}

/* ── Trust & safety ─────────────────────────────────────────────────────── */
export function Reports() {
  const [status, setStatus] = React.useState("Open");
  const [sel, setSel] = React.useState<(typeof reports)[number] | null>(null);
  const list = reports.filter((r) => status === "All" || r.status === status);
  return (
    <Page title="Reports" description="User and system reports. Claim one to review the evidence and act.">
      <Tabs value={status} onValueChange={setStatus}><PillTabsList>{["Open", "In review", "Triaged", "Escalated", "All"].map((s) => <PillTabsTrigger key={s} value={s}>{s}</PillTabsTrigger>)}</PillTabsList></Tabs>
      <Table>
        <TableHeader><TableRow><TableHead>Severity</TableHead><TableHead>Category</TableHead><TableHead>Target</TableHead><TableHead>Reporter</TableHead><TableHead>Filed</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{list.map((r) => <TableRow key={r.id}><TableCell><Badge variant={sevVariant(r.severity)}>{r.severity}</Badge></TableCell><TableCell>{r.category}</TableCell><TableCell className="font-semibold">{r.target}</TableCell><TableCell>{r.reporter}</TableCell><TableCell className="text-muted-foreground">{r.filed}</TableCell><TableCell><Badge variant="muted">{r.status}</Badge></TableCell><TableCell className="text-right"><Button size="sm" onClick={() => setSel(r)}>Review</Button></TableCell></TableRow>)}</TableBody>
      </Table>
      {!list.length && <EmptyState title="Queue is clear" />}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{sel?.id} · {sel?.category}</DialogTitle><DialogDescription>{sel?.target} · reported by {sel?.reporter}, {sel?.filed}</DialogDescription></DialogHeader>
          <div className="rounded-lg bg-secondary p-3 text-sm chat-safe">“{sel?.excerpt}”</div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => { setSel(null); toast("Dismissed"); }}>Dismiss</Button>
            <Button variant="secondary" onClick={() => { setSel(null); toast("Message removed, warning sent"); }}>Remove + warn</Button>
            <Button variant="secondary" onClick={() => { setSel(null); toast("Timed out for 24 h"); }}>Time out 24 h</Button>
            <Button variant="destructive" onClick={() => { setSel(null); toast("User suspended"); }}>Suspend user</Button>
          </div>
          {sel?.category === "Self-harm" && <p className="rounded-lg border border-cyan/40 bg-cyan/5 p-3 text-sm">Send the user our support resources message before taking any other action.</p>}
          {sel?.category === "Underage user" && <p className="rounded-lg border border-coral/40 bg-coral/5 p-3 text-sm">Lock the account’s access to casino categories now, then request age verification.</p>}
        </DialogContent>
      </Dialog>
    </Page>
  );
}

export function Sanctions() {
  return (
    <Page title="Sanctions" description="Active bans, suspensions and restrictions across the platform." actions={<Button variant="secondary"><Plus /> New sanction</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Reason</TableHead><TableHead>By</TableHead><TableHead>Since</TableHead><TableHead>Expires</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{sanctions.map((s) => <TableRow key={s.user}><TableCell className="font-semibold">{s.user}</TableCell><TableCell><Badge variant={s.type.includes("Permanent") ? "danger" : "warning"}>{s.type}</Badge></TableCell><TableCell className="text-label">{s.reason}</TableCell><TableCell>{s.by}</TableCell><TableCell className="text-muted-foreground">{s.when}</TableCell><TableCell className="text-muted-foreground">{s.expires}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Lift</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Appeals() {
  return (
    <Page title="Appeals" description="Users asking for a sanction to be lifted.">
      <div className="space-y-3">{appeals.map((a) => (
        <Card key={a.id}><CardContent className="flex flex-wrap items-center gap-4 pt-5">
          <div className="min-w-0 flex-1"><p className="text-sm text-muted-foreground">{a.id} · {a.sanction} · filed {a.filed}</p><p className="font-semibold">{a.user}</p><p className="text-label">“{a.statement}”</p></div>
          <div className="flex gap-2"><Button onClick={() => toast.success("Appeal accepted, sanction lifted")}><Check /> Accept</Button><Button variant="secondary" onClick={() => toast("Appeal denied")}><X /> Deny</Button></div>
        </CardContent></Card>
      ))}</div>
    </Page>
  );
}

export function EmoteReview() {
  return (
    <Page title="Emote review" description="Approve emotes before they go live in chat.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{emoteReviews.map((e, i) => (
        <Card key={e.code}><CardContent className="space-y-3 pt-5">
          <div className="flex items-center gap-3"><div className="grid h-16 w-16 place-items-center rounded-xl bg-surface-2 font-display text-2xl font-black" style={{ color: ["#c8ff00", "#a78bfa", "#34edc5"][i] }}>{e.code.slice(0, 2)}</div><div><p className="font-mono">{e.code}</p><p className="text-sm text-muted-foreground">{e.channel} · {e.submitted}</p></div></div>
          {e.note && <p className="rounded-md bg-warn/10 px-2 py-1 text-xs text-warn">{e.note}</p>}
          <div className="flex gap-2"><Button size="sm" onClick={() => toast.success("Approved")}>Approve</Button><Button size="sm" variant="secondary" onClick={() => toast("Rejected")}>Reject</Button></div>
        </CardContent></Card>
      ))}</div>
    </Page>
  );
}

export function BadgeReview() {
  return (
    <Page title="Badge review" description="Custom channel badges awaiting approval.">
      <Table>
        <TableHeader><TableRow><TableHead>Badge</TableHead><TableHead>Channel</TableHead><TableHead>Rule</TableHead><TableHead>Submitted</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{badgeReviews.map((b) => <TableRow key={b.name}><TableCell className="font-semibold">{b.name}</TableCell><TableCell>{b.channel}</TableCell><TableCell className="text-label">{b.rule}</TableCell><TableCell className="text-muted-foreground">{b.submitted}</TableCell><TableCell className="text-right"><Button size="sm" onClick={() => toast.success("Approved")}>Approve</Button> <Button size="sm" variant="ghost">Reject</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

/* ── Accounts ───────────────────────────────────────────────────────────── */
export function Users() {
  const [params] = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");
  const list = adminUsers.filter((u) => (u.name + u.email + u.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="Users" description={`${fmt(48_211)} accounts. Search by name, email or ID.`} actions={<Button variant="secondary"><Download /> Export</Button>}>
      <SearchInput value={q} onChange={setQ} placeholder="Search users" />
      <Table>
        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Country</TableHead><TableHead className="text-right">Flags</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{list.map((u) => <TableRow key={u.id}><TableCell className="font-semibold">{u.name}</TableCell><TableCell className="text-label">{u.email}</TableCell><TableCell><Badge variant={u.role === "Admin" ? "neon" : u.role === "Creator" ? "no" : "muted"}>{u.role}</Badge></TableCell><TableCell><Badge variant={u.status === "Active" ? "muted" : u.status === "Banned" ? "danger" : "warning"}>{u.status}</Badge></TableCell><TableCell>{u.country}</TableCell><TableCell className="text-right font-mono">{u.flags}</TableCell><TableCell className="text-muted-foreground">{u.joined}</TableCell><TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link to={`/admin/users/${u.id}`}>Open</Link></Button></TableCell></TableRow>)}</TableBody>
      </Table>
      {!list.length && <EmptyState title="No users match" />}
    </Page>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const u = adminUsers.find((x) => x.id === id) ?? adminUsers[0];
  const [act, setAct] = React.useState<string | null>(null);
  usePageMeta(`${u.name} · Admin`);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-label hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Users</Link>
      <PageHeader title={u.name} description={`${u.email} · ${u.id} · joined ${u.joined}`} actions={<><Button variant="secondary" onClick={() => setAct("Reset password")}>Reset password</Button><Button variant="secondary" onClick={() => setAct("Adjust balance")}>Adjust balance</Button><Button variant="destructive-outline" onClick={() => setAct("Suspend account")}>Suspend</Button></>} />
      <div className="grid gap-3 md:grid-cols-4"><Stat label="Role" value={u.role} /><Stat label="Status" value={u.status} tone={u.status === "Active" ? undefined : "danger"} /><Stat label="USDC balance" value="82.00" /><Stat label="Reports against" value={u.flags} /></div>
      <Tabs defaultValue="activity">
        <TabsList><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="predictions">Predictions</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger><TabsTrigger value="sanctions">Sanctions</TabsTrigger><TabsTrigger value="sessions">Sessions</TabsTrigger></TabsList>
        <TabsContent value="activity"><ul className="divide-y rounded-xl border text-sm">{["Logged in · Chrome, Tallinn · today 13:44", "Predicted YES · 10.00 USDC · Marble Rally · today", "Followed Kovac · yesterday", "Tipped Marble Rally 5.00 USDC · Oct 28"].map((a) => <li key={a} className="px-4 py-3">{a}</li>)}</ul></TabsContent>
        <TabsContent value="predictions"><p className="text-sm text-muted-foreground">12 predictions · 60% hit rate · no flags from the abuse sweep.</p></TabsContent>
        <TabsContent value="payments"><p className="text-sm text-muted-foreground">3 deposits · 110.00 USDC · 3 tips · 20.00 USDC · no withdrawals.</p></TabsContent>
        <TabsContent value="sanctions"><EmptyState title="No sanctions" /></TabsContent>
        <TabsContent value="sessions"><Button variant="destructive-outline">Sign out all sessions</Button></TabsContent>
      </Tabs>
      <ReasonDialog open={!!act} onOpenChange={(o) => !o && setAct(null)} title={act ?? ""} body={`For ${u.name}. The user is notified by email.`} confirm={act ?? "Confirm"} danger={act === "Suspend account"} onConfirm={() => toast.success(`${act}: done`)} />
    </div>
  );
}

export function Channels() {
  const [q, setQ] = React.useState("");
  const list = streamers.filter((s) => (s.name + s.handle).toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="Channels" description={`${streamers.length} channels`}>
      <SearchInput value={q} onChange={setQ} placeholder="Search channels" />
      <Table>
        <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Followers</TableHead><TableHead>Country</TableHead><TableHead>Partner</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{list.map((s) => <TableRow key={s.handle}><TableCell><Link to={`/${s.handle}`} className="flex items-center gap-2 font-semibold hover:text-foreground"><ChannelAvatar s={s} size={28} ring={false} />{s.name}</Link></TableCell><TableCell>{categoryBySlug(s.category)?.name}</TableCell><TableCell>{s.live ? <Badge variant="live">Live</Badge> : <Badge variant="muted">Offline</Badge>}</TableCell><TableCell className="text-right font-mono">{compact(s.followers)}</TableCell><TableCell>{s.country}</TableCell><TableCell>{s.verified ? <Badge variant="no">Verified</Badge> : "—"}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Manage</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Handles() {
  return (
    <Page title="Reserved handles" description="Names nobody can claim as a channel or username." actions={<Button><Plus /> Reserve handle</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Handle</TableHead><TableHead>Reason</TableHead><TableHead>Added</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{reservedHandles.map((h) => <TableRow key={h.handle}><TableCell className="font-mono">xp.live/{h.handle}</TableCell><TableCell><Badge variant="muted">{h.reason}</Badge></TableCell><TableCell className="text-muted-foreground">{h.added}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Release</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function AdminCategories() {
  return (
    <Page title="Categories" description="Order, rename, age-gate and merge categories." actions={<Button><Plus /> New category</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Group</TableHead><TableHead className="text-right">Live</TableHead><TableHead className="text-right">Followers</TableHead><TableHead>18+</TableHead><TableHead>Featured</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{categories.map((c) => <TableRow key={c.slug}><TableCell><span className="flex items-center gap-3"><span className="h-10 w-8 overflow-hidden rounded"><BoxArt c={c} size={[144, 192]} /></span><span className="font-semibold">{c.name}</span></span></TableCell><TableCell>{c.group}</TableCell><TableCell className="text-right font-mono">{categoryStats(c.slug).live}</TableCell><TableCell className="text-right font-mono">{compact(c.followers)}</TableCell><TableCell><Switch defaultChecked={!!c.adult} aria-label={`${c.name} 18+`} /></TableCell><TableCell><Switch defaultChecked={categoryStats(c.slug).viewers > 5000} aria-label={`Feature ${c.name}`} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Edit</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

/* ── Money ──────────────────────────────────────────────────────────────── */
export function AdminPayouts() {
  const [approve, setApprove] = React.useState<string | null>(null);
  return (
    <Page title="Payouts" description="Weekly creator payouts in USDC to verified Polygon addresses. Approving authorises the transfer; once sent on-chain it can’t be undone.">
      <div className="grid gap-3 md:grid-cols-4"><Stat label="This batch" value={fmtUSDC(payoutQueue.reduce((a, p) => a + p.amount, 0))} /><Stat label="Needs approval" value={payoutQueue.filter((p) => p.status === "Needs approval").length} tone="warn" /><Stat label="On hold" value={payoutQueue.filter((p) => p.status === "On hold").length} /><Stat label="Sends" value="Mon 2 Nov" /></div>
      <Table>
        <TableHeader><TableRow><TableHead>Payout</TableHead><TableHead>Creator</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>To address</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{payoutQueue.map((p) => <TableRow key={p.id}><TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell><TableCell className="font-semibold">{p.creator}{p.hold && <span className="block text-xs font-normal text-warn">{p.hold}</span>}</TableCell><TableCell className="text-right font-mono">{fmtUSDC(p.amount)}</TableCell><TableCell className="font-mono text-xs">{p.method}</TableCell><TableCell><Badge variant={p.status === "Scheduled" ? "neon" : p.status === "On hold" ? "warning" : "default"}>{p.status}</Badge></TableCell><TableCell className="text-right">{p.status === "Needs approval" && <Button size="sm" onClick={() => setApprove(p.id)}>Approve</Button>}</TableCell></TableRow>)}</TableBody>
      </Table>
      <ReasonDialog open={!!approve} onOpenChange={(o) => !o && setApprove(null)} title={`Approve ${approve}?`} body="The payout joins Monday’s batch." confirm="Approve" onConfirm={() => toast.success("Approved")} />
    </Page>
  );
}

export function PaymentIssues() {
  return (
    <Page title="Payment issues" description="Deposits sent on the wrong network, unconfirmed deposits, failed withdrawals and RPC incidents.">
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Issue</TableHead><TableHead>User</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Age</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{paymentIssues.map((p) => <TableRow key={p.id}><TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell><TableCell className="font-semibold">{p.what}</TableCell><TableCell>{p.user}</TableCell><TableCell className="text-right font-mono">{p.amount ? fmtUSDC(p.amount) : "—"}</TableCell><TableCell><Badge variant={p.status === "Lost" ? "danger" : "warning"}>{p.status}</Badge></TableCell><TableCell className="text-muted-foreground">{p.when}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Open</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Revenue() {
  const [edit, setEdit] = React.useState<string | null>(null);
  const rates = [["Subscriptions", 10, "Recurring channel subscriptions."], ["Gift subscriptions", 5, "A subscription bought for someone else."], ["Tips", 5, "One-off USDC tips to creators."], ["Prediction fee", 4, "Taken on-chain from each settled pool: 3% platform, 1% creator."]] as const;
  return (
    <Page title="Revenue splits" description="What the platform keeps. New rates apply from the moment you save; past charges keep their rate.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{rates.map(([n, r, d]) => (
        <Card key={n}><CardHeader><CardDescription>{n}</CardDescription><CardTitle className="font-mono text-3xl">{r}%</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{d}{n !== "Prediction fee" && <> Creator keeps {100 - r}%.</>}</CardContent><CardFooter><Button size="sm" variant="secondary" onClick={() => setEdit(n)}>Change</Button></CardFooter></Card>
      ))}</div>
      <Card><CardHeader><CardTitle>Last 30 days</CardTitle></CardHeader><CardContent><Table>
        <TableHeader><TableRow><TableHead>Source</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Creators</TableHead><TableHead className="text-right">Platform</TableHead></TableRow></TableHeader>
        <TableBody>{[["Tips", 4812, 4571.4, 240.6], ["Subscriptions", 2980, 2682, 298], ["Gift subscriptions", 1476, 1402.2, 73.8]].map(([n, g, c, p]) => <TableRow key={n as string}><TableCell>{n}</TableCell><TableCell className="text-right font-mono">{fmtUSDC(g as number)}</TableCell><TableCell className="text-right font-mono">{fmtUSDC(c as number)}</TableCell><TableCell className="text-right font-mono text-neon">{fmtUSDC(p as number)}</TableCell></TableRow>)}</TableBody>
      </Table></CardContent></Card>
      <ReasonDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={`Change ${edit?.toLowerCase()} rate`} body="Creators are emailed 7 days before a higher rate takes effect." confirm="Save rate" onConfirm={() => toast.success("Rate updated")} />
    </Page>
  );
}

export function Rewards() {
  return (
    <Page title="Limits & fees" description="Prediction limits, deposit and withdrawal rules, and the testnet faucet.">
      <Card><CardHeader><CardTitle>Predictions</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
        {[["Minimum answer (USDC)", "1.00"], ["Maximum answer (USDC)", "500.00"], ["Pool fee (%)", "4"], ["Creator share of fee (%)", "1"], ["Dispute bond (USDC)", "5.00"], ["Auto-void after (minutes)", "60"]].map(([l, v]) => <div key={l} className="grid gap-2"><Label>{l}</Label><Input defaultValue={v} className="font-mono" /></div>)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Deposits &amp; withdrawals</CardTitle><CardDescription>{NETWORK.name} · USDC {short(NETWORK.usdc)}</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
        {[["Minimum deposit (USDC)", "1.00"], ["Confirmations before credit", String(NETWORK.confirmations)], ["Minimum withdrawal (USDC)", "5.00"], ["Manual review above (USDC)", "1,000.00"], ["Second approver above (USDC)", "2,500.00"], ["New address hold (hours)", "72"]].map(([l, v]) => <div key={l} className="grid gap-2"><Label>{l}</Label><Input defaultValue={v} className="font-mono" /></div>)}
      </CardContent></Card>
      {NETWORK.testnet && <Card><CardHeader><CardTitle>Testnet faucet</CardTitle><CardDescription>Only on {NETWORK.name}. Hidden on mainnet.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
        {[["Amount per claim (USDC)", "10.00"], ["Claims per day", "1"], ["Faucet wallet balance", "4,210.00"]].map(([l, v]) => <div key={l} className="grid gap-2"><Label>{l}</Label><Input defaultValue={v} className="font-mono" /></div>)}
      </CardContent></Card>}
      <div className="flex justify-end"><Button onClick={() => toast.success("Limits saved")}>Save changes</Button></div>
    </Page>
  );
}

export function Integrity() {
  return (
    <Page title="Treasury & on-chain" description={`Contract and hot-wallet balances on ${NETWORK.name}, stuck transactions, abuse flags, and stop levers for jobs that move USDC.`}>
      <NetworkChip />
      <div className="grid gap-3 md:grid-cols-3">{treasury.map((t) => <Card key={t.name}><CardHeader><CardDescription>{t.name}</CardDescription><CardTitle className="font-mono text-2xl">{fmtUSD2(t.balance)} <span className="text-sm text-muted-foreground">USDC</span></CardTitle></CardHeader><CardContent className="space-y-1 text-xs"><a href={addressUrl(t.address)} target="_blank" rel="noreferrer" className="font-mono text-label hover:text-foreground">{short(t.address, 8, 6)}</a><p className="text-muted-foreground">{t.note}</p></CardContent></Card>)}</div>
      <h2 className="font-display text-lg font-bold">Stuck transactions</h2>
      <Table>
        <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>What</TableHead><TableHead>Age</TableHead><TableHead className="text-right">Retries</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{stuckTx.map((t) => <TableRow key={t.hash}><TableCell><TxLink hash={t.hash} /></TableCell><TableCell className="font-semibold">{t.what}</TableCell><TableCell>{t.age}</TableCell><TableCell className="text-right font-mono">{t.retries}</TableCell><TableCell className="text-right"><Button size="sm" variant="secondary" onClick={() => toast("Resubmitted with a higher gas price")}>Speed up</Button></TableCell></TableRow>)}</TableBody>
      </Table>
      <h2 className="font-display text-lg font-bold">Stop levers</h2>
      <div className="grid gap-3 md:grid-cols-2">{stopLevers.map((s) => <Card key={s.name}><CardContent className="flex items-start gap-4 pt-5"><div className="flex-1"><p className="font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.body}</p></div><Badge variant="neon">Running</Badge><Button size="sm" variant="destructive-outline">Halt</Button></CardContent></Card>)}</div>
      <h2 className="font-display text-lg font-bold">Flagged accounts</h2>
      <Table>
        <TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Rule</TableHead><TableHead className="text-right">USDC</TableHead><TableHead>Mode</TableHead><TableHead>When</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{farmFlags.map((f) => <TableRow key={f.user}><TableCell className="font-mono">{f.user}</TableCell><TableCell>{f.rule}</TableCell><TableCell className="text-right font-mono">{fmtUSD2(f.xp)}</TableCell><TableCell><Badge variant={f.mode === "Enforced" ? "danger" : "muted"}>{f.mode}</Badge></TableCell><TableCell className="text-muted-foreground">{f.when}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Review</Button></TableCell></TableRow>)}</TableBody>
      </Table>
      <p className="text-sm text-muted-foreground">Shadow mode records what a rule would have done without moving any USDC.</p>
    </Page>
  );
}

/* ── Operations ─────────────────────────────────────────────────────────── */
export function SupportQueue() {
  return (
    <Page title="Support queue" description="Tickets from viewers and creators.">
      <Table>
        <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Topic</TableHead><TableHead>Priority</TableHead><TableHead>Age</TableHead><TableHead>Assignee</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{supportQueue.map((t) => <TableRow key={t.id}><TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell><TableCell>{t.from}</TableCell><TableCell className="font-semibold">{t.subject}</TableCell><TableCell>{t.topic}</TableCell><TableCell><Badge variant={t.priority === "High" ? "danger" : "muted"}>{t.priority}</Badge></TableCell><TableCell className="text-muted-foreground">{t.age}</TableCell><TableCell>{t.assignee}</TableCell><TableCell className="text-right"><Button size="sm" variant={t.assignee === "Unassigned" ? "default" : "ghost"} onClick={() => toast("Assigned to you")}>{t.assignee === "Unassigned" ? "Claim" : "Open"}</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Audit() {
  const [q, setQ] = React.useState("");
  const list = auditLog.filter((a) => (a.who + a.action + a.target + a.reason).toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="Audit log" description="Every admin and system action, with who and why." actions={<Button variant="secondary"><Download /> Export</Button>}>
      <div className="flex items-center gap-2"><SearchInput value={q} onChange={setQ} placeholder="Filter by person, action or target" /><Button variant="ghost" size="icon" aria-label="More filters"><Filter /></Button></div>
      <Table>
        <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Who</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
        <TableBody>{list.map((a, i) => <TableRow key={i}><TableCell className="whitespace-nowrap text-muted-foreground">{a.when}</TableCell><TableCell>{a.who}</TableCell><TableCell className="font-semibold">{a.action}</TableCell><TableCell>{a.target}</TableCell><TableCell className="text-label">{a.reason || "—"}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Health() {
  const live = streamers.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  return (
    <Page title="Stream health" description="Ingest and playback quality for every live channel.">
      <div className="grid gap-3 md:grid-cols-4"><Stat label="Live channels" value={live.length} /><Stat label="Healthy" value={live.length - 1} tone="yes" /><Stat label="Degraded" value="1" tone="warn" /><Stat label="Avg startup time" value="1.4 s" /></div>
      <Table>
        <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>Bitrate</TableHead><TableHead>Resolution</TableHead><TableHead>Dropped</TableHead><TableHead>Rebuffer</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>{live.map((s, i) => <TableRow key={s.handle}><TableCell className="font-semibold">{s.name}</TableCell><TableCell className="font-mono">{i === 5 ? "2.1" : (6 - (i % 3) * 0.5).toFixed(1)} Mbps</TableCell><TableCell className="font-mono">{i % 4 === 3 ? "720p60" : "1080p60"}</TableCell><TableCell className="font-mono">{i === 5 ? "4.8%" : "0.0" + (i % 5) + "%"}</TableCell><TableCell className="font-mono">{i === 5 ? "3.1%" : "0.2%"}</TableCell><TableCell>{i === 5 ? <Badge variant="warning">Degraded</Badge> : <Badge variant="muted">Healthy</Badge>}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export type { Market };
