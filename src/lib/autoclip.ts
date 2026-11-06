/**
 * Auto-clipper (mock). When a creator settles a question, xp.live cuts the evidence clip itself:
 * it scans the stream from the moment the question opened to the creator's tap, finds the moment
 * and attaches a clip around it to the result. The creator only says YES or NO.
 *
 * The clip length and the wait both scale with how long the question was opened for:
 * a longer question means more stream to scan and a longer lead-up worth showing.
 *
 * PLACEHOLDER: auto-clipper service (stream VOD/DVR segment scan, moment detection, clip render,
 * upload to the media CDN). Wait times here are demo timings, not measured ones.
 */
import type { EvidenceClip, Market } from "@/data/markets";
import { streamerByHandle } from "@/data/streamers";
import { LOAD, closedAt } from "@/lib/ledger";

export interface ClipPlan {
  /** Question length the plan was picked for, in seconds. */
  durationSec: number;
  /** Clip length in seconds. */
  clipSec: number;
  /** How long the creator waits while the clip is made (demo), in ms. */
  waitMs: number;
}

/** Tiers line up with the companion's 1 / 2 / 5 / 10 min durations. */
const TIERS: { upTo: number; clipSec: number; waitMs: number }[] = [
  { upTo: 60, clipSec: 30, waitMs: 6_000 },
  { upTo: 120, clipSec: 45, waitMs: 9_000 },
  { upTo: 300, clipSec: 90, waitMs: 14_000 },
  { upTo: 600, clipSec: 120, waitMs: 20_000 },
  { upTo: Infinity, clipSec: 180, waitMs: 28_000 },
];

/** How long a question was opened for. Seed questions have no stored length, so it is estimated. */
export function marketDuration(m: Market): number {
  if (m.durationSec) return m.durationSec;
  if (m.status === "open" && m.secondsLeft) return [60, 120, 300, 600].find((d) => d >= m.secondsLeft!) ?? Math.ceil(m.secondsLeft / 60) * 60;
  return 120;
}

export function clipPlan(m: Market): ClipPlan {
  const durationSec = marketDuration(m);
  const t = TIERS.find((x) => durationSec <= x.upTo)!;
  return { durationSec, clipSec: t.clipSec, waitMs: t.waitMs };
}

export const durLabel = (sec: number) => (sec < 60 ? `${sec} s` : sec % 60 ? `${Math.floor(sec / 60)} min ${sec % 60} s` : `${sec / 60} min`);

const two = (n: number) => String(n).padStart(2, "0");
export const hms = (sec: number) => { const s = Math.max(0, Math.floor(sec)); return `${Math.floor(s / 3600)}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`; };

/** Builds the clip for a settle tap at `tapAt`. Deterministic per market so a re-render shows the same result. */
export function buildClip(m: Market, tapAt = Date.now()): EvidenceClip {
  const s = streamerByHandle(m.handle);
  const streamStart = LOAD - (s?.startedMinsAgo ?? 0) * 60_000;
  const plan = clipPlan(m);
  const closed = closedAt(m);
  const opened = m.openedAt ?? closed - plan.durationSec * 1000;
  // The moment usually lands after predictions close (rules say "the next spin after this closes").
  // PLACEHOLDER: the detected moment comes from the clipper's event detection.
  const seed = [...m.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const after = Math.max(0, tapAt - closed);
  const moment = after > 4_000 ? closed + after * (0.45 + (seed % 30) / 100) : tapAt - 2_000;
  let start = moment - plan.clipSec * 600;
  let end = start + plan.clipSec * 1000;
  if (end > tapAt) { end = tapAt; start = end - plan.clipSec * 1000; }
  const t = (ms: number) => hms((ms - streamStart) / 1000);
  return { moment: t(moment), start: t(start), end: t(end), sec: plan.clipSec, scannedFrom: t(opened), scannedTo: t(tapAt) };
}
