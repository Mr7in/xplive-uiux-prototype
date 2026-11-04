import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Check, Flag, Heart, Maximize, Minimize, MoreHorizontal, Pause, Play, Scissors, Settings2, Share2, Smile, Volume2, VolumeX, RectangleHorizontal, Gift, CalendarClock, ShieldCheck } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { streamerByHandle, streamers, type Streamer } from "@/data/streamers";
import { categoryBySlug } from "@/data/categories";
import { chatLines, chatUsers } from "@/data/viewer";
import { LivePlayer, type PlayerHandle } from "@/components/LivePlayer";
import { videoFor } from "@/data/videos";
import { ChannelAvatar, LiveBadge, MarketStatus, StreamThumb, Verified, EmptyState } from "@/components/xp";
import { PredictPanel } from "@/components/PredictPanel";
import { useRequireAuth } from "@/components/auth";
import { useWalletUI } from "@/components/WalletDialogs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn, compact, fmt, fmtUSDC, sanitizeChat, timeLeft } from "@/lib/utils";
import { closedAt, when } from "@/lib/ledger";
import { ResolutionBlock, SideText, TrackRecordGrid, TrackRecordLine, positionOutcome } from "@/components/trust";
import { pool, type Market } from "@/data/markets";
import NotFound from "./NotFound";

interface ChatMsg { id: number; user: string; color: string; text: string; kind?: "event" | "creator" | "me" }

function useChat(handle: string, live: boolean, creatorName: string) {
  const [msgs, setMsgs] = React.useState<ChatMsg[]>(() =>
    Array.from({ length: 14 }).map((_, i) => {
      const u = chatUsers[(i * 4 + handle.length) % chatUsers.length];
      return { id: i, user: u.name, color: u.color, text: chatLines[(i * 7 + handle.length * 3) % chatLines.length] };
    })
  );
  React.useEffect(() => {
    setMsgs((m) => m.some((x) => x.id === 999) ? m : [...m, { id: 999, user: creatorName, color: "#c8ff00", text: "welcome in everyone, predictions open on stream", kind: "creator" }]);
    if (!live) return;
    let n = 1000;
    const t = window.setInterval(() => {
      const u = chatUsers[Math.floor(Math.random() * chatUsers.length)];
      setMsgs((m) => [...m.slice(-80), { id: n++, user: u.name, color: u.color, text: chatLines[Math.floor(Math.random() * chatLines.length)] }]);
    }, 2200);
    return () => window.clearInterval(t);
  }, [handle, live, creatorName]);
  return [msgs, setMsgs] as const;
}

function Chat({ handle, live, creatorName }: { handle: string; live: boolean; creatorName: string }) {
  const { user } = useStore();
  const guard = useRequireAuth();
  const [msgs, setMsgs] = useChat(handle, live, creatorName);
  const [text, setText] = React.useState("");
  const [paused, setPaused] = React.useState(false);
  const listRef = React.useRef<HTMLOListElement>(null);
  React.useEffect(() => {
    const el = listRef.current;
    if (el && !paused) el.scrollTop = el.scrollHeight;
  }, [msgs, paused]);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    guard(() => {
      const clean = sanitizeChat(text.trim());
      if (!clean) return;
      setMsgs((m) => [...m, { id: Date.now(), user: user!.name, color: "#c8ff00", text: clean, kind: "me" }]);
      setText("");
    });
  };
  return (
    <section aria-label="Stream chat" className="flex h-[560px] flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h2 className="font-display text-sm font-semibold">Stream chat</h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> AutoMod on</span>
      </div>
      <ol ref={listRef} onScroll={(e) => { const el = e.currentTarget; setPaused(el.scrollHeight - el.scrollTop - el.clientHeight > 40); }} className="flex-1 space-y-1.5 overflow-y-auto px-4 py-3 text-sm" aria-live="polite" aria-relevant="additions">
        {msgs.map((m) => (
          <li key={m.id} className={cn("chat-safe leading-relaxed", m.kind === "creator" && "rounded-md bg-neon/[0.06] px-2 py-1")}>
            {m.kind === "creator" && <Badge variant="neon" className="mr-1.5 px-1 py-0 text-[10px]">Creator</Badge>}
            <span className="font-semibold" style={{ color: `color-mix(in oklab, ${m.color} 60%, hsl(var(--foreground)))` }}>{m.user}</span>
            <span className="text-label">: {m.text}</span>
          </li>
        ))}
      </ol>
      {paused && <button onClick={() => setPaused(false)} className="mx-4 mb-2 rounded-md bg-secondary py-1.5 text-xs font-semibold">Chat paused · jump to latest</button>}
      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input value={text} onChange={(e) => setText(e.target.value)} onFocus={() => !user && guard(() => {})} maxLength={300} placeholder={user ? (live ? "Send a message" : "Chat is open while offline") : "Log in to chat"} aria-label="Chat message" />
        <Button type="button" variant="ghost" size="icon" aria-label="Emotes"><Smile /></Button>
        <Button type="submit" disabled={!text.trim()}>Chat</Button>
      </form>
    </section>
  );
}

