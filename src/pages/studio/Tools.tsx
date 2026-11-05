import * as React from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Plus, RefreshCw, Rocket, Search, Upload, Zap, Download, Play } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { streamerByHandle, streamers } from "@/data/streamers";
import {
  analyticsDays, studioActivity, studioAlerts, studioBadges, studioBans, studioClips, studioCommands, studioConvos, studioEmotes, studioFollowers, studioHypeTrains,
  studioMods, studioPastStreams, studioPayouts, studioRaids, studioRewards, studioSponsorships, studioSubs, studioThread, studioTriggers,
} from "@/data/studio";
import { PageHeader, Stat, StreamThumb, EmptyState } from "@/components/xp";
import { Inbox } from "@/components/Inbox";
import { SupportCenter } from "@/components/SupportCenter";
import { ToggleRow } from "@/pages/Settings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/Slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, fmt, fmtUSDC } from "@/lib/utils";

const Page = ({ title, description, actions, children, wide }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; wide?: boolean }) => {
  usePageMeta(`${title} · Studio`);
  return <div className={cn("mx-auto space-y-6", wide ? "max-w-[1400px]" : "max-w-5xl")}><PageHeader title={title} description={description} actions={actions} />{children}</div>;
};
const saved = (what = "Saved") => () => toast.success(what);

/* ── Stream ─────────────────────────────────────────────────────────────── */
export function StreamSetup() {
  const [show, setShow] = React.useState(false);
  const key = "live_8842193_Hk2pQ9vXrT4mWz7bN1";
  const copy = (v: string) => { try { navigator.clipboard?.writeText(v); } catch { /* blocked */ } toast("Copied"); };
  return (
    <Page title="Stream setup" description="Connect OBS, Streamlabs or any RTMP encoder.">
      <Card>
        <CardHeader><CardTitle>Ingest</CardTitle><CardDescription>Paste these into your encoder’s stream settings. Treat the key like a password.</CardDescription></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2"><Label>Server</Label><div className="flex gap-2"><Input readOnly value="rtmps://ingest-eu.balz.tv:443/live" className="font-mono" /><Button variant="secondary" onClick={() => copy("rtmps://ingest-eu.balz.tv:443/live")}><Copy /> Copy</Button></div></div>
          <div className="grid gap-2"><Label>Stream key</Label><div className="flex gap-2"><Input readOnly type={show ? "text" : "password"} value={key} className="font-mono" /><Button variant="ghost" size="icon" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide key" : "Show key"}>{show ? <EyeOff /> : <Eye />}</Button><Button variant="secondary" onClick={() => copy(key)}><Copy /> Copy</Button></div></div>
        </CardContent>
        <CardFooter className="justify-between"><p className="text-sm text-muted-foreground">Leaked your key? Reset it and update your encoder.</p><Button variant="destructive-outline" onClick={saved("New stream key created")}><RefreshCw /> Reset key</Button></CardFooter>
      </Card>
      <div className="grid gap-3 sm:grid-cols-4"><Stat label="Status" value="Receiving" tone="yes" /><Stat label="Bitrate" value="6.0 Mbps" /><Stat label="Resolution" value="1080p60" /><Stat label="Dropped frames" value="0.02%" /></div>
      <Card>
        <CardHeader><CardTitle>Stream options</CardTitle></CardHeader>
        <CardContent>
          <ToggleRow title="Low-latency mode" body="About 2 s delay. Best for predictions and chat." defaultChecked />
          <ToggleRow title="Save past streams" body="Kept for 14 days, then deleted unless you highlight them." defaultChecked />
          <ToggleRow title="Mature content" body="Required for casino categories. Viewers confirm they’re 18+ before watching." defaultChecked />
          <ToggleRow title="Disconnect protection" body="Shows your offline poster for up to 90 s if your connection drops." defaultChecked />
        </CardContent>
      </Card>
    </Page>
  );
}

