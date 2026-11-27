import * as React from "react";
import { Link } from "react-router-dom";
import { Check, CreditCard, Smartphone, Clock, ArrowUpRight, Scale, Lock } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { ledgerStats, DISPUTE_WINDOW_MIN } from "@/lib/ledger";
import { streamerByHandle } from "@/data/streamers";
import { multiplier, yesPct } from "@/data/markets";
import { AiBadge, AiMarkIcon } from "@/components/ai";
import { ChannelAvatar, SplitBar, StreamThumb } from "@/components/xp";
import { cn, fmt } from "@/lib/utils";

/**
 * "How it works". One short step per row, each with a picture built from the product's own UI,
 * so the page shows what the viewer will actually see.
 * PLACEHOLDER: final copy approved for custody, withdrawals and the settle + AI check model.
 */

/* ───────────── Pictures (small, non-interactive slices of the real UI) ───────────── */

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none select-none rounded-2xl border bg-card p-4", className)}>{children}</div>;
}

const DEMO = { yesPool: 1244, noPool: 1560 };

function PicAsk() {
  const s = streamerByHandle("kovac")!;
  return (
    <Frame>
      <div className="flex items-center gap-2 text-sm text-label"><ChannelAvatar s={s} size={22} ring={false} /> {s.name} asks</div>
      <p className="mt-2 font-display text-lg font-bold leading-tight">Will Kovac win the next clutch round?</p>
      <p className="mt-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-label">Rule: last player alive on his team, team takes the round</p>
      <SplitBar m={DEMO} className="mt-3" />
      <div className="mt-1.5 flex justify-between font-mono text-xs tabular"><span className="text-yes">YES {yesPct(DEMO)}%</span><span className="inline-flex items-center gap-1 text-foreground"><Clock className="h-3 w-3" />2:41</span><span className="text-no">{100 - yesPct(DEMO)}% NO</span></div>
    </Frame>
  );
}

function PicPick() {
  return (
    <Frame>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-yes-fill bg-yes-fill px-3 py-2 text-yes-ink"><p className="font-display text-lg font-extrabold">Yes</p><p className="font-mono text-xs">pays {multiplier(DEMO, "YES").toFixed(2)}×</p></div>
        <div className="rounded-xl border-2 border-no/25 bg-no-tint px-3 py-2 text-no"><p className="font-display text-lg font-extrabold">No</p><p className="font-mono text-xs">pays {multiplier(DEMO, "NO").toFixed(2)}×</p></div>
      </div>
      <dl className="mt-3 space-y-1 rounded-xl bg-secondary/60 px-3 py-2 font-mono text-sm tabular">
        <div className="flex justify-between"><dt className="font-sans text-label">Stake</dt><dd>10.00 USDC</dd></div>
        <div className="flex justify-between"><dt className="font-sans text-label">Back to you</dt><dd>21.62 USDC</dd></div>
        <div className="flex justify-between"><dt className="font-sans text-label">Profit</dt><dd className="text-neon">+11.62 USDC</dd></div>
      </dl>
    </Frame>
  );
}

function PicSettle() {
  return (
    <Frame>
      <p className="text-sm font-semibold">Did it happen?</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="relative overflow-hidden rounded-xl bg-yes-fill px-3 py-4 text-center text-yes-ink">
          <span className="absolute inset-y-0 left-0 w-2/3 bg-black/15" />
          <p className="relative font-display text-3xl font-black">YES</p><p className="relative text-xs font-semibold opacity-80">Holding…</p>
        </div>
        <div className="rounded-xl bg-no-fill px-3 py-4 text-center text-no-ink"><p className="font-display text-3xl font-black">NO</p><p className="text-xs font-semibold opacity-80">Hold</p></div>
      </div>
      <p className="mt-3 text-xs text-label">Creator’s phone, mid-game. Mods can settle too.</p>
    </Frame>
  );
}

function PicCheck() {
  const s = streamerByHandle("kovac")!;
  return (
    <Frame className="p-3">
      <StreamThumb s={{ ...s, live: true }} frame={2} className="rounded-lg">
        <span className="hiw-scan absolute inset-x-0 h-0.5 bg-white/80" />
        <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-xs text-white">1:10:21 – 1:11:06</span>
      </StreamThumb>
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 text-sm"><Check className="h-4 w-4 text-neon" strokeWidth={3} /> Matches the rule at <span className="font-mono tabular">1:10:38</span></span>
        <AiBadge size="sm" />
      </div>
    </Frame>
  );
}

function PicPaid() {
  return (
    <Frame>
      <p className="text-sm text-muted-foreground">USDC balance</p>
      <p className="mt-0.5 font-mono text-3xl font-bold tabular">93.62</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-neon/40 px-3 py-2 text-sm">
        <span className="min-w-0"><span className="block font-semibold">Back to you</span><span className="block truncate text-xs text-muted-foreground">Will Kovac win the next clutch round?</span></span>
        <span className="font-mono font-bold tabular text-neon">+21.62</span>
      </div>
    </Frame>
  );
}