function Player({ s, theatre, onTheatre }: { s: NonNullable<ReturnType<typeof streamerByHandle>>; theatre: boolean; onTheatre: () => void }) {
  const [playing, setPlaying] = React.useState(true);
  const [muted, setMuted] = React.useState(true);
  const [full, setFull] = React.useState(false);
  const player = React.useRef<PlayerHandle>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const guard = useRequireAuth();
  const vid = videoFor(s.handle);
  const togglePlay = () => { if (playing) player.current?.pause(); else player.current?.play(); setPlaying(!playing); };
  const toggleMute = () => { if (muted) player.current?.unmute(); else player.current?.mute(); setMuted(!muted); };
  React.useEffect(() => { setPlaying(true); setMuted(true); }, [s.handle]);
  React.useEffect(() => {
    const on = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await box.current?.requestFullscreen();
    } catch {
      toast("Fullscreen isn’t available in this window", { description: "Try theatre mode instead." });
    }
  };
  return (
    <div ref={box} className={cn("group relative overflow-hidden bg-black", full ? "flex items-center justify-center" : theatre ? "rounded-none" : "rounded-2xl")}>
      <LivePlayer ref={player} s={s} className={cn("rounded-none", (full || theatre) && "mx-auto max-h-[calc(100vh-4rem)] w-auto max-w-full", full && "max-h-screen")} onPlaying={setPlaying}>
        {!s.live && (
          <span className="absolute inset-0 grid place-items-center bg-background/85">
            <span className="flex flex-col items-center gap-3 text-center">
              <span className="font-display text-2xl font-bold">{s.name} is offline</span>
              <span className="flex items-center gap-1.5 text-sm text-label"><CalendarClock className="h-4 w-4" /> Usually live {s.schedule}</span>
              <Button variant="outline" onClick={() => guard(() => toast.success(`We’ll notify you when ${s.name} goes live`))}><Bell /> Notify me</Button>
            </span>
          </span>
        )}
      </LivePlayer>
      {s.live && muted && (
        <button onClick={toggleMute} className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black"><VolumeX className="h-4 w-4" /> Click to unmute</button>
      )}
      {s.live && (
        <>
          <span className="absolute left-3 top-3 flex items-center gap-2"><LiveBadge /><span className="rounded-md bg-black/80 px-2 py-0.5 font-mono text-xs text-white">{Math.floor(s.startedMinsAgo / 60)}:{String(s.startedMinsAgo % 60).padStart(2, "0")}:12</span></span>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/75 px-2 py-1.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause /> : <Play />}</Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX /> : <Volume2 />}</Button>
            <span className="ml-1 hidden font-mono text-xs text-white/80 sm:inline">{fmt(s.viewers)} watching</span>
            {vid && <span className="ml-3 hidden text-[11px] text-white/60 lg:inline">Preview footage: {vid.credit} via YouTube</span>}
            <span className="ml-auto" />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => guard(() => toast.success("Clip saved", { description: "Last 30 seconds. Find it under Clips." }))}><Scissors /> Clip</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Quality"><Settings2 /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64" container={box.current}>
                <DropdownMenuLabel>Quality</DropdownMenuLabel>
                <DropdownMenuItem disabled className="justify-between"><span>Auto</span><Check className="h-4 w-4" /></DropdownMenuItem>
                <p className="px-2 pb-2 text-xs text-muted-foreground">Auto is the only option in this preview. The live player adds 1080p, 720p and 480p.</p>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className={cn("hidden text-white hover:bg-white/10 xl:inline-flex", theatre && "bg-white/15")} onClick={onTheatre} aria-pressed={theatre} aria-label={theatre ? "Exit theatre mode" : "Theatre mode"}><RectangleHorizontal /></Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleFull} aria-label={full ? "Exit fullscreen" : "Fullscreen"}>{full ? <Minimize /> : <Maximize />}</Button>
          </div>
        </>
      )}
    </div>
  );
}

