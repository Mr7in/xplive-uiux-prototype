import * as React from "react";
import { markets as seedMarkets, type Market, type Side, multiplier } from "@/data/markets";
import { depositAddressFor, mockHex } from "@/lib/chain";
import { seedPresets, type Preset } from "@/data/companion";

export type Role = "viewer" | "creator" | "admin";

export interface Account {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: Role;
  /** For creators: the channel they own. */
  channel?: string;
}

/** Funding/ledger transfers: pending until the chain confirms them. */
export type TxState = "pending" | "confirmed" | "failed";
/**
 * A prediction steps through Submitting > Recorded > Confirmed on Polygon.
 * PLACEHOLDER: transaction submission and chain confirmation events.
 */
export type PosState = "submitting" | "recorded" | "confirmed" | "failed";

export interface Position {
  id: string;
  marketId: string;
  side: Side;
  amount: number; // USDC
  placedMinsAgo: number;
  /** Epoch ms when placed during this session. */
  placedAt?: number;
  tx: PosState;
  txHash: string;
}

export type WalletProvider = "MetaMask" | "Coinbase Wallet" | "WalletConnect" | "Rabby";
export interface ConnectedWallet { provider: WalletProvider; address: string; balance: number }

export interface Transfer {
  id: string;
  kind: "deposit" | "withdrawal" | "faucet" | "tip" | "prediction" | "payout" | "refund";
  label: string;
  amount: number; // signed, USDC
  state: TxState;
  confirmations?: number;
  txHash: string;
  /** Minutes before load (seed) or epoch ms (live). Display via ledger.when(). */
  minsAgo?: number;
  at?: number;
  /** Market this transfer belongs to, if any. */
  marketId?: string;
}

export interface PayoutAddress { address: string; verified: boolean; addedMinsAgo: number }

/**
 * Mock accounts used by the front end until the auth API is wired up.
 * Replace `signIn` with the real session call; nothing else depends on these objects' shape beyond `Account`.
 */
export const accounts: Account[] = [
  { id: "u-viewer", email: "test.viewer@xplive.com", name: "Test Viewer", handle: "testviewer", role: "viewer" },
  { id: "u-streamer", email: "test.streamer@xplive.com", name: "Nordic Slots God", handle: "nordic-slots-god", role: "creator", channel: "nordic-slots-god" },
  { id: "u-marble", email: "test.marble@xplive.com", name: "Marble Rally", handle: "marblerally", role: "creator", channel: "marblerally" },
  { id: "u-admin", email: "test.admin@xplive.com", name: "Test Admin", handle: "testadmin", role: "admin" },
];

const seedFollows: Record<string, string[]> = {
  "u-viewer": ["marblerally", "kovac", "mirelasun", "nordic-slots-god", "sophie-carter", "hannaplays", "terracetom", "alice", "olivia-bennett", "yukimori"],
  "u-streamer": ["reelrita", "marcus-reed", "liftoffleo", "spindoctor", "olivia-bennett"],
  "u-admin": ["marblerally", "kovac"],
};

const h = (s: string) => mockHex(s);
const byId = (id: string) => seedMarkets.find((m) => m.id === id)!;

/** The test viewer's predictions. PLACEHOLDER: positions from the platform API. */
const seedPositions: Position[] = (
  [
    // open
    ["p1", "m-1001", "YES", 10, 2],
    ["p2", "m-1003", "NO", 5, 1],
    // closed, waiting for the creator
    ["p3", "m-1011", "NO", 5, 6],
    ["p4", "m-1014", "YES", 10, 29],
    // settled today
    ["p5", "m-1016", "YES", 15, 196],
    ["p6", "m-1017", "YES", 20, 266],
    ["p12", "m-1019", "NO", 6, 99],
    ["p14", "m-0904", "YES", 10, 67],
    ["p15", "m-0901", "YES", 5, 44],
    ["p17", "m-0907", "YES", 5, 115],
    ["p16", "m-0910", "YES", 8, 61],
    // earlier
    ["p7", "m-1024", "YES", 7.5, 1_390],
    ["p9", "m-1018", "YES", 2.5, 1_446],
    ["p18", "m-0925", "YES", 10, 1_545],
    ["p13", "m-1021", "YES", 10, 1_626, "failed"],
    ["p10", "m-1026", "YES", 4, 3_006],
    ["p8", "m-1025", "NO", 5, 5_766],
    ["p11", "m-1029", "NO", 5, 10_086],
  ] as [string, string, Side, number, number, PosState?][]
).map(([id, marketId, side, amount, placedMinsAgo, tx]) => ({ id, marketId, side, amount, placedMinsAgo, tx: tx ?? "confirmed", txHash: h(id) }));

