/**
 * Derived figures. Everything that appears on more than one screen (track record, ledger,
 * hero proof line, winners, payout times) is computed here from the one mock dataset in
 * data/markets.ts + lib/store.tsx, so the numbers always agree.
 * PLACEHOLDER: aggregates computed by the backend from settled questions and payouts.
 */
import { pool, type Market } from "@/data/markets";

/** The moment the demo loaded. Seed data is stored as "minutes before load", so clock times stay fixed during a session. */
export const LOAD = Date.now();

/** Epoch ms for a seed value (minutes before load) or a live event (epoch ms). */
export const at = (minsAgo?: number, epoch?: number) => epoch ?? LOAD - (minsAgo ?? 0) * 60_000;

const two = (n: number) => String(n).padStart(2, "0");
export const clock = (t: number) => { const d = new Date(t); return `${two(d.getHours())}:${two(d.getMinutes())}`; };

/** "Today 21:31", "Yesterday 18:02", "Mon 14:10", "26 Oct" */
export function when(t: number) {
  const d = new Date(t);
  const today = new Date(LOAD); today.setHours(0, 0, 0, 0);
  const day = 86_400_000;
  if (t >= today.getTime()) return `Today ${clock(t)}`;
  if (t >= today.getTime() - day) return `Yesterday ${clock(t)}`;
  if (t >= today.getTime() - 6 * day) return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${clock(t)}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Minutes ago in words, for "closed 4 min ago". */
export function ago(t: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - t) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)} h ago`;
  return `${Math.floor(m / 1440)} d ago`;
}

export const closedAt = (m: Market) => at(m.closedMinsAgo, m.closedAt);
export const settledAt = (m: Market) => at(m.settledMinsAgo, m.settledAt);
export const paidAt = (m: Market) => (m.paidAt || m.paidMinsAgo !== undefined ? at(m.paidMinsAgo, m.paidAt) : undefined);

/** Predictors on each side, in proportion to the pools. */
export function sideCounts(m: Market) {
  const total = pool(m) || 1;
  const yes = Math.max(m.yesPool > 0 ? 1 : 0, Math.round((m.predictors * m.yesPool) / total));
  return { YES: yes, NO: Math.max(0, m.predictors - yes) };
}
export const winners = (m: Market) => (m.status === "settled" && m.outcome ? sideCounts(m)[m.outcome] : 0);
/** Total paid back to winners: the pool less the 4% fee. */
export const paidOut = (m: Market) => Math.round(pool(m) * 0.96 * 100) / 100;

/** Dispute window: 2 hours from the creator's result. */
export const DISPUTE_WINDOW_MIN = 120;
export function disputeLine(m: Market, now = Date.now()) {
  if (m.dispute) return { open: true, text: `Dispute under review · filed by ${m.dispute.by}. Payouts are held until an admin decides.` };
  const closes = settledAt(m) + DISPUTE_WINDOW_MIN * 60_000;
  const decided = m.disputeOutcome === "rejected" ? "1 dispute, rejected: the result stood" : m.disputeOutcome === "upheld" ? "1 dispute, upheld: the result was corrected" : "0 disputes";
  if (now < closes) return { open: true, text: `Open until ${clock(closes)} · ${decided}` };
  return { open: false, text: `Window closed · ${decided}` };
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const a = [...xs].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
};

export interface TrackRecord { resolved: number; voided: number; disputesRaised: number; disputesUpheld: number; medianCloseToPayout: number }
export function trackRecord(handle: string, markets: Market[]): TrackRecord {
  const mine = markets.filter((m) => m.handle === handle);
  const settled = mine.filter((m) => m.status === "settled");
  const voided = mine.filter((m) => m.status === "voided");
  const disputesRaised = settled.filter((m) => m.dispute || m.disputeOutcome).length;
  const disputesUpheld = settled.filter((m) => m.disputeOutcome === "upheld").length;
  const times = settled.filter((m) => paidAt(m)).map((m) => (paidAt(m)! - closedAt(m)) / 60_000);
  return { resolved: settled.length + voided.length, voided: voided.length, disputesRaised, disputesUpheld, medianCloseToPayout: Math.round(median(times)) };
}

export function ledgerStats(markets: Market[], now = Date.now()) {
  const settled = markets.filter((m) => m.status === "settled");
  const week = settled.filter((m) => now - settledAt(m) <= 7 * 86_400_000);
  const paid = settled.filter((m) => paidAt(m));
  const paid24 = paid.filter((m) => now - paidAt(m)! <= 86_400_000);
  return {
    settledThisWeek: week.length,
    winnersPaid24h: paid24.reduce((a, m) => a + winners(m), 0),
    paidThisWeek: week.filter((m) => paidAt(m)).reduce((a, m) => a + paidOut(m), 0),
    /** Minutes from the creator's result to winnings in wallets. */
    medianPayoutMin: Math.max(1, Math.round(median(paid.map((m) => (paidAt(m)! - settledAt(m)) / 60_000)))),
    disputesThisWeek: week.filter((m) => m.dispute || m.disputeOutcome).length,
  };
}

/** What a stream card says about the channel's questions. PLACEHOLDER: creator question lifecycle from the backend. */
export type ChannelState = { kind: "open"; m: Market } | { kind: "soon" } | { kind: "none" };
export function channelState(handle: string, markets: Market[], now = Date.now()): ChannelState {
  const mine = markets.filter((m) => m.handle === handle);
  const open = mine.find((m) => m.status === "open");
  if (open) return { kind: "open", m: open };
  const recent = mine.some((m) => m.status !== "open" && now - closedAt(m) <= 30 * 60_000);
  return recent ? { kind: "soon" } : { kind: "none" };
}

/** Mock block number for a transaction time (Amoy produces a block about every 2 s). */
export const blockAt = (t: number) => 14_820_000 + Math.floor((t - LOAD) / 2000) + 9_000;
