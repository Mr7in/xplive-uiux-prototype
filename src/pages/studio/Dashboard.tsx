import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Ban, Clock3, Pencil, Shield, Trash2, Wifi } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { streamerByHandle } from "@/data/streamers";
import { categoryBySlug, categories } from "@/data/categories";
import { studioActivity, studioRedemptions } from "@/data/studio";
import { chatLines, chatUsers } from "@/data/viewer";
import { AskQuestion, NeedsResult, RunningQuestion } from "./Predictions";
import { CompanionPromo } from "./Companion";
import { LivePlayer } from "@/components/LivePlayer";
import { LiveBadge, Stat } from "@/components/xp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, fmtUSDC } from "@/lib/utils";

function ModChat() {
  const [msgs, setMsgs] = React.useState(() => [
    ...Array.from({ length: 8 }).map((_, i) => ({ id: i, user: chatUsers[i % chatUsers.length], text: chatLines[(i * 4) % chatLines.length], held: false })),
    { id: 99, user: { name: "spam_bot_77", color: "#ff6b81" }, text: "free coins at [link removed]", held: true },
  ]);
  return (
    <Card className="flex h-[440px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2.5"><p className="font-display text-sm font-semibold">Chat</p><span className="flex gap-1.5"><Badge variant="muted">Slow 3s</Badge><Badge variant="neon">AutoMod on</Badge></span></div>
      <ol className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {msgs.map((m) => (
          <li key={m.id} className={m.held ? "rounded-lg border border-coral/40 bg-coral/5 p-2" : "group flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-secondary"}>
            {m.held ? (
              <>
                <p className="text-xs font-semibold text-coral-soft">Held by AutoMod · links</p>
                <p className="chat-safe"><b style={{ color: `color-mix(in oklab, ${m.user.color} 60%, hsl(var(--foreground)))` }}>{m.user.name}</b>: {m.text}</p>
                <div className="mt-2 flex gap-2"><Button size="sm" variant="secondary" onClick={() => setMsgs((x) => x.map((y) => (y.id === m.id ? { ...y, held: false } : y)))}>Allow</Button><Button size="sm" variant="destructive-outline" onClick={() => { setMsgs((x) => x.filter((y) => y.id !== m.id)); toast("spam_bot_77 banned"); }}><Ban /> Ban</Button></div>
              </>
            ) : (
              <>
                <span className="chat-safe flex-1"><b style={{ color: `color-mix(in oklab, ${m.user.color} 60%, hsl(var(--foreground)))` }}>{m.user.name}</b><span className="text-label">: {m.text}</span></span>
                <span className="flex gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button className="grid h-6 w-6 place-items-center rounded hover:bg-background" aria-label={`Delete message from ${m.user.name}`} onClick={() => setMsgs((x) => x.filter((y) => y.id !== m.id))}><Trash2 className="h-3.5 w-3.5" /></button>
                  <button className="grid h-6 w-6 place-items-center rounded hover:bg-background" aria-label={`Time out ${m.user.name}`} onClick={() => toast(`${m.user.name} timed out for 10 minutes`)}><Clock3 className="h-3.5 w-3.5" /></button>
                  <button className="grid h-6 w-6 place-items-center rounded hover:bg-background" aria-label={`Ban ${m.user.name}`} onClick={() => toast(`${m.user.name} banned`)}><Shield className="h-3.5 w-3.5" /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
      <form className="flex gap-2 border-t p-3" onSubmit={(e) => e.preventDefault()}><Input placeholder="Message as creator" aria-label="Message as creator" /><Button type="submit">Chat</Button></form>
    </Card>
  );
}

export default function StudioDashboard() {
  usePageMeta("Live dashboard · Studio");
  const { user, markets } = useStore();
  const s = streamerByHandle(user!.channel!)!;
  const mine = markets.filter((m) => m.handle === s.handle);
  const open = mine.find((m) => m.status === "open");
  const awaiting = mine.filter((m) => m.status === "awaiting");
  const [edit, setEdit] = React.useState(false);
  const [title, setTitle] = React.useState(s.title);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border bg-card px-5 py-4">
        {s.live ? <LiveBadge className="text-xs" /> : <Badge variant="muted">Offline</Badge>}
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className="text-xs text-muted-foreground">Session</dt><dd className="font-mono font-bold">1:12:44</dd></div>
          <div><dt className="text-xs text-muted-foreground">Watching</dt><dd className="font-mono font-bold">{fmt(s.viewers)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">New followers</dt><dd className="font-mono font-bold text-neon">+86</dd></div>
          <div><dt className="text-xs text-muted-foreground">Tips</dt><dd className="font-mono font-bold">{fmtUSDC(46.5)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Stream health</dt><dd className="flex items-center gap-1.5 font-semibold"><Wifi className="h-4 w-4 text-cyan" /> Excellent <span className="font-mono text-xs font-normal text-muted-foreground">6.0 Mbps · 60 fps · 1080p</span></dd></div>
        </dl>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil /> Edit stream info</Button>
          <Button variant="destructive-outline" size="sm" onClick={() => toast("Stream ends when you stop broadcasting in your encoder")}>End stream</Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border">
            <LivePlayer s={s} className="rounded-none"><span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">Preview · viewers see this about 4 s later</span></LivePlayer>
            <div className="flex flex-wrap items-center gap-3 border-t bg-card px-4 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-semibold">{title}</span>
              <Badge variant="muted">{categoryBySlug(s.category)?.name}</Badge>
            </div>
          </div>
          <AskQuestion compact />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Activity</CardTitle><Link to="/studio/activity" className="text-xs text-label hover:text-foreground">See all</Link></CardHeader>
              <CardContent><ul className="space-y-2.5 text-sm">{studioActivity.slice(0, 5).map((a) => <li key={a.what} className="flex justify-between gap-3"><span className="text-label">{a.what}</span><span className="shrink-0 text-xs text-muted-foreground">{a.when}</span></li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Point redemptions</CardTitle><Link to="/studio/points" className="text-xs text-label hover:text-foreground">Manage</Link></CardHeader>
              <CardContent className="space-y-3">{studioRedemptions.map((r) => (
                <div key={r.user + r.when} className="rounded-lg border p-3 text-sm">
                  <p><b>{r.user}</b> · {r.reward}</p><p className="text-label">“{r.input}”</p>
                  <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => toast("Marked as done")}>Done</Button><Button size="sm" variant="ghost" onClick={() => toast("Refunded points")}>Reject</Button></div>
                </div>
              ))}</CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-5">
          <CompanionPromo />
          {awaiting.map((m) => <NeedsResult key={m.id} m={m} />)}
          {open && <RunningQuestion m={open} />}
          <ModChat />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Next payout" value={fmtUSDC(312.4)} sub="Mon 2 Nov" />
            <Stat label="Sponsorship offer" value="1 new" sub={<Link to="/studio/sponsorships" className="underline">Review</Link>} />
          </div>
        </div>
      </div>

      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Stream info</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label htmlFor="t">Title</Label><Input id="t" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 140))} /></div>
            <div className="grid gap-2"><Label>Category</Label><Select defaultValue={s.category}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label htmlFor="tags">Tags</Label><Input id="tags" defaultValue={s.tags.join(", ")} /></div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setEdit(false)}>Cancel</Button><Button onClick={() => { setEdit(false); toast.success("Stream info updated"); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