function PicDispute() {
  return (
    <Frame>
      <div className="flex items-center gap-2 text-sm font-semibold"><Scale className="h-4 w-4" /> Dispute this result</div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-label">Window</dt><dd>{DISPUTE_WINDOW_MIN / 60} hours</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-label">Bond</dt><dd className="text-right">5.00 USDC, back if you’re right</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-label">Reviewed by</dt><dd>A person at xp.live</dd></div>
      </dl>
    </Frame>
  );
}

function PicFunds() {
  return (
    <Frame>
      {[
        { l: "Apple Pay", I: Smartphone, on: true },
        { l: "Google Pay", I: Smartphone, on: false },
        { l: "Card", I: CreditCard, on: false },
      ].map(({ l, I, on }) => (
        <div key={l} className={cn("mb-2 flex h-11 items-center gap-3 rounded-xl border px-3 text-sm font-semibold", on && "border-foreground bg-secondary")}><I className="h-4 w-4" />{l}</div>
      ))}
      <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Powered by <span className="font-semibold text-label">Circle</span></p>
    </Frame>
  );
}

function PicWithdraw() {
  return (
    <Frame>
      <div className="flex items-center justify-between text-sm"><span className="text-label">Withdraw</span><span className="font-mono font-bold tabular">50.00 USDC</span></div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm"><ArrowUpRight className="h-4 w-4" /><span className="font-mono">0x9f3c…41aa</span><span className="ml-auto inline-flex items-center gap-1 text-xs text-label"><Check className="h-3 w-3 text-neon" strokeWidth={3} /> Verified</span></div>
    </Frame>
  );
}

/* ───────────── Page ───────────── */

type Step = { title: string; body: React.ReactNode; pic: React.ReactNode };

function Steps({ steps, start = 1 }: { steps: Step[]; start?: number }) {
  return (
    <ol className="grid gap-10 md:gap-14">
      {steps.map((st, i) => (
        <li key={st.title} className="grid items-center gap-5 md:grid-cols-2 md:gap-12">
          <div className={cn(i % 2 === 1 && "md:order-2")}>
            <span className="font-mono text-sm tabular text-muted-foreground">{String(start + i).padStart(2, "0")}</span>
            <h2 className="mt-1 font-display text-2xl font-bold">{st.title}</h2>
            <p className="mt-2 max-w-md text-label">{st.body}</p>
          </div>
          <div className={cn("w-full max-w-sm justify-self-center", i % 2 === 1 && "md:order-1")}>{st.pic}</div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  usePageMeta("How it works", "Who settles results, how AI checks them, how payouts, disputes, top-ups and withdrawals work.");
  const { markets } = useStore();
  const st = ledgerStats(markets);

  const play: Step[] = [
    { title: "The creator asks", body: "A YES or NO question about the stream, with one rule for how it’s decided.", pic: <PicAsk /> },
    { title: "You pick a side", body: "Choose YES or NO and a stake. Your payout is an estimate until the question closes, then it locks.", pic: <PicPick /> },
    { title: "The creator or a mod settles", body: "When it’s decided on stream, they hold YES or NO. A clip of the moment is attached automatically.", pic: <PicSettle /> },
    { title: "AI double-checks", body: "Before anyone is paid, AI watches the clip and checks the result against the rule. If it doesn’t match, the payout is held for a person to review.", pic: <PicCheck /> },
    { title: "xp.live pays the winners", body: "Winners share the pool, less a 4% fee (3% platform, 1% creator). Usually in your wallet within minutes.", pic: <PicPaid /> },
    { title: "Think it’s wrong? Dispute it", body: "You have 2 hours after the result. Payouts on that question are held until a person decides.", pic: <PicDispute /> },
  ];
  const money: Step[] = [
    { title: "Add funds", body: "Card, Apple Pay or Google Pay. Circle converts it to USDC for you. Already hold USDC? Send it or connect a wallet.", pic: <PicFunds /> },
    { title: "Withdraw", body: "To a payout address you’ve verified. Minimum 5.00 USDC; a new address waits 72 hours.", pic: <PicWithdraw /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">How it works</h1>
        <p className="mt-3 text-lg text-label">Creators settle their own questions. AI double-checks every result before anyone is paid.</p>
        <p className="mt-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-foreground"><AiMarkIcon className="h-4 w-4" /> Checked by AI</span>
          <span><span className="font-mono tabular text-foreground">{fmt(st.settledThisWeek)}</span> results this week</span>
          <span>median <span className="font-mono tabular text-foreground">{st.medianPayoutMin} min</span> to payout</span>
        </p>
      </header>

      <section className="mt-14" aria-label="How a question plays out"><Steps steps={play} /></section>

      <h2 className="mt-20 border-t pt-10 font-display text-xl font-bold">Your money</h2>
      <section className="mt-8" aria-label="Your money"><Steps steps={money} start={7} /></section>

      <p className="mt-16 text-sm text-muted-foreground">Every recent result, with who settled it and the AI check, is on the <Link to="/markets" className="underline underline-offset-2 hover:text-foreground">Predictions</Link> page.</p>
    </div>
  );
}
