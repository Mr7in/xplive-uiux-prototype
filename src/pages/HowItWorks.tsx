import { Link } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { ledgerStats, DISPUTE_WINDOW_MIN } from "@/lib/ledger";
import { NETWORK } from "@/lib/chain";
import { fmt } from "@/lib/utils";

/**
 * "How payouts work". Written as the final page would read.
 * PLACEHOLDER: final copy approved for custody, withdrawals and the resolution model.
 */
export default function HowItWorks() {
  usePageMeta("How payouts work", "Who decides results, how evidence and disputes work, where your USDC sits and how withdrawals work.");
  const { markets } = useStore();
  const st = ledgerStats(markets);
  const sections: [string, React.ReactNode][] = [
    ["Who decides the result", <>The creator who asked the question posts the result, YES or NO, from their studio as soon as the moment happens on stream. Their name and the time are shown on every settled question. If a creator can’t settle within 60 minutes of closing, the question is voided and every stake goes back.</>],
    ["Evidence", <>A result can’t be posted without evidence: the creator marks the moment on stream and a frame or short clip is attached to the question. Anyone can open it from the result.</>],
    ["Disputes", <>If you think a result is wrong, dispute it within {DISPUTE_WINDOW_MIN / 60} hours of the result from your wallet. A 5.00 USDC bond is held and returned if you’re right. An xp.live admin reviews the stream recording and either upholds the result or corrects it; payouts on that question are held until then. Every creator’s disputes raised and upheld are public on their channel.</>],
    ["What you get back", <>Every stake on a question goes into one pool. When the result is in, the winning side shares the pool in proportion to their stakes, less a 4% fee (3% platform, 1% creator). The figure on your ticket is an estimate while the question is open and locks when it closes.</>],
    ["Where your funds sit", <>Your balance is USDC in your own xp.live wallet on {NETWORK.name}{NETWORK.testnet ? " (a test network: test USDC has no value)" : ""}. When you predict, your stake moves into the question’s pool contract; winnings move back to your wallet automatically, usually within minutes of the result. Every movement has a transaction you can check.</>],
    ["Withdrawals", <>Withdraw to a payout address you’ve verified by signing a message. The minimum is 5.00 USDC; amounts above 1,000.00 USDC are reviewed by a person first. A new payout address waits 72 hours before it can be used.</>],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="font-display text-4xl font-bold">How payouts work</h1>
      <p className="mt-3 text-lg text-label">Creators settle their own questions, with evidence, and anyone can challenge a result. In the last 7 days, <span className="font-mono tabular text-foreground">{fmt(st.settledThisWeek)}</span> questions were settled with a median of <span className="font-mono tabular text-foreground">{st.medianPayoutMin} min</span> from result to payout.</p>
      <div className="mt-8 divide-y border-y">
        {sections.map(([h, b]) => (
          <section key={h} className="grid gap-2 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-6">
            <h2 className="font-display text-lg font-semibold">{h}</h2>
            <p className="text-label">{b}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">See every recent result on the <Link to="/markets" className="underline underline-offset-2 hover:text-foreground">Predictions</Link> page.</p>
    </div>
  );
}
