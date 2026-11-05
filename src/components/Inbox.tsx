import * as React from "react";
import { Search, Send, Archive, LifeBuoy } from "lucide-react";
import { streamerByHandle } from "@/data/streamers";
import { ChannelAvatar } from "@/components/xp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillTabsList, PillTabsTrigger, Tabs } from "@/components/ui/tabs";
import { cn, sanitizeChat } from "@/lib/utils";

export interface Convo { id: string; with: string; preview: string; when: string; unread: number; kind: string }
export interface Msg { me: boolean; text: string; when: string }

const nameOf = (h: string) => (h === "support" ? "balz Support" : streamerByHandle(h)?.name ?? h);

/** Two-pane inbox shared by viewer Messages and Creator Studio Messages. */
export function Inbox({ convos, thread, kinds = ["All", "Whispers", "Support"] }: { convos: Convo[]; thread: Msg[]; kinds?: string[] }) {
  const [kind, setKind] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(convos[0]?.id);
  const [msgs, setMsgs] = React.useState<Record<string, Msg[]>>({ [convos[0]?.id ?? ""]: thread });
  const [text, setText] = React.useState("");
  const list = convos.filter((c) => (kind === "All" || c.kind === kind) && nameOf(c.with).toLowerCase().includes(q.toLowerCase()));
  const cur = convos.find((c) => c.id === active);
  const curMsgs = msgs[active ?? ""] ?? [{ me: false, text: cur?.preview ?? "", when: cur?.when ?? "" }];
  const s = cur ? streamerByHandle(cur.with) : undefined;

  return (
    <div className="grid min-h-[600px] overflow-hidden rounded-2xl border md:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex flex-col border-b md:border-b-0 md:border-r">
        <div className="space-y-3 border-b p-3">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="pl-9" aria-label="Search conversations" /></div>
          <Tabs value={kind} onValueChange={setKind}><PillTabsList>{kinds.map((k) => <PillTabsTrigger key={k} value={k} className="h-8 text-xs">{k}</PillTabsTrigger>)}</PillTabsList></Tabs>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {list.map((c) => {
            const cs = streamerByHandle(c.with);
            return (
              <li key={c.id}>
                <button onClick={() => setActive(c.id)} aria-current={c.id === active} className={cn("flex w-full gap-3 border-b px-3 py-3 text-left hover:bg-surface", c.id === active && "bg-surface-2")}>
                  {cs ? <ChannelAvatar s={cs} size={40} ring={false} /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-secondary text-label"><LifeBuoy className="h-5 w-5" /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2"><span className="truncate font-semibold">{nameOf(c.with)}</span><span className="shrink-0 text-xs text-muted-foreground">{c.when}</span></span>
                    <span className={cn("block truncate text-sm", c.unread ? "text-foreground" : "text-muted-foreground")}>{c.preview}</span>
                  </span>
                  {c.unread > 0 && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
          {!list.length && <li className="p-6 text-center text-sm text-muted-foreground">No conversations match.</li>}
        </ul>
      </div>
      {cur ? (
        <div className="flex min-h-[520px] flex-col">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            {s ? <ChannelAvatar s={s} size={36} ring={false} /> : <span className="grid h-9 w-9 place-items-center rounded-full border bg-secondary text-label"><LifeBuoy className="h-4 w-4" /></span>}
            <div className="min-w-0 flex-1"><p className="font-semibold">{nameOf(cur.with)}</p><p className="text-xs text-muted-foreground">{cur.kind === "Support" ? "Replies within 24 hours" : s?.live ? "Live now" : "Offline"}</p></div>
            <Badge variant="muted">{cur.kind}</Badge>
            <Button variant="ghost" size="icon" aria-label="Archive conversation"><Archive /></Button>
          </div>
          <ol className="flex-1 space-y-3 overflow-y-auto p-4">
            {curMsgs.map((m, i) => (
              <li key={i} className={cn("flex", m.me && "justify-end")}>
                <span className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm chat-safe", m.me ? "rounded-br-sm bg-lime text-lime-ink" : "rounded-bl-sm bg-surface-2")}>
                  {m.text}<span className={cn("ml-2 font-mono text-[10px]", m.me ? "text-background/60" : "text-muted-foreground")}>{m.when}</span>
                </span>
              </li>
            ))}
          </ol>
          <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); const t = sanitizeChat(text.trim()); if (!t || !active) return; setMsgs((x) => ({ ...x, [active]: [...curMsgs, { me: true, text: t, when: "now" }] })); setText(""); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${nameOf(cur.with)}`} aria-label="Message" maxLength={500} />
            <Button type="submit" disabled={!text.trim()}><Send /> Send</Button>
          </form>
        </div>
      ) : <div className="grid place-items-center p-10 text-muted-foreground">Pick a conversation</div>}
    </div>
  );
}
