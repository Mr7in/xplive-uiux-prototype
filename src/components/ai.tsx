/**
 * AI settlement trustmark (iteration 4).
 *
 * Synthetic-user feedback on iteration 3: viewers did not trust a creator closing and settling
 * their own question. From the viewer's side every question is now checked and settled by the
 * xp.live AI resolver: it watches the stream, finds the moment named in the rule, cuts the
 * evidence clip and posts the result. The creator only asks the question.
 *
 * PLACEHOLDER: AI resolver service (stream watcher, rule matcher, clip cutter, result poster).
 * Wording and model details are placeholders until the resolver scope is agreed with the CTO.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import type { Market } from "@/data/markets";
import { cn } from "@/lib/utils";

/** The mark: a shield with a check and a small spark. Same shape everywhere, so it reads as one trustmark. */
export function AiMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4 shrink-0", className)}>
      <path d="M11 2.5 4 5.2v5.6c0 4.6 3 8.6 7 10.2 4-1.6 7-5.6 7-10.2V9" />
      <path d="m7.8 11.6 2.4 2.4 4.6-4.8" />
      <path d="M19 1.5v5M16.5 4h5" strokeWidth={1.7} />
    </svg>
  );
}

type BadgeState = "auto" | "checking" | "settled";

/**
 * Trustmark pill. `auto` on open questions ("Settled by AI"), `checking` while the resolver
 * works on a closed question, `settled` on a result.
 */
export function AiBadge({ state = "auto", time, className, size = "md" }: { state?: BadgeState; time?: string; className?: string; size?: "sm" | "md" }) {
  const label = state === "checking" ? "AI is checking" : state === "settled" ? "Settled by AI" : "Settled by AI";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-foreground/20 bg-foreground/[0.05] font-semibold text-foreground",
        size === "sm" ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-xs",
        className,
      )}
      title="Checked and settled automatically by xp.live AI. The creator can’t decide or change the result."
    >
      {state === "checking" ? <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} /> : <AiMarkIcon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {label}
      {time && <span className="font-mono font-normal tabular text-label">· {time}</span>}
    </span>
  );
}

/** One-line promise, shown at the decision moment (ticket, hero, receipt, wallet). */
export function AiTrustLine({ className, link = true }: { className?: string; link?: boolean }) {
  return (
    <p className={cn("flex items-start gap-2 text-xs leading-relaxed text-label", className)}>
      <AiMarkIcon className="mt-px h-4 w-4 text-foreground" />
      <span>
        <span className="font-semibold text-foreground">Settled by AI, not by the creator.</span> xp.live AI watches the stream, checks the result against the rule and pays out automatically.
        {link && <> <Link to="/how-it-works" className="whitespace-nowrap underline underline-offset-2 hover:text-foreground">How AI settles</Link></>}
      </span>
    </p>
  );
}

/** What the resolver does, in order. Shared by the live check, the evidence dialog and How it works. */
export const AI_STEPS = [
  { at: 0, label: "Watching the stream for the moment in the rule" },
  { at: 12, label: "Found the moment, checking it against the rule" },
  { at: 24, label: "Cutting the evidence clip" },
  { at: 34, label: "Posting the result and paying winners" },
] as const;

/**
 * Live progress of the AI check on a closed question. Demo questions (with a script) settle
 * about 40 s after closing, so the steps advance on that clock. Seed questions that are waiting
 * on something that hasn't happened yet stay on the first step.
 */
export function AiCheckProgress({ m, className }: { m: Market; className?: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(t); }, []);
  const elapsed = m.script && m.closedAt ? (now - m.closedAt) / 1000 : 0;
  const idx = m.script && m.closedAt ? AI_STEPS.reduce((a, s, i) => (elapsed >= s.at ? i : a), 0) : 0;
  return (
    <ol className={cn("grid gap-1.5 text-sm", className)} aria-label="AI check progress">
      {AI_STEPS.map((s, i) => {
        const done = i < idx;
        const cur = i === idx;
        return (
          <li key={s.label} className={cn("flex items-center gap-2", done || cur ? "text-foreground" : "text-muted-foreground")} aria-current={cur ? "step" : undefined}>
            {done ? <Check className="h-3.5 w-3.5 text-neon" strokeWidth={3} /> : cur ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="mx-[5px] h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}