function TipDialog({ open, onOpenChange, name }: { open: boolean; onOpenChange: (o: boolean) => void; name: string }) {
  const [amt, setAmt] = React.useState(5);
  const [msg, setMsg] = React.useState("");
  const { balance, tip } = useStore();
  const ui = useWalletUI();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tip {name}</DialogTitle>
          <DialogDescription>Paid in USDC from your xp.live wallet ({fmtUSDC(balance)} available). {name} keeps 95%. Your message shows in chat.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Tip amount">
          {[1, 5, 10, 25].map((a) => (
            <button key={a} onClick={() => setAmt(a)} aria-pressed={amt === a} className={cn("h-12 rounded-xl border font-mono font-bold", amt === a ? "border-neon bg-lime text-lime-ink" : "hover:border-input")}>{fmtUSDC(a)}</button>
          ))}
        </div>
        <Textarea value={msg} onChange={(e) => setMsg(e.target.value.slice(0, 140))} placeholder="Add a message (optional)" aria-label="Message" />
        <p className="text-right font-mono text-xs text-muted-foreground">{msg.length}/140</p>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          {amt > balance ? <Button onClick={() => { onOpenChange(false); ui.open("add"); }}>Add funds to tip</Button> : <Button onClick={() => { tip(name, amt); onOpenChange(false); toast.success(`Tipped ${fmtUSDC(amt)}`, { description: `Thanks for supporting ${name}.` }); }}>Send {fmtUSDC(amt)}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useWide() {
  const q = "(min-width: 1280px)";
  const [wide, setWide] = React.useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

/** Live question tab when nothing is open: never a blank rail. */
function NoQuestion({ s }: { s: Streamer }) {
  const { markets, positions, user } = useStore();
  const guard = useRequireAuth();
  const past = markets.filter((m) => m.handle === s.handle && (m.status === "settled" || m.status === "voided")).sort((a, b) => closedAt(b) - closedAt(a)).slice(0, 3);
  const openElsewhere = streamers
    .filter((x) => x.live && x.handle !== s.handle && markets.some((m) => m.handle === x.handle && m.status === "open"))
    .sort((a, b) => Number(b.category === s.category) - Number(a.category === s.category) || b.viewers - a.viewers)
    .slice(0, 3);
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="font-display text-lg font-semibold">{s.name} hasn’t opened a question yet.</p>
      <p className="mt-1 text-sm text-label">Questions appear here during the stream.</p>
      <Button variant="outline" className="mt-3 w-full" onClick={() => guard(() => /* PLACEHOLDER: notification service */ toast.success(`We’ll tell you when ${s.name} opens a question`, { description: "Preview: no notification is actually sent." }))}><Bell /> Notify me when a question opens</Button>

      {past.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Last {past.length === 1 ? "question" : `${past.length} questions`}</p>
          <ul className="divide-y rounded-xl border">
            {past.map((m) => {
              const mine = user ? positions.find((p) => p.marketId === m.id) : undefined;
              return (
                <li key={m.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="min-w-0"><span className="block leading-snug">{m.question}</span><span className="text-xs text-muted-foreground">{when(closedAt(m))}{mine && <> · you picked <SideText side={mine.side} /></>}</span></span>
                  <MarketStatus m={m} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {openElsewhere.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Live now with an open question</p>
          <ul className="space-y-2">
            {openElsewhere.map((x) => {
              const m = markets.find((y) => y.handle === x.handle && y.status === "open")!;
              return (
                <li key={x.handle}>
                  <Link to={`/${x.handle}`} className="flex items-center gap-3 rounded-xl border p-2.5 hover:border-input">
                    <ChannelAvatar s={x} size={36} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{x.name} <span className="font-normal text-muted-foreground">· {categoryBySlug(x.category)?.name}</span></span><span className="block truncate text-xs text-label">{m.question}</span></span>
                    <span className="shrink-0 font-mono text-xs tabular text-label">{timeLeft(m.secondsLeft ?? 0)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function PastQuestions({ s }: { s: Streamer }) {
  const { markets, positions, user } = useStore();
  const list = markets.filter((m) => m.handle === s.handle && (m.status === "settled" || m.status === "voided")).sort((a, b) => closedAt(b) - closedAt(a));
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <div>
        <p className="mb-2 text-sm font-semibold">{s.name}’s track record</p>
        <TrackRecordGrid handle={s.handle} />
      </div>
      {list.length ? (
        <ul className="divide-y rounded-xl border">
          {list.map((m) => {
            const mine = user ? positions.filter((p) => p.marketId === m.id && p.tx !== "failed") : [];
            const isOpen = open === m.id;
            return (
              <li key={m.id}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-secondary/50">
                  <span className="min-w-0">
                    <span className="block leading-snug">{m.question}</span>
                    <span className="text-xs text-muted-foreground">{when(closedAt(m))} · pool {fmtUSDC(pool(m))}</span>
                    {mine.map((p) => { const o = positionOutcome(m, p); return <span key={p.id} className={cn("mt-0.5 block text-xs", o.key === "won" ? "font-semibold text-neon" : "text-label")}>You: <SideText side={p.side} /> {fmtUSDC(p.amount)} · {o.label === "Won" ? `won, ${fmtUSDC(o.back)} back to you` : o.label.toLowerCase()}</span>; })}
                  </span>
                  <MarketStatus m={m} />
                </button>
                {isOpen && <div className="px-3 pb-3"><ResolutionBlock m={m} /></div>}
              </li>
            );
          })}
        </ul>
      ) : <p className="text-sm text-muted-foreground">{s.name} hasn’t settled a question yet. Results show here with the evidence used.</p>}
    </div>
  );
}

function Rail({ s, active }: { s: Streamer; active?: Market }) {
  const [tab, setTab] = React.useState("question");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-3 border-b-0">
        <TabsTrigger value="question">Live question{active?.status === "open" && <span className="h-1.5 w-1.5 rounded-full bg-live" aria-label="open" />}</TabsTrigger>
        <TabsTrigger value="past">Past questions</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="question" className="pt-0">{active ? <PredictPanel m={active} /> : <NoQuestion s={s} />}</TabsContent>
      <TabsContent value="past" className="pt-0"><PastQuestions s={s} /></TabsContent>
      <TabsContent value="chat" className="pt-0" forceMount hidden={tab !== "chat"}><Chat handle={s.handle} live={s.live} creatorName={s.name} /></TabsContent>
    </Tabs>
  );
}

export default function Channel() {
  const { handle = "" } = useParams();
  const s = streamerByHandle(handle);
  const cat = s ? categoryBySlug(s.category) : undefined;
  usePageMeta(s ? `${s.name}${s.live ? " is live" : ""}` : undefined, s ? `${s.title} · ${cat?.name}. ${s.bio}` : undefined);
  const { markets, isFollowing, toggleFollow, user } = useStore();
  const guard = useRequireAuth();
  const wide = useWide();
  const [tip, setTip] = React.useState(false);
  const [theatre, setTheatre] = React.useState(false);
  if (!s || !cat) return <NotFound />;

  const mine = markets.filter((m) => m.handle === s.handle);
  // The rail shows the open question, or one that closed in the last 30 minutes (so its result lands in place).
  const active = mine.find((m) => m.status === "open") ?? mine.filter((m) => Date.now() - closedAt(m) <= 30 * 60_000).sort((a, b) => closedAt(b) - closedAt(a))[0];
  const following = isFollowing(s.handle);
  const isOwner = user?.channel === s.handle;
  const similar = streamers.filter((x) => x.category === s.category && x.handle !== s.handle);
  const runs = mine.length > 0;

  const header = (
    <div className="flex flex-wrap items-start gap-4">
      <ChannelAvatar s={s} size={64} />
      <div className="min-w-[12rem] flex-1">
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold">{s.name} {s.verified && <Verified />}</h1>
        <p className="mt-0.5 font-medium text-label">{s.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Link to={`/category/${cat.slug}`} className="font-semibold text-foreground hover:underline">{cat.name}</Link>
          {s.live && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-live" /> <span className="font-mono tabular">{fmt(s.viewers)}</span> watching</span>}
          <span>{compact(s.followers)} followers</span>
        </p>
        {runs && <TrackRecordLine handle={s.handle} className="mt-1.5 text-xs" />}
      </div>
      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <Button asChild variant="outline"><Link to="/studio">Open Creator Studio</Link></Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => guard(() => { toggleFollow(s.handle); toast(following ? `Unfollowed ${s.name}` : `Following ${s.name}`); })}>
              {following ? <><Heart fill="currentColor" /> Following</> : <><Heart /> Follow</>}
            </Button>
            <Button variant="outline" onClick={() => guard(() => setTip(true))}><Gift /> Tip</Button>
          </>
        )}
        <Button variant="ghost" size="icon" aria-label="Share" onClick={() => { try { navigator.clipboard?.writeText(window.location.href); } catch { /* clipboard blocked */ } toast("Link copied"); }}><Share2 /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => guard(() => toast("Report sent", { description: "Our safety team reviews reports within 24 hours." }))}><Flag /> Report channel</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => guard(() => toast("Go-live notifications on", { description: "Preview: no notification is actually sent." }))}><Bell /> Go-live notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const lower = (
    <Tabs defaultValue="about">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="videos">Past streams</TabsTrigger>
        <TabsTrigger value="clips">Clips</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 md:col-span-2"><h3 className="mb-2 font-display font-semibold">About {s.name}</h3><p className="text-label">{s.bio}</p><p className="mt-3 text-sm text-muted-foreground">Streams in {s.language} from {s.country}.</p></div>
          <div className="rounded-xl border bg-card p-5"><h3 className="mb-2 font-display font-semibold">Channel rules</h3><ol className="list-decimal space-y-1 pl-4 text-sm text-label"><li>Be kind to the creator and each other.</li><li>No spam, links or begging for tips.</li><li>Prediction talk is welcome, harassment over results isn’t.</li></ol></div>
        </div>
      </TabsContent>
      <TabsContent value="schedule">
        <div className="rounded-xl border bg-card p-5"><p className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" /> {s.schedule}</p><p className="mt-1 text-sm text-muted-foreground">Times shown in the creator’s time zone. Turn on go-live notifications to never miss one.</p></div>
      </TabsContent>
      <TabsContent value="videos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Yesterday", "3 days ago", "Last week"].map((w, i) => (
            <div key={w}><StreamThumb s={{ ...s, live: true }} frame={((i % 3) + 1) as 1 | 2 | 3}><span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 font-mono text-xs text-white">{2 + i}:1{i}:0{i}</span></StreamThumb><p className="mt-2 font-semibold">{s.title}</p><p className="text-sm text-muted-foreground">{w} · {compact(s.viewers * (3 - i) + 400)} views</p></div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="clips">
        <EmptyState icon={Scissors} title="No clips yet" body="Viewers can clip the last 30 seconds from the player. Popular clips show up here." />
      </TabsContent>
    </Tabs>
  );

  const rail = <Rail key={s.handle} s={s} active={active} />;

  return (
    <div className={cn("mx-auto px-3 py-4 md:px-5", theatre && wide ? "max-w-none px-0 py-0 md:px-0" : "max-w-[1800px]")}>
      {theatre && wide && <Player s={s} theatre onTheatre={() => setTheatre(false)} />}
      <div className={cn("grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]", theatre && wide && "px-5 py-4")}>
        <div className="min-w-0 space-y-5">
          {!(theatre && wide) && <Player s={s} theatre={false} onTheatre={() => setTheatre(true)} />}
          {header}
          {!wide && rail}
          {lower}
          {similar.length > 0 && (
            <div className="rounded-xl border p-4">
              <p className="mb-3 text-sm font-semibold text-label">More in {cat.name}</p>
              <div className="flex flex-wrap gap-3">{similar.map((x) => <Link key={x.handle} to={`/${x.handle}`} className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm hover:border-input"><ChannelAvatar s={x} size={28} ring={false} />{x.name}{x.live && <span className="h-1.5 w-1.5 rounded-full bg-live" />}</Link>)}</div>
            </div>
          )}
        </div>
        {wide && <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start" aria-label="Questions and chat">{rail}</aside>}
      </div>
      <TipDialog open={tip} onOpenChange={setTip} name={s.name} />
    </div>
  );
}