/* ── Content ────────────────────────────────────────────────────────────── */
export function Content() {
  const { user } = useStore();
  const s = streamerByHandle(user!.channel!)!;
  return (
    <Page title="Past streams" description="Edit titles, visibility and chapters. Past streams are kept for 14 days." wide>
      <Table>
        <TableHeader><TableRow><TableHead>Stream</TableHead><TableHead>Date</TableHead><TableHead>Length</TableHead><TableHead className="text-right">Peak</TableHead><TableHead className="text-right">Avg viewers</TableHead><TableHead className="text-right">New followers</TableHead><TableHead>Visibility</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {studioPastStreams.map((p, i) => (
            <TableRow key={p.title}>
              <TableCell><span className="flex items-center gap-3"><StreamThumb s={{ ...s, handle: s.handle + i }} frame={((i % 3) + 1) as 1 | 2 | 3} className="w-28 shrink-0 rounded-md" /><span className="font-semibold">{p.title}</span></span></TableCell>
              <TableCell className="text-muted-foreground">{p.date}</TableCell><TableCell className="font-mono">{p.duration}</TableCell>
              <TableCell className="text-right font-mono">{fmt(p.peak)}</TableCell><TableCell className="text-right font-mono">{fmt(p.avg)}</TableCell><TableCell className="text-right font-mono">+{p.followers}</TableCell>
              <TableCell><Badge variant="muted">{p.visibility}</Badge></TableCell>
              <TableCell className="text-right"><Button size="sm" variant="ghost">Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Page>
  );
}

export function Clips() {
  const { user } = useStore();
  const s = streamerByHandle(user!.channel!)!;
  return (
    <Page title="Clips" description="Moments your viewers clipped. Feature the best on your channel." wide>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studioClips.map((c, i) => (
          <Card key={c.title} className="overflow-hidden">
            <StreamThumb s={{ ...s, handle: s.handle + "clip" + i }} frame={(((i + 1) % 3) + 1) as 1 | 2 | 3} className="rounded-none"><span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-black/60"><Play className="h-5 w-5" fill="currentColor" /></span></span><span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 font-mono text-xs text-white">{c.length}</span></StreamThumb>
            <CardContent className="space-y-1 pt-4"><p className="font-semibold">{c.title}</p><p className="text-sm text-muted-foreground">Clipped by {c.by} · {fmt(c.views)} views · {c.when}</p></CardContent>
            <CardFooter className="gap-2"><Button size="sm" variant="secondary" onClick={saved("Featured on your channel")}>Feature</Button><Button size="sm" variant="ghost"><Download /> Download</Button><Button size="sm" variant="ghost" className="ml-auto text-coral-soft">Delete</Button></CardFooter>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/* ── Insights ───────────────────────────────────────────────────────────── */
function Bars({ data, k, label, color = "bg-lime" }: { data: typeof analyticsDays; k: "viewers" | "followers" | "tips"; label: string; color?: string }) {
  const max = Math.max(...data.map((d) => d[k]), 1);
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-2" role="img" aria-label={`${label}: ${data.map((d) => `${d.d} ${d[k]}`).join(", ")}`}>
          {data.map((d) => (
            <div key={d.d} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="font-mono text-[11px] text-label">{d[k]}</span>
              <div className={cn("w-full rounded-t-md", d[k] ? color : "bg-secondary")} style={{ height: `${Math.max(3, (d[k] / max) * 120)}px` }} />
              <span className="text-[11px] text-muted-foreground">{d.d.split(" ")[1]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Analytics() {
  return (
    <Page title="Analytics" description="Last 7 days." wide>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Avg viewers" value="583" sub="+12% vs last week" /><Stat label="Peak viewers" value="1,481" /><Stat label="Hours streamed" value="17.6" />
        <Stat label="New followers" value="+331" tone="neon" /><Stat label="Prediction participation" value="27%" sub="of viewers predicted at least once" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Bars data={analyticsDays} k="viewers" label="Average viewers" />
        <Bars data={analyticsDays} k="followers" label="New followers" color="bg-violet" />
        <Bars data={analyticsDays} k="tips" label="Tips (USDC)" color="bg-cyan" />
      </div>
      <Card>
        <CardHeader><CardTitle>Where viewers came from</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[["Home page", 38], ["Followed channels", 27], ["Category: Slots", 18], ["Raids & shoutouts", 9], ["External links", 8]].map(([l, v]) => (
            <div key={l as string} className="grid grid-cols-[180px_minmax(0,1fr)_48px] items-center gap-3 text-sm"><span className="text-label">{l}</span><div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-lime" style={{ width: `${v}%` }} /></div><span className="text-right font-mono">{v}%</span></div>
          ))}
        </CardContent>
      </Card>
    </Page>
  );
}

export function ActivityFeed() {
  return (
    <Page title="Activity feed" description="Follows, tips, subs, raids, mod actions and predictions, newest first.">
      <ul className="divide-y rounded-xl border">
        {[...studioActivity, ...studioActivity.map((a) => ({ ...a, when: "Yesterday" }))].map((a, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm"><Badge variant="muted" className="w-20 justify-center capitalize">{a.kind}</Badge><span className="flex-1">{a.what}</span><span className="text-xs text-muted-foreground">{a.when}</span></li>
        ))}
      </ul>
    </Page>
  );
}

/* ── Engagement ─────────────────────────────────────────────────────────── */
export function Alerts() {
  return (
    <Page title="Alerts" description="On-screen alerts for your stream. Add the browser source URL to your encoder once.">
      <Card><CardContent className="flex flex-wrap items-center gap-2 pt-5"><Input readOnly value="https://balz.tv/overlay/alerts/8842193?t=••••••" className="flex-1 font-mono" /><Button variant="secondary" onClick={saved("Copied")}><Copy /> Copy URL</Button><Button variant="outline" onClick={saved("Test alert sent")}>Send test alert</Button></CardContent></Card>
      <Table>
        <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Style</TableHead><TableHead>Sound</TableHead><TableHead>On</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioAlerts.map((a) => <TableRow key={a.event}><TableCell className="font-semibold">{a.event}</TableCell><TableCell className="text-label">{a.style}</TableCell><TableCell className="text-label">{a.sound}</TableCell><TableCell><Switch defaultChecked={a.on} aria-label={`${a.event} alerts`} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Customise</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Points() {
  return (
    <Page title="Channel points" description="Viewers earn points for watching. Let them spend points on rewards you choose." actions={<Button><Plus /> New reward</Button>}>
      <div className="grid gap-3 sm:grid-cols-3"><Stat label="Points earned per 5 min watched" value="10" /><Stat label="Bonus for following" value="300" /><Stat label="Redemptions this week" value="243" /></div>
      <Table>
        <TableHeader><TableRow><TableHead>Reward</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Redeemed</TableHead><TableHead>Enabled</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioRewards.map((r) => <TableRow key={r.name}><TableCell className="font-semibold">{r.name}</TableCell><TableCell className="text-right font-mono">{fmt(r.cost)}</TableCell><TableCell className="text-right font-mono">{r.redemptions}</TableCell><TableCell><Switch defaultChecked={r.on} aria-label={`Enable ${r.name}`} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Edit</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Raids() {
  const live = streamers.filter((s) => s.live).slice(0, 6);
  return (
    <Page title="Raids" description="Send your viewers to another live channel when you wrap up.">
      <Card>
        <CardHeader><CardTitle>Start a raid</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search live channels" className="pl-9" aria-label="Search live channels" /></div>
          <div className="grid gap-2 sm:grid-cols-3">{live.map((s) => <button key={s.handle} className="rounded-xl border p-3 text-left text-sm hover:border-input"><span className="block font-semibold">{s.name}</span><span className="text-muted-foreground">{fmt(s.viewers)} watching</span></button>)}</div>
          <div className="flex items-end gap-3"><div className="grid gap-2"><Label>Countdown</Label><Slider defaultValue={30} min={10} max={90} unit="s" /></div><Button className="ml-auto" onClick={saved("Raid starting")}><Rocket /> Start raid</Button></div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow><TableHead>Direction</TableHead><TableHead>Channel</TableHead><TableHead className="text-right">Viewers</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
        <TableBody>{studioRaids.map((r) => <TableRow key={r.channel + r.when}><TableCell><Badge variant={r.dir === "In" ? "neon" : "muted"}>{r.dir === "In" ? "Raided you" : "You raided"}</Badge></TableCell><TableCell className="font-semibold">{streamerByHandle(r.channel)?.name}</TableCell><TableCell className="text-right font-mono">{fmt(r.viewers)}</TableCell><TableCell className="text-muted-foreground">{r.when}</TableCell></TableRow>)}</TableBody>
      </Table>
      <Card><CardContent className="pt-5"><ToggleRow title="Accept raids from anyone" body="Off: only channels you follow can raid you." defaultChecked /></CardContent></Card>
    </Page>
  );
}

export function HypeTrains() {
  return (
    <Page title="Hype trains" description="When viewers tip and subscribe in quick succession, a hype train starts and levels up.">
      <Card><CardContent className="pt-5">
        <ToggleRow title="Enable hype trains" defaultChecked />
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="grid gap-2"><Label>Events to start a train</Label><Select defaultValue="3"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3 events in 5 minutes</SelectItem><SelectItem value="5">5 events in 5 minutes</SelectItem></SelectContent></Select></div>
          <div className="grid gap-2"><Label>Difficulty</Label><Select defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
        </div>
      </CardContent></Card>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Level reached</TableHead><TableHead>Duration</TableHead><TableHead className="text-right">Contributors</TableHead><TableHead>Top contributor</TableHead></TableRow></TableHeader>
        <TableBody>{studioHypeTrains.map((h) => <TableRow key={h.when}><TableCell>{h.when}</TableCell><TableCell><span className="flex items-center gap-1 font-semibold"><Zap className="h-4 w-4 text-neon" /> Level {h.level}</span></TableCell><TableCell className="font-mono">{h.duration}</TableCell><TableCell className="text-right font-mono">{h.contributors}</TableCell><TableCell>{h.top}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Subscriptions() {
  return (
    <Page title="Subscriptions" description="Monthly supporters paying in USDC. You keep 90%.">
      <div className="grid gap-3 sm:grid-cols-4"><Stat label="Active subscribers" value="41" /><Stat label="Gifted this month" value="9" /><Stat label="Monthly revenue" value={fmtUSDC(184.5)} tone="neon" /><Stat label="Renewal rate" value="78%" /></div>
      <Card><CardHeader><CardTitle>Tiers</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{[["Tier 1", 4.99, "Sub badge, 3 emotes"], ["Tier 2", 9.99, "+ ad-free, 6 emotes"], ["Tier 3", 24.99, "+ monthly shoutout"]].map(([t, p, b]) => <div key={t as string} className="rounded-xl border p-4"><p className="font-display font-bold">{t}</p><p className="font-mono text-xl">{fmtUSDC(p as number)}</p><p className="text-sm text-muted-foreground">{b}</p></div>)}</CardContent></Card>
      <Table>
        <TableHeader><TableRow><TableHead>Subscriber</TableHead><TableHead>Tier</TableHead><TableHead className="text-right">Months</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
        <TableBody>{studioSubs.map((s) => <TableRow key={s.name}><TableCell className="font-semibold">{s.name}</TableCell><TableCell>{s.tier}</TableCell><TableCell className="text-right font-mono">{s.months}</TableCell><TableCell>{s.gifted ? <Badge variant="neon">Gifted</Badge> : <Badge variant="muted">Paid</Badge>}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

/* ── Community ──────────────────────────────────────────────────────────── */
export function Followers() {
  const [q, setQ] = React.useState("");
  const list = studioFollowers.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="Followers" description={`${fmt(96_400)} followers in total.`}>
      <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search followers" className="pl-9" aria-label="Search followers" /></div>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Following since</TableHead><TableHead>Subscriber</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{list.map((f) => <TableRow key={f.name}><TableCell className="font-semibold">{f.name}</TableCell><TableCell className="text-muted-foreground">{f.since}</TableCell><TableCell>{f.subs ? <Badge variant="neon">Subscriber</Badge> : "—"}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Message</Button><Button size="sm" variant="ghost" className="text-coral-soft">Remove</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Mods() {
  return (
    <Page title="Moderators" description="People who can delete messages, time out and ban in your chat." actions={<Button><Plus /> Add moderator</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Added</TableHead><TableHead className="text-right">Actions (30 days)</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioMods.map((m) => <TableRow key={m.name}><TableCell className="font-semibold">{m.name}</TableCell><TableCell><Badge variant={m.role === "VIP" ? "default" : "neon"}>{m.role}</Badge></TableCell><TableCell className="text-muted-foreground">{m.added}</TableCell><TableCell className="text-right font-mono">{m.actions}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" className="text-coral-soft">Remove</Button></TableCell></TableRow>)}</TableBody>
      </Table>
      <Card><CardContent className="pt-5"><ToggleRow title="Moderators can void predictions" body="Off: only you can void or propose results." /><ToggleRow title="Moderators can start raids" defaultChecked /></CardContent></Card>
    </Page>
  );
}

export function Bans() {
  return (
    <Page title="Bans & timeouts" description="Banned users can’t chat, predict on your questions or whisper you." actions={<Button variant="secondary"><Plus /> Ban a user</Button>}>
      <Tabs defaultValue="bans">
        <TabsList><TabsTrigger value="bans">Bans <span className="font-mono text-xs text-muted-foreground">{studioBans.length}</span></TabsTrigger><TabsTrigger value="appeals">Unban requests <span className="font-mono text-xs text-muted-foreground">1</span></TabsTrigger></TabsList>
        <TabsContent value="bans">
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Reason</TableHead><TableHead>By</TableHead><TableHead>Length</TableHead><TableHead>When</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{studioBans.map((b) => <TableRow key={b.name}><TableCell className="font-semibold">{b.name}</TableCell><TableCell className="text-label">{b.reason}</TableCell><TableCell>{b.by}</TableCell><TableCell><Badge variant={b.type === "Permanent" ? "danger" : "warning"}>{b.type}</Badge></TableCell><TableCell className="text-muted-foreground">{b.when}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={saved(`${b.name} unbanned`)}>Unban</Button></TableCell></TableRow>)}</TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="appeals">
          <Card><CardContent className="space-y-3 pt-5"><p><b>rage_kid</b> · banned 7 days for harassment</p><p className="text-label">“Sorry, I got heated after losing the bonus prediction. Won’t happen again.”</p><div className="flex gap-2"><Button onClick={saved("Unbanned")}>Accept</Button><Button variant="secondary" onClick={saved("Request denied")}>Deny</Button></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </Page>
  );
}

export function AutoMod() {
  const [level, setLevel] = React.useState(2);
  const levels = ["Off", "Light", "Balanced", "Strict", "Maximum"];
  return (
    <Page title="AutoMod" description="Holds risky messages for review before they appear in chat.">
      <Card>
        <CardHeader><CardTitle>Filter level: {levels[level]}</CardTitle><CardDescription>Applies to discrimination, harassment, sexual content and profanity.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Filter level">{levels.map((l, i) => <button key={l} role="radio" aria-checked={level === i} onClick={() => setLevel(i)} className={cn("h-11 rounded-lg border text-sm", level === i ? "border-foreground bg-foreground font-semibold text-background" : "hover:border-input")}>{l}</button>)}</div>
          <ToggleRow title="Hold messages with links" defaultChecked />
          <ToggleRow title="Block Zalgo and text art" body="Strips stacked accents and large character art that break chat layout." defaultChecked />
          <ToggleRow title="Block messages about a prediction’s winners or losers by name" body="Reduces harassment after results." defaultChecked />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Blocked terms</CardTitle><CardDescription>Messages containing these are held.</CardDescription></CardHeader>
        <CardContent className="space-y-3"><div className="flex gap-2"><Input placeholder="Add a word or phrase" aria-label="Blocked term" /><Button variant="secondary"><Plus /> Add</Button></div><div className="flex flex-wrap gap-2">{["free coins", "rigged", "dm me for codes", "promo code"].map((t) => <Badge key={t} variant="muted" className="text-sm">{t}</Badge>)}</div></CardContent>
      </Card>
    </Page>
  );
}

export function Commands() {
  return (
    <Page title="Chat commands" description="Viewers type a command; your bot replies." actions={<Button><Plus /> New command</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Command</TableHead><TableHead>Reply</TableHead><TableHead>Who can use</TableHead><TableHead className="text-right">Uses</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioCommands.map((c) => <TableRow key={c.cmd}><TableCell className="font-mono font-bold text-neon">{c.cmd}</TableCell><TableCell className="max-w-md text-label">{c.reply}</TableCell><TableCell>{c.level}</TableCell><TableCell className="text-right font-mono">{c.uses}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Edit</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Triggers() {
  return (
    <Page title="Chat triggers" description="Automatic messages when something happens on your channel." actions={<Button><Plus /> New trigger</Button>}>
      <div className="space-y-3">{studioTriggers.map((t) => <Card key={t.when}><CardContent className="flex items-center gap-4 pt-5"><div className="flex-1"><p className="text-sm text-muted-foreground">When</p><p className="font-semibold">{t.when}</p></div><div className="flex-1"><p className="text-sm text-muted-foreground">Then</p><p className="font-semibold">{t.then}</p></div><Switch defaultChecked={t.on} aria-label={`Enable trigger: ${t.when}`} /></CardContent></Card>)}</div>
    </Page>
  );
}

export function Emotes() {
  return (
    <Page title="Emotes" description="Custom emotes for your chat. New uploads are reviewed within 48 hours." actions={<Button><Upload /> Upload emote</Button>}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {studioEmotes.map((e, i) => (
          <Card key={e.code} className="text-center"><CardContent className="space-y-2 pt-5"><div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-surface-2 font-display text-2xl font-black" style={{ color: ["#c8ff00", "#a78bfa", "#34edc5", "#ff6b81"][i % 4] }}>{e.code.slice(3, 5)}</div><p className="font-mono text-xs">{e.code}</p><p className="text-xs text-muted-foreground">{e.tier}</p><Badge variant={e.status === "Live" ? "neon" : e.status === "Rejected" ? "danger" : "warning"}>{e.status}</Badge></CardContent></Card>
        ))}
      </div>
    </Page>
  );
}

export function Badges() {
  return (
    <Page title="Badges" description="Badges show next to names in your chat." actions={<Button><Plus /> New badge</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Badge</TableHead><TableHead>How it’s earned</TableHead><TableHead className="text-right">Holders</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioBadges.map((b) => <TableRow key={b.name}><TableCell className="font-semibold">{b.name}</TableCell><TableCell className="text-label">{b.rule}</TableCell><TableCell className="text-right font-mono">{b.holders}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost">Edit</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

/* ── Earnings ───────────────────────────────────────────────────────────── */
export function Payouts() {
  return (
    <Page title="Earnings & payouts" description="Tips, subscriptions, sponsorships and prediction creator fees. Paid weekly in USDC to your Polygon address, every Monday, once you pass 50 USDC.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Available for next payout" value={fmtUSDC(312.4)} tone="neon" sub="Mon 2 Nov" /><Stat label="This month" value={fmtUSDC(1_124.2)} /><Stat label="Tips (you keep 95%)" value={fmtUSDC(486)} /><Stat label="Prediction creator fees" value={fmtUSDC(107)} sub="1% of every settled pool" /></div>
      <Card>
        <CardHeader className="flex-row items-start justify-between"><div><CardTitle>Payout method</CardTitle><CardDescription>Polygon address 0x4417…02be · verified</CardDescription></div><Button variant="secondary" size="sm">Change</Button></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Changing your payout address requires two-factor authentication and a signature from the new address, and holds payouts for 72 hours to protect you.</CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow><TableHead>Payout</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{studioPayouts.map((p) => <TableRow key={p.id}><TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell><TableCell>{p.period}</TableCell><TableCell className="text-right font-mono">{fmtUSDC(p.amount)}</TableCell><TableCell><Badge variant={p.status === "Paid" ? "muted" : "neon"}>{p.status}</Badge></TableCell><TableCell className="text-muted-foreground">{p.date}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost"><Download /> Statement</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Page>
  );
}

export function Sponsorships() {
  return (
    <Page title="Sponsorships" description="Campaign offers from brands and operators. Accept an offer to unlock its assets and tracked links.">
      <div className="space-y-3">
        {studioSponsorships.map((s) => (
          <Card key={s.campaign} className={s.status === "Offer" ? "" : ""}>
            <CardContent className="flex flex-wrap items-center gap-4 pt-5">
              <div className="min-w-0 flex-1"><p className="text-sm text-muted-foreground">{s.brand}</p><p className="font-display text-lg font-bold">{s.campaign}</p><p className="text-sm text-label">{s.deliverables}</p></div>
              <div className="text-right"><p className="font-mono text-xl font-bold">{fmtUSDC(s.fee)}</p><p className="text-xs text-muted-foreground">{s.ends}</p></div>
              <div className="flex w-full gap-2 sm:w-auto">
                {s.status === "Offer" ? <><Button onClick={saved("Offer accepted")}>Accept</Button><Button variant="secondary">View brief</Button><Button variant="ghost">Decline</Button></> : <Badge variant={s.status === "Active" ? "neon" : "muted"}>{s.status}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Sponsored streams show a “Sponsored” label to viewers. Casino sponsors are only shown to viewers 18+ in permitted countries.</p>
    </Page>
  );
}

/* ── Channel ────────────────────────────────────────────────────────────── */
export function ChannelSettings() {
  const { user } = useStore();
  const s = streamerByHandle(user!.channel!)!;
  return (
    <Page title="Channel settings">
      <Tabs defaultValue="profile">
        <TabsList>{["Profile", "Branding", "About panels", "Schedule", "Socials", "Chat"].map((t) => <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>)}</TabsList>
        <TabsContent value="profile"><Card><CardContent className="grid gap-4 pt-5">
          <div className="grid gap-2"><Label>Channel URL</Label><div className="flex items-center rounded-lg border border-input"><span className="pl-3 text-sm text-muted-foreground">balz.tv/</span><Input defaultValue={s.handle} className="border-0 pl-1 focus-visible:ring-0" /></div><p className="text-xs text-muted-foreground">Old links redirect after a rename. You can rename once every 60 days.</p></div>
          <div className="grid gap-2"><Label>Display name</Label><Input defaultValue={s.name} /></div>
          <div className="grid gap-2"><Label>Bio</Label><Textarea defaultValue={s.bio} maxLength={500} /></div>
          <div className="grid gap-2 sm:w-1/2"><Label>Stream language</Label><Input defaultValue={s.language} /></div>
        </CardContent><CardFooter className="justify-end"><Button onClick={saved()}>Save</Button></CardFooter></Card></TabsContent>
        <TabsContent value="branding"><div className="grid gap-4 md:grid-cols-2">
          {[["Profile picture", "Square, at least 256 × 256."], ["Banner", "1200 × 480, JPG or PNG up to 10 MB."], ["Offline poster", "1920 × 1080. Shown on the player when you’re offline."], ["Accent colour", "Used for your name in chat and your channel buttons."]].map(([t, d]) => <Card key={t}><CardHeader><CardTitle>{t}</CardTitle><CardDescription>{d}</CardDescription></CardHeader><CardFooter><Button variant="secondary"><Upload /> Upload</Button></CardFooter></Card>)}
        </div></TabsContent>
        <TabsContent value="about panels"><EmptyState title="No panels yet" body="Panels sit under your player: rules, setup, links, sponsors." action={<Button><Plus /> Add panel</Button>} /></TabsContent>
        <TabsContent value="schedule"><Card><CardContent className="grid gap-3 pt-5">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="flex items-center gap-4"><span className="w-10 font-semibold">{d}</span><Input defaultValue="20:00" className="w-28 font-mono" aria-label={`${d} start`} /><span className="text-muted-foreground">to</span><Input defaultValue="23:00" className="w-28 font-mono" aria-label={`${d} end`} /><Switch defaultChecked={d !== "Sun"} aria-label={`Stream on ${d}`} /></div>)}</CardContent><CardFooter className="justify-end"><Button onClick={saved("Schedule saved")}>Save schedule</Button></CardFooter></Card></TabsContent>
        <TabsContent value="socials"><Card><CardContent className="grid gap-4 pt-5">{["X / Twitter", "YouTube", "Discord", "Instagram", "TikTok"].map((n) => <div key={n} className="grid gap-2"><Label>{n}</Label><Input placeholder="https://" /></div>)}</CardContent><CardFooter className="justify-end"><Button onClick={saved()}>Save</Button></CardFooter></Card></TabsContent>
        <TabsContent value="chat"><Card><CardContent className="pt-5"><ToggleRow title="Followers-only chat" body="Only people who have followed for 10 minutes can chat." /><ToggleRow title="Slow mode (3 s)" defaultChecked /><ToggleRow title="Show prediction events in chat" defaultChecked /><ToggleRow title="Allow whispers from viewers" /></CardContent></Card></TabsContent>
      </Tabs>
    </Page>
  );
}

/* ── Help ───────────────────────────────────────────────────────────────── */
export function StudioMessages() {
  return <Page title="Messages" description="Whispers from viewers and other creators, and conversations with the balz creator team." wide><Inbox convos={studioConvos} thread={studioThread} kinds={["All", "Whispers", "Support"]} /></Page>;
}

export function StudioSupport() {
  return (
    <Page title="Creator support" description="Help for streaming, predictions, payouts and moderation. Partner creators get replies within 4 hours." wide>
      <SupportCenter audience="creator" tickets={[
        { id: "T-20391", subject: "Payout on hold after bank change", topic: "Payouts & tax", status: "Resolved", updated: "1 h ago" },
        { id: "T-20177", subject: "Viewer disputes on my bonus-buy question", topic: "Running predictions", status: "Waiting on you", updated: "Yesterday" },
        { id: "T-19812", subject: "Emote rejected, why?", topic: "Moderation", status: "Resolved", updated: "Oct 12" },
      ]} />
    </Page>
  );
}
