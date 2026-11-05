import * as React from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Copy, ExternalLink, Hand, Keyboard, Lock, Monitor, Plus, Smartphone, Trash2, Vibrate } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { companionPath, companionUrl, DURATIONS, genericPresets, seedDevices, type DeviceSession } from "@/data/companion";
import { PageHeader } from "@/components/xp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, timeLeft } from "@/lib/utils";

function Qr({ value }: { value: string }) {
  const [svg, setSvg] = React.useState("");
  React.useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 1, color: { dark: "#0e1019", light: "#ffffff" } }).then((s) => { if (alive) setSvg(s); });
    return () => { alive = false; };
  }, [value]);
  return <div className="h-44 w-44 shrink-0 overflow-hidden rounded-xl bg-white p-2 [&_svg]:h-full [&_svg]:w-full" role="img" aria-label="QR code of your companion link" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** A small card linking Studio pages to the companion app. */
export function CompanionPromo({ className }: { className?: string }) {
  const { user } = useStore();
  if (!user?.channel) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3", className)}>
      <Smartphone className="h-5 w-5 shrink-0 text-label" />
      <p className="min-w-0 flex-1 text-sm"><b>Playing full screen?</b> <span className="text-label">Run your questions from your phone or a second monitor.</span></p>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="secondary"><Link to="/studio/companion">Set up</Link></Button>
        <Button asChild size="sm" variant="outline"><a href={`#${companionPath(user.channel)}`} target="_blank" rel="noreferrer"><ExternalLink /> Open</a></Button>
      </div>
    </div>
  );
}

export default function StudioCompanion() {
  usePageMeta("Companion app · Studio");
  const { user, presets, savePresets } = useStore();
  const handle = user!.channel!;
  const url = companionUrl(handle);
  const list = presets[handle] ?? genericPresets;
  const [devices, setDevices] = React.useState<DeviceSession[]>(seedDevices);
  const [q, setQ] = React.useState("");
  const [dur, setDur] = React.useState(120);
  const ok = q.trim().length >= 10 && q.trim().endsWith("?");

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast("Copy the link from the box"); }
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    savePresets(handle, [...list, { id: `pr-${Date.now()}`, question: q.trim(), rule: "Settled on what viewers can see on stream.", seconds: dur }]);
    setQ("");
    toast.success("Saved to your quick questions");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Companion app"
        description="Quick controls for your questions on a phone, tablet or second monitor, so you can start, close and settle them without leaving your game."
        actions={<Button asChild><a href={`#${companionPath(handle)}`} target="_blank" rel="noreferrer"><ExternalLink /> Open companion</a></Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Your companion link</CardTitle>
            <CardDescription>Only your account can log in here. Anyone else who opens it sees a login screen.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Qr value={url} />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-sm text-label">Scan with your phone’s camera, or open the link on any screen and log in with your balz email and password.</p>
              <div className="flex gap-2">
                <Input readOnly value={url} className="font-mono text-xs" aria-label="Companion link" onFocus={(e) => e.currentTarget.select()} />
                <Button variant="secondary" size="icon" onClick={copy} aria-label="Copy link"><Copy /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: open it in a second browser window next to Studio. Anything you do in one shows in the other straight away.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div><CardTitle>Logged-in devices</CardTitle><CardDescription>Log out a device if you lose it.</CardDescription></div>
            {devices.length > 0 && <Button size="sm" variant="destructive-outline" onClick={() => { setDevices([]); toast("All companion devices logged out"); }}>Log out all</Button>}
          </CardHeader>
          <CardContent>
            {devices.length ? (
              <ul className="divide-y">
                {devices.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-3 text-sm">
                    {d.device.startsWith("iPhone") ? <Smartphone className="h-5 w-5 text-label" /> : <Monitor className="h-5 w-5 text-label" />}
                    <div className="min-w-0 flex-1"><p className="font-semibold">{d.device} · {d.browser}</p><p className="text-xs text-muted-foreground">{d.place} · {d.lastSeen}</p></div>
                    {d.current && <Badge variant="neon">In use</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => { setDevices((x) => x.filter((y) => y.id !== d.id)); toast(`${d.device} logged out`); }}>Log out</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No devices logged in.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Quick questions</CardTitle>
            <CardDescription>One tap to pick, one tap to start. These show at the top of the companion app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {list.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1"><span className="font-medium">{p.question}</span><span className="block truncate text-xs text-muted-foreground">{p.rule}</span></span>
                  <span className="font-mono text-xs text-muted-foreground">{timeLeft(p.seconds)}</span>
                  <Button size="icon-sm" variant="ghost" aria-label={`Remove “${p.question}”`} onClick={() => savePresets(handle, list.filter((x) => x.id !== p.id))}><Trash2 /></Button>
                </li>
              ))}
            </ul>
            <form onSubmit={add} className="grid gap-2 rounded-xl border border-dashed p-3">
              <Input value={q} onChange={(e) => setQ(e.target.value.slice(0, 120))} placeholder="Will the next bonus buy pay over 100×?" aria-label="New quick question" />
              <div className="flex flex-wrap items-center gap-2">
                {DURATIONS.map((d) => (
                  <button key={d.s} type="button" onClick={() => setDur(d.s)} className={cn("h-8 rounded-md border px-3 text-xs font-semibold", dur === d.s ? "border-foreground bg-secondary" : "text-label")}>{d.l}</button>
                ))}
                <Button type="submit" size="sm" className="ml-auto" disabled={!ok}><Plus /> Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Built for mid-game</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-label">
            <p className="flex gap-3"><Hand className="mt-0.5 h-4 w-4 shrink-0 text-foreground" /> Settle, void and close need a press and hold, so a bump can’t pay out the wrong side.</p>
            <p className="flex gap-3"><Vibrate className="mt-0.5 h-4 w-4 shrink-0 text-foreground" /> Your phone buzzes when a question closes and jumps straight to the YES / NO buttons.</p>
            <p className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-foreground" /> Lock the screen between questions. The screen stays on while the app is open.</p>
            <p className="flex gap-3"><Keyboard className="mt-0.5 h-4 w-4 shrink-0 text-foreground" /> On a second monitor, hold Y or N to settle and C to close.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
