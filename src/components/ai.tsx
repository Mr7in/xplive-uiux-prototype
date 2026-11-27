/**
 * AI double-check trustmark (iteration 4b).
 *
 * The creator (or a channel mod) settles each question by hand, because AI can't cover every
 * category yet. Every result is then double-checked by AI against the rule and the evidence clip
 * before xp.live pays anyone. The AI never pays out; the system does, once the check passes.
 *
 * PLACEHOLDER: AI verification service (clip + rule in, match / flag out). Scope and cost still to
 * agree with the CTO.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, PauseCircle } from "lucide-react";
import type { Market } from "@/data/markets";
import { cn } from "@/lib/utils";

/** True while a posted result is waiting on its AI check (payout held). */
export const aiChecking = (m: Market) => m.status === "settled" && m.aiCheck === "checking";
/** The AI couldn't match the result to the rule: payout held until a person reviews it. */
export const aiFlagged = (m: Market) => m.status === "settled" && m.aiCheck === "flagged";

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

/** Trustmark pill: "Checked by AI", or "AI checking" while a result is being verified. */
export function AiBadge({ checking, flagged, time, className, size = "md" }: { checking?: boolean; flagged?: boolean; time?: string; className?: string; size?: "sm" | "md" }) {
  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  if (flagged)
    return (
      <span className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-warn/50 bg-warn/10 font-semibold text-warn", size === "sm" ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-xs", className)} title="AI couldn't confirm this result. Payout is held until a person reviews it.">
        <PauseCircle className={icon} /> Held for review
      </span>
    );
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-foreground/20 bg-foreground/[0.05] font-semibold text-foreground",
        size === "sm" ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-xs",
        className,
      )}
      title="The creator or a mod settles the result. AI double-checks it against the rule and the stream before anyone is paid."
    >
      {checking ? <Loader2 className={cn("animate-spin", icon)} /> : <AiMarkIcon className={icon} />}
      {checking ? "AI checking" : "Checked by AI"}
      {time && <span className="font-mono font-normal tabular text-label">· {time}</span>}
    </span>
  );
}

/** One visible line at the decision moment: who settles, who checks. */
export function TrustStrip({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg border border-foreground/15 bg-foreground/[0.03] px-3 py-2 text-sm", className)}>
      <AiMarkIcon className="h-5 w-5 text-foreground" />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="font-semibold">Settled by {name} or a mod</span>
        <span className="block text-xs text-label">Double-checked by AI before payout</span>
      </span>
      <Link to="/how-it-works" className="shrink-0 text-xs text-label underline underline-offset-2 hover:text-foreground">How</Link>
    </div>
  );
}

/** Progress of the AI check on a freshly posted result (12 s in the demo). */
export function AiCheckProgress({ m, by, className }: { m: Market; by: string; className?: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(t); }, []);
  const el = m.settledAt ? (now - m.settledAt) / 1000 : 0;
  const steps = [
    { label: `${by} settled ${m.outcome}`, done: true },
    { label: "AI watching the evidence clip", done: el > 5 || !aiChecking(m) },
    { label: "Matching it to the rule", done: !aiChecking(m) },
    { label: "xp.live pays the winners", done: !!m.paidAt && m.paidAt <= now },
  ];
  const cur = steps.findIndex((s) => !s.done);
  return (
    <ol className={cn("grid gap-1.5 text-sm", className)} aria-label="AI check progress">
      {steps.map((s, i) => (
        <li key={s.label} className={cn("flex items-center gap-2", s.done || i === cur ? "text-foreground" : "text-muted-foreground")} aria-current={i === cur ? "step" : undefined}>
          {s.done ? <Check className="h-3.5 w-3.5 text-neon" strokeWidth={3} /> : i === cur ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="mx-[5px] h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
          {s.label}
        </li>
      ))}
    </ol>
  );
}