/** Back to you on a settled market: stake × the multiplier the pools locked at close. */
export const backToYou = (m: Market, p: Pick<Position, "side" | "amount">) => Math.round(p.amount * multiplier(m, p.side) * 100) / 100;

/**
 * Wallet ledger, derived from the positions above plus funding events, so the balance,
 * the wallet tables and every "back to you" figure come from one source.
 * PLACEHOLDER: wallet ledger from the chain / custodial ledger.
 */
function buildLedger(positions: Position[]): Transfer[] {
  const out: Transfer[] = [];
  for (const p of positions) {
    const m = byId(p.marketId);
    if (p.tx === "failed") continue;
    out.push({ id: "t-" + p.id, kind: "prediction", label: `Prediction · ${m.question}`, amount: -p.amount, state: "confirmed", txHash: p.txHash, minsAgo: p.placedMinsAgo, marketId: m.id });
    if (m.status === "settled" && !m.dispute && m.outcome === p.side && m.paidMinsAgo !== undefined)
      out.push({ id: "w-" + p.id, kind: "payout", label: `Back to you · ${m.question}`, amount: backToYou(m, p), state: "confirmed", txHash: h("w-" + p.id), minsAgo: m.paidMinsAgo, marketId: m.id });
    if (m.status === "voided")
      out.push({ id: "r-" + p.id, kind: "refund", label: `Refund · ${m.question} (voided)`, amount: p.amount, state: "confirmed", txHash: h("r-" + p.id), minsAgo: (m.closedMinsAgo ?? 0) - 12, marketId: m.id });
  }
  out.push(
    { id: "tip1", kind: "tip", label: "Tip to Marble Rally", amount: -5, state: "confirmed", txHash: h("tip1"), minsAgo: 26 },
    { id: "d1", kind: "deposit", label: "Deposit from 0x9f3c…41aa", amount: 40, state: "confirmed", confirmations: 12, txHash: h("d1"), minsAgo: 1_700 },
    { id: "f1", kind: "faucet", label: "Test USDC from the Amoy faucet", amount: 10, state: "confirmed", txHash: h("f1"), minsAgo: 12_900 },
  );
  // The first deposit is whatever makes the opening balance 82.00 USDC.
  const rest = out.reduce((a, t) => a + t.amount, 0);
  out.push({ id: "d0", kind: "deposit", label: "Deposit from 0x9f3c…41aa", amount: Math.round((OPENING_BALANCE - rest) * 100) / 100, state: "confirmed", confirmations: 12, txHash: h("d0"), minsAgo: 13_000 });
  return out.sort((x, y) => (x.minsAgo ?? 0) - (y.minsAgo ?? 0));
}
const OPENING_BALANCE = 82;
const seedTransfers = buildLedger(seedPositions);

interface State {
  user: Account | null;
  balance: number; // USDC available in the user's xp.live wallet
  markets: Market[];
  positions: Position[];
  follows: Record<string, string[]>;
  wallet: ConnectedWallet | null;
  transfers: Transfer[];
  payoutAddress: PayoutAddress | null;
  faucetClaimedToday: boolean;
  /** Saved quick questions per channel, shown in the companion app. */
  presets: Record<string, Preset[]>;
}

/**
 * Creator question actions are mirrored to every open tab of the prototype (BroadcastChannel),
 * so Studio in one window and the companion app in another stay in step.
 * PLACEHOLDER: realtime channel (WebSocket / SSE) from the platform API.
 */
type SyncMsg =
  | { a: "create"; m: Market }
  | { a: "close"; id: string; at: number }
  | { a: "extend"; id: string; sec: number }
  | { a: "propose"; id: string; result: Side | "VOID"; note: string; at: number }
  | { a: "presets"; handle: string; list: Preset[] };

