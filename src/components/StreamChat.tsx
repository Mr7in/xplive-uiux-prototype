import * as React from "react";
import { ChevronRight, ShieldCheck, Smile } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/components/auth";
import { chatLines, chatUsers } from "@/data/viewer";
import type { Market } from "@/data/markets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, sanitizeChat, timeLeft } from "@/lib/utils";

interface ChatMsg { id: number; user: string; color: string; text: string; kind?: "event" | "creator" | "me" }

function useChat(handle: string, live: boolean, creatorName: string) {
  const seed = React.useCallback(
    (): ChatMsg[] =>
      Array.from({ length: 14 }).map((_, i) => {
        const u = chatUsers[(i * 4 + handle.length) % chatUsers.length];
        return { id: i, user: u.name, color: u.color, text: chatLines[(i * 7 + handle.length * 3) % chatLines.length] };
      }),
    [handle]
  );
  const [msgs, setMsgs] = React.useState<ChatMsg[]>(seed);
  React.useEffect(() => {
    setMsgs([...seed(), { id: 999, user: creatorName, color: "#c8ff00", text: "welcome in everyone, predictions open on stream", kind: "creator" }]);
    if (!live) return;
    let n = 1000;
    const t = window.setInterval(() => {
      const u = chatUsers[Math.floor(Math.random() * chatUsers.length)];
      setMsgs((m) => [...m.slice(-80), { id: n++, user: u.name, color: u.color, text: chatLines[Math.floor(Math.random() * chatLines.length)] }]);
    }, 2200);
    return () => window.clearInterval(t);
  }, [handle, live, creatorName, seed]);
  return [msgs, setMsgs] as const;
}

/**
 * Pinned open question at the top of chat (the Twitch "prediction in chat" pattern):
 * the stream and the conversation stay primary, the question is one tap away.
 */
export function PinnedQuestion({ m, onOpen, className }: { m: Market; onOpen: () => void; className?: string }) {
  const secs = m.secondsLeft ?? 0;
  return (
    <button type="button" onClick={onOpen} className={cn("group flex w-full items-center gap-3 rounded-xl border border-neon/40 bg-neon/[0.04] px-3 py-2.5 text-left transition hover:border-neon/70", className)}>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs text-label">
          <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden /> Question open · <span className={cn("font-mono tabular", secs <= 30 ? "font-bold text-warn" : "text-foreground")}>{timeLeft(secs)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug">{m.question}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-neon">Predict <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
    </button>
  );
}

/** Live stream chat. Fills its container: give the wrapper a height (or flex-1 in a column). */
export function StreamChat({ handle, live, creatorName, pinned, className }: { handle: string; live: boolean; creatorName: string; pinned?: React.ReactNode; className?: string }) {
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
    <section aria-label="Stream chat" className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card", className)}>
      {pinned && <div className="border-b p-2.5">{pinned}</div>}
      <ol ref={listRef} onScroll={(e) => { const el = e.currentTarget; setPaused(el.scrollHeight - el.scrollTop - el.clientHeight > 40); }} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3 text-sm" aria-live="polite" aria-relevant="additions">
        {msgs.map((m) => (
          <li key={m.id} className={cn("chat-safe leading-relaxed", m.kind === "creator" && "rounded-md bg-neon/[0.06] px-2 py-1")}>
            {m.kind === "creator" && <Badge variant="neon" className="mr-1.5 px-1 py-0 text-[10px]">Creator</Badge>}
            <span className="font-semibold" style={{ color: `color-mix(in oklab, ${m.color} 60%, hsl(var(--foreground)))` }}>{m.user}</span>
            <span className="text-label">: {m.text}</span>
          </li>
        ))}
      </ol>
      {paused && <button onClick={() => setPaused(false)} className="mx-4 mb-2 rounded-md bg-secondary py-1.5 text-xs font-semibold">Chat paused · jump to latest</button>}
      <form onSubmit={send} className="flex items-center gap-1.5 border-t p-2.5">
        <Input value={text} onChange={(e) => setText(e.target.value)} onFocus={() => !user && guard(() => {})} maxLength={300} placeholder={user ? (live ? "Send a message" : "Chat is open while offline") : "Log in to chat"} aria-label="Chat message" />
        <span className="hidden text-muted-foreground sm:inline-flex" title="AutoMod on: messages are filtered for spam and abuse" aria-label="AutoMod on"><ShieldCheck className="h-4 w-4" /></span>
        <Button type="button" variant="ghost" size="icon" aria-label="Emotes"><Smile /></Button>
        <Button type="submit" disabled={!text.trim()}>Chat</Button>
      </form>
    </section>
  );
}