function reduceSync(s: State, msg: SyncMsg): State {
  switch (msg.a) {
    case "create":
      return s.markets.some((m) => m.id === msg.m.id) ? s : { ...s, markets: [msg.m, ...s.markets] };
    case "close":
      return { ...s, markets: s.markets.map((m) => (m.id === msg.id && m.status === "open" ? { ...m, status: "awaiting", secondsLeft: 0, closedMinsAgo: 0, closedAt: msg.at } : m)) };
    case "extend":
      return { ...s, markets: s.markets.map((m) => (m.id === msg.id && m.status === "open" ? { ...m, secondsLeft: (m.secondsLeft ?? 0) + msg.sec } : m)) };
    case "presets":
      return { ...s, presets: { ...s.presets, [msg.handle]: msg.list } };
    case "propose": {
      const { id, result, note, at } = msg;
      if (!s.markets.some((m) => m.id === id && m.status === "awaiting")) return s;
      const markets = s.markets.map((m) =>
        m.id !== id ? m : result === "VOID" ? { ...m, status: "voided" as const, voidReason: note || "Voided by the creator.", settledAt: at } : { ...m, status: "settled" as const, outcome: result, settledMinsAgo: 0, settledAt: at, paidMinsAgo: 0, paidAt: at + 120_000, evidence: note }
      );
      const target = markets.find((m) => m.id === id)!;
      let credit = 0;
      s.positions.filter((p) => p.marketId === id && p.tx === "confirmed").forEach((p) => {
        if (result === "VOID") credit += p.amount;
        else if (p.side === result) credit += backToYou(target, p);
      });
      return { ...s, markets, balance: Math.round((s.balance + credit) * 100) / 100 };
    }
  }
}

interface Store extends State {
  depositAddress: string;
  signIn: (email: string) => Account | null;
  signOut: () => void;
  isFollowing: (handle: string) => boolean;
  toggleFollow: (handle: string) => void;
  predict: (marketId: string, side: Side, amount: number) => string;
  tip: (handle: string, amount: number) => void;
  createMarket: (handle: string, question: string, rule: string, seconds: number) => Market;
  savePresets: (handle: string, list: Preset[]) => void;
  closeMarket: (marketId: string) => void;
  extendMarket: (marketId: string, seconds: number) => void;
  proposeResult: (marketId: string, result: Side | "VOID", note: string) => void;
  adminDecide: (marketId: string, decision: Side | "VOID", note: string) => void;
  connectWallet: (provider: WalletProvider) => Promise<ConnectedWallet>;
  disconnectWallet: () => void;
  depositFromWallet: (amount: number) => string;
  reportManualDeposit: () => string;
  claimFaucet: () => void;
  withdraw: (amount: number) => string;
  setPayoutAddress: (address: string) => void;
  verifyPayoutAddress: () => void;
}

const StoreContext = React.createContext<Store | null>(null);
const SESSION_KEY = "xplive.session";

function readSession(): Account | null {
  try {
    const email = window.localStorage.getItem(SESSION_KEY);
    return accounts.find((a) => a.email === email) ?? null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => ({
    user: readSession(),
    balance: Math.round(seedTransfers.reduce((a, t) => a + (t.state === "confirmed" ? t.amount : 0), 0) * 100) / 100,
    markets: seedMarkets.map((m) => ({ ...m })),
    positions: seedPositions,
    follows: seedFollows,
    wallet: null,
    transfers: seedTransfers,
    payoutAddress: null,
    faucetClaimedToday: false,
    presets: seedPresets,
  }));

  // Cross-tab sync of creator question actions (see SyncMsg).
  const chan = React.useRef<BroadcastChannel | null>(null);
  React.useEffect(() => {
    let c: BroadcastChannel | null = null;
    try { c = new BroadcastChannel("xplive.sync"); } catch { return; }
    c.onmessage = (e: MessageEvent<SyncMsg>) => setState((s) => reduceSync(s, e.data));
    chan.current = c;
    return () => { c?.close(); chan.current = null; };
  }, []);
  const sync = React.useCallback((msg: SyncMsg) => {
    setState((s) => reduceSync(s, msg));
    try { chan.current?.postMessage(msg); } catch { /* channel closed */ }
  }, []);

  // Countdown: open questions tick down and close themselves. Other viewers keep joining, so pools
  // and payout estimates move while a ticket is open. PLACEHOLDER: pool pricing engine updates.
  React.useEffect(() => {
    let tick = 0;
    const t = window.setInterval(() => {
      tick += 1;
      setState((s) => {
        const now = Date.now();
        const live = s.markets.filter((m) => m.status === "open");
        const joiner = tick % 3 === 0 && live.length ? live[(tick * 7) % live.length] : undefined;
        const stake = joiner ? [2, 5, 1, 10, 3, 5, 25, 2.5][tick % 8] : 0;
        const toYes = (tick * 13) % 5 < 2;
        let markets = s.markets.map((m) => {
          if (m.status !== "open" || m.secondsLeft === undefined) return m;
          const left = m.secondsLeft - 1;
          let next: Market = left <= 0 ? { ...m, secondsLeft: 0, status: "awaiting", closedMinsAgo: 0, closedAt: now } : { ...m, secondsLeft: left };
          if (joiner && m.id === joiner.id && left > 0) next = { ...next, yesPool: next.yesPool + (toYes ? stake : 0), noPool: next.noPool + (toYes ? 0 : stake), predictors: next.predictors + 1 };
          return next;
        });
        // Mock creator resolution: a question that closed during the demo is resolved by its creator
        // 40 s later and paid 5 s after that, so a tester can follow one prediction end to end.
        // PLACEHOLDER: creator resolution flow + settlement contract.
        let balance = s.balance;
        let transfers = s.transfers;
        markets = markets.map((m) => {
          if (m.status === "awaiting" && m.closedAt && m.script && now - m.closedAt > 40_000 && s.user?.channel !== m.handle)
            return { ...m, status: "settled" as const, outcome: m.script.outcome, evidence: m.script.evidence, clipAt: m.script.clipAt, settledMinsAgo: 0, settledAt: now };
          if (m.status === "settled" && m.settledAt && !m.paidAt && now - m.settledAt > 5_000) {
            const wins = s.positions.filter((p) => p.marketId === m.id && p.tx === "confirmed" && p.side === m.outcome);
            for (const p of wins) {
              const back = backToYou(m, p);
              balance = Math.round((balance + back) * 100) / 100;
              transfers = [{ id: "w-" + p.id, kind: "payout", label: `Back to you · ${m.question}`, amount: back, state: "confirmed", txHash: mockHex("w-" + p.id), at: now, marketId: m.id }, ...transfers];
            }
            return { ...m, paidMinsAgo: 0, paidAt: now };
          }
          return m;
        });
        return { ...s, markets, balance, transfers };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  /** Simulates block confirmations for a pending transfer, then runs `done`. */
  const confirm = React.useCallback((id: string, steps: number, done?: (s: State) => Partial<State>) => {
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setState((s) => {
        const transfers = s.transfers.map((x) => (x.id === id ? { ...x, confirmations: Math.min(steps, n), state: n >= steps ? ("confirmed" as const) : x.state } : x));
        const base = { ...s, transfers };
        return n >= steps && done ? { ...base, ...done(base) } : base;
      });
      if (n >= steps) window.clearInterval(t);
    }, 450);
  }, []);

  const store: Store = React.useMemo(() => {
    const uid = state.user?.id ?? "";
    return {
      ...state,
      depositAddress: depositAddressFor(uid || "guest"),
      signIn: (email) => {
        const acc = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
        if (acc) {
          try { window.localStorage.setItem(SESSION_KEY, acc.email); } catch { /* storage unavailable */ }
          setState((s) => ({ ...s, user: acc }));
        }
        return acc;
      },
      signOut: () => {
        try { window.localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
        setState((s) => ({ ...s, user: null, wallet: null }));
      },
      isFollowing: (hd) => (state.follows[uid] ?? []).includes(hd),
      toggleFollow: (hd) =>
        setState((s) => {
          const list = s.follows[uid] ?? [];
          return { ...s, follows: { ...s.follows, [uid]: list.includes(hd) ? list.filter((x) => x !== hd) : [hd, ...list] } };
        }),
      predict: (marketId, side, amount) => {
        const id = `p${Date.now()}`;
        const hash = mockHex(id);
        const market = state.markets.find((m) => m.id === marketId);
        const placedAt = Date.now();
        setState((s) => ({
          ...s,
          balance: Math.round((s.balance - amount) * 100) / 100,
          positions: [{ id, marketId, side, amount, placedMinsAgo: 0, placedAt, tx: "submitting", txHash: hash }, ...s.positions],
          transfers: [{ id: "t-" + id, kind: "prediction", label: `Prediction · ${market?.question ?? ""}`, amount: -amount, state: "pending", confirmations: 0, txHash: hash, at: placedAt, marketId }, ...s.transfers],
        }));
        const step = (tx: PosState) => setState((s) => ({ ...s, positions: s.positions.map((p) => (p.id === id ? { ...p, tx } : p)) }));
        window.setTimeout(() => step("recorded"), 900);
        // Confirmed on chain: the stake joins the pool.
        window.setTimeout(() => {
          setState((s) => ({
            ...s,
            positions: s.positions.map((p) => (p.id === id ? { ...p, tx: "confirmed" } : p)),
            transfers: s.transfers.map((t) => (t.id === "t-" + id ? { ...t, state: "confirmed", confirmations: 1 } : t)),
            markets: s.markets.map((m) =>
              m.id !== marketId ? m : { ...m, yesPool: m.yesPool + (side === "YES" ? amount : 0), noPool: m.noPool + (side === "NO" ? amount : 0), predictors: m.predictors + 1 }
            ),
          }));
        }, 2600);
        return hash;
      },
      tip: (handle, amount) =>
        setState((s) => ({
          ...s,
          balance: s.balance - amount,
          transfers: [{ id: `tip${Date.now()}`, kind: "tip", label: `Tip to ${handle}`, amount: -amount, state: "confirmed", txHash: mockHex("tip" + Date.now()), at: Date.now() }, ...s.transfers],
        })),
      createMarket: (handle, question, rule, seconds) => {
        const m: Market = { id: `m-${Date.now()}`, handle, question, rule, status: "open", yesPool: 0, noPool: 0, predictors: 0, secondsLeft: seconds };
        sync({ a: "create", m });
        return m;
      },
      savePresets: (handle, list) => sync({ a: "presets", handle, list }),
      closeMarket: (id) => sync({ a: "close", id, at: Date.now() }),
      extendMarket: (id, sec) => sync({ a: "extend", id, sec }),
      proposeResult: (id, result, note) => sync({ a: "propose", id, result, note, at: Date.now() }),
      adminDecide: (id, decision, note) =>
        setState((s) => ({
          ...s,
          markets: s.markets.map((m) =>
            m.id !== id ? m : decision === "VOID" ? { ...m, status: "voided", voidReason: note, dispute: undefined } : { ...m, status: "settled", outcome: decision, evidence: note, dispute: undefined }
          ),
        })),
      connectWallet: (provider) =>
        new Promise((resolve) => {
          window.setTimeout(() => {
            const w: ConnectedWallet = { provider, address: mockHex("wallet:" + provider + uid, 40), balance: 245.5 };
            setState((s) => ({ ...s, wallet: w }));
            resolve(w);
          }, 900);
        }),
      disconnectWallet: () => setState((s) => ({ ...s, wallet: null })),
      depositFromWallet: (amount) => {
        const id = `dep${Date.now()}`;
        const hash = mockHex(id);
        setState((s) => ({
          ...s,
          wallet: s.wallet ? { ...s.wallet, balance: s.wallet.balance - amount } : s.wallet,
          transfers: [{ id, kind: "deposit", label: `Deposit from ${s.wallet ? s.wallet.address.slice(0, 6) + "…" + s.wallet.address.slice(-4) : "wallet"}`, amount, state: "pending", confirmations: 0, txHash: hash, at: Date.now() }, ...s.transfers],
        }));
        confirm(id, 12, (s) => ({ balance: Math.round((s.balance + amount) * 100) / 100 }));
        return hash;
      },
      reportManualDeposit: () => {
        const id = `dep${Date.now()}`;
        const hash = mockHex(id);
        const amount = 25;
        setState((s) => ({ ...s, transfers: [{ id, kind: "deposit", label: "Deposit from 0x5e1d…9c07", amount, state: "pending", confirmations: 0, txHash: hash, at: Date.now() }, ...s.transfers] }));
        confirm(id, 12, (s) => ({ balance: Math.round((s.balance + amount) * 100) / 100 }));
        return hash;
      },
      claimFaucet: () => {
        const id = `fau${Date.now()}`;
        setState((s) => ({ ...s, faucetClaimedToday: true, transfers: [{ id, kind: "faucet", label: "Test USDC from the Amoy faucet", amount: 10, state: "pending", confirmations: 0, txHash: mockHex(id), at: Date.now() }, ...s.transfers] }));
        confirm(id, 3, (s) => ({ balance: Math.round((s.balance + 10) * 100) / 100 }));
      },
      withdraw: (amount) => {
        const id = `wd${Date.now()}`;
        const hash = mockHex(id);
        setState((s) => ({
          ...s,
          balance: Math.round((s.balance - amount) * 100) / 100,
          transfers: [{ id, kind: "withdrawal", label: `Withdrawal to ${s.payoutAddress ? s.payoutAddress.address.slice(0, 6) + "…" + s.payoutAddress.address.slice(-4) : "payout address"}`, amount: -amount, state: "pending", confirmations: 0, txHash: hash, at: Date.now() }, ...s.transfers],
        }));
        confirm(id, 6);
        return hash;
      },
      setPayoutAddress: (address) => setState((s) => ({ ...s, payoutAddress: { address, verified: false, addedMinsAgo: 0 } })),
      verifyPayoutAddress: () => setState((s) => ({ ...s, payoutAddress: s.payoutAddress ? { ...s.payoutAddress, verified: true } : null })),
    };
  }, [state, confirm, sync]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = React.useContext(StoreContext);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export const useMarket = (id?: string) => useStore().markets.find((m) => m.id === id);
export const useChannelMarkets = (handle?: string) => useStore().markets.filter((m) => m.handle === handle);
