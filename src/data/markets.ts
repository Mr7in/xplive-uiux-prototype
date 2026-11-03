export type MarketStatus = "open" | "awaiting" | "settled" | "voided";
export type Side = "YES" | "NO";

export interface Market {
  id: string;
  handle: string; // streamer handle
  question: string;
  /** How the result is decided, shown to viewers before they predict. */
  rule: string;
  status: MarketStatus;
  yesPool: number; // USDC
  noPool: number; // USDC
  predictors: number;
  /** open: seconds until participation closes */
  secondsLeft?: number;
  /** minutes since the question closed (awaiting, settled, voided) */
  closedMinsAgo?: number;
  outcome?: Side;
  settledMinsAgo?: number;
  voidReason?: string;
  evidence?: string;
  /** Stream timestamp of the evidence frame / clip (from that channel's footage). PLACEHOLDER: evidence capture from the stream. */
  clipAt?: string;
  /** Minutes since winnings landed in wallets (settled only). PLACEHOLDER: payout events from the settlement contract. */
  paidMinsAgo?: number;
  /** A dispute that has been decided: rejected (result stood) or upheld (result corrected). */
  disputeOutcome?: "rejected" | "upheld";
  /** Epoch ms for events that happen during the demo session (seed data uses the *MinsAgo fields). */
  closedAt?: number;
  settledAt?: number;
  paidAt?: number;
  /** Mock only: how an open question resolves if it closes during the demo, so the whole loop can be tested. */
  script?: { outcome: Side; evidence: string; clipAt: string };
  dispute?: { by: string; side: Side; stake: number; // USDC
    statement: string; filedMinsAgo: number };
}

const current: Market[] = [
  // ── Open: voting is active (10) ──────────────────────────────────────────
  { id: "m-1001", handle: "marblerally", question: "Will the red marble win heat 3?", rule: "Settles on the official finish of heat 3 as shown on stream.", status: "open", yesPool: 571, noPool: 350, predictors: 214, secondsLeft: 102 , script: { outcome: "YES", evidence: "Red marble first through the finish gate in heat 3", clipAt: "1:58:20" } },
  { id: "m-1002", handle: "kovac", question: "Will Kovac win the next clutch round?", rule: "Next round where Kovac is the last player alive on his team. Win = his team takes the round.", status: "open", yesPool: 1244, noPool: 1560, predictors: 902, secondsLeft: 318 , script: { outcome: "NO", evidence: "Last alive 1v2 on Mirage B site, round lost", clipAt: "2:24:05" } },
  { id: "m-1003", handle: "mirelasun", question: "Will Mirela's team get first blood this game?", rule: "Settles on the in-game first blood announcement.", status: "open", yesPool: 2005, noPool: 1132.50, predictors: 1_311, secondsLeft: 74 , script: { outcome: "YES", evidence: "First blood on bot lane at 3:12 game time", clipAt: "1:12:47" } },
  { id: "m-1004", handle: "renoblitz", question: "Will Reno take the Victory Royale this match?", rule: "Settles when the match ends on stream. Top 1 only.", status: "open", yesPool: 915, noPool: 2620, predictors: 1_884, secondsLeft: 540 , script: { outcome: "NO", evidence: "Eliminated in 4th place, end-of-match screen", clipAt: "0:51:33" } },
  { id: "m-1005", handle: "diegoferraz", question: "Will Diego pack a 90+ rated player in the next pack?", rule: "Next pack opened on stream after this question closes.", status: "open", yesPool: 306, noPool: 493.50, predictors: 388, secondsLeft: 211 , script: { outcome: "NO", evidence: "Best pull an 87 rated midfielder", clipAt: "1:30:12" } },
  { id: "m-1006", handle: "vinnymoretti", question: "Will the crew escape with the vault cash?", rule: "Settles when the heist ends: crew back at the safehouse with the cash.", status: "open", yesPool: 1670, noPool: 1405, predictors: 1_206, secondsLeft: 1_260 , script: { outcome: "YES", evidence: "Crew back at the safehouse with the cash", clipAt: "3:05:40" } },
  { id: "m-1007", handle: "marcus-reed", question: "Will the dealer bust on the next hand?", rule: "Next hand dealt after this question closes.", status: "open", yesPool: 70.50, noPool: 143, predictors: 71, secondsLeft: 476 , script: { outcome: "NO", evidence: "Dealer stood on 19", clipAt: "0:42:18" } },
  { id: "m-1008", handle: "ironines", question: "Will Ines finish 100 push-ups inside 5 minutes?", rule: "Timer on screen. Reps judged by the on-screen counter.", status: "open", yesPool: 297, noPool: 105, predictors: 247, secondsLeft: 38 , script: { outcome: "YES", evidence: "100th rep at 4:41 on the on-screen timer", clipAt: "0:24:09" } },
  { id: "m-1009", handle: "hannaplays", question: "Will Hanna finish top 3 in tonight's titled arena?", rule: "Settles on the final arena standings shown on stream.", status: "open", yesPool: 361, noPool: 224, predictors: 302, secondsLeft: 2_400 , script: { outcome: "YES", evidence: "Finished 2nd in the arena standings", clipAt: "2:41:55" } },
  { id: "m-1010", handle: "liftoffleo", question: "Will Leo finish the chat-genre track in under 10 minutes?", rule: "Timer on screen from the first loop. Track ends when Leo says “done”.", status: "open", yesPool: 115.50, noPool: 304.50, predictors: 159, secondsLeft: 145 , script: { outcome: "NO", evidence: "Track finished at 11:26 on the timer", clipAt: "1:44:30" } },

  // ── Awaiting result: closed, creator has not proposed the outcome yet (5) ──
  { id: "m-1011", handle: "nordic-slots-god", question: "Will the next bonus buy pay over 100×?", rule: "Next bonus buy on stream after this question closes. Multiplier as shown by the game.", status: "awaiting", yesPool: 522.50, noPool: 335, predictors: 233, closedMinsAgo: 4 },
  { id: "m-1012", handle: "ashokafor", question: "Will Ash win this ranked match?", rule: "Settles on the end-of-match screen.", status: "awaiting", yesPool: 1065, noPool: 645, predictors: 744, closedMinsAgo: 9 },
  { id: "m-1013", handle: "novadrift", question: "Will Nova reach Grand Champion tonight?", rule: "Rank shown in the in-game profile before the stream ends.", status: "awaiting", yesPool: 244, noPool: 365.50, predictors: 296, closedMinsAgo: 18 },
  { id: "m-1014", handle: "terracetom", question: "Will there be a goal before half-time?", rule: "Official match clock. Stoppage time counts.", status: "awaiting", yesPool: 735, noPool: 457.50, predictors: 611, closedMinsAgo: 26 },
  { id: "m-1015", handle: "rasmuswalks", question: "Will Rasmus find an open café before 01:00?", rule: "Café must be open and serving, shown on camera.", status: "awaiting", yesPool: 102, noPool: 169, predictors: 132, closedMinsAgo: 41 },

  // ── Settled (10) ──────────────────────────────────────────────────────────
  { id: "m-1016", handle: "yukimori", question: "Will Yuki beat the Ender Dragon in under 20 minutes?", rule: "In-game timer at the credits.", status: "settled", outcome: "YES", yesPool: 490, noPool: 320, predictors: 421, closedMinsAgo: 190, settledMinsAgo: 172, evidence: "Credits at 17:44 IGT.", clipAt: "1:52:10", paidMinsAgo: 169 },
  { id: "m-1017", handle: "olivia-bennett", question: "Will Olivia make the final table?", rule: "Final table = last 9 players in the tournament.", status: "settled", outcome: "NO", yesPool: 644, noPool: 277, predictors: 142, closedMinsAgo: 260, settledMinsAgo: 214, evidence: "Busted in 11th place, hand at 3:42:10.", dispute: { by: "tallinn_tom", side: "YES", stake: 25, statement: "She was moved to the final table before the bust. The hand at 3:42 was played at the final table.", filedMinsAgo: 120 } , clipAt: "3:42:10"},
  { id: "m-1018", handle: "rubylane", question: "Will Ruby’s squad win this ranked match?", rule: "Settles on the match summary screen. Champion = win.", status: "settled", outcome: "NO", yesPool: 155, noPool: 238, predictors: 188, closedMinsAgo: 1_440, settledMinsAgo: 1_436, evidence: "Placed 4th, match summary at 2:11:40.", clipAt: "2:11:40", paidMinsAgo: 1434 },
  { id: "m-1019", handle: "tobilane", question: "Will Tobi win his promo game?", rule: "Settles on the end-of-game screen.", status: "settled", outcome: "YES", yesPool: 411, noPool: 395, predictors: 377, closedMinsAgo: 95, settledMinsAgo: 58, evidence: "Victory screen at 1:41:05.", clipAt: "1:41:05", paidMinsAgo: 54 },
  { id: "m-1020", handle: "pixiehart", question: "Will Pixie and her brother finish top 3?", rule: "Placement on the match end screen.", status: "settled", outcome: "NO", yesPool: 215, noPool: 197.50, predictors: 209, closedMinsAgo: 2_880, settledMinsAgo: 2_861, evidence: "Placed 7th.", clipAt: "0:58:22", paidMinsAgo: 2859, disputeOutcome: "rejected" },
  { id: "m-1021", handle: "arvolinn", question: "Will Arvo win the game in under 30 minutes?", rule: "Game clock when the ancient falls.", status: "settled", outcome: "YES", yesPool: 280.50, noPool: 301, predictors: 254, closedMinsAgo: 1_620, settledMinsAgo: 1_588, evidence: "Ancient down at 27:12.", clipAt: "1:27:12", paidMinsAgo: 1585 },
  { id: "m-1022", handle: "samoduya", question: "Will the viewer match go to overtime?", rule: "Overtime banner shown in game.", status: "settled", outcome: "YES", yesPool: 145, noPool: 167, predictors: 141, closedMinsAgo: 4_320, settledMinsAgo: 4_311, evidence: "OT at 0:00, won 3–2.", clipAt: "2:03:31", paidMinsAgo: 4310 },
  { id: "m-1023", handle: "saskiarae", question: "Will Saskia lose the police in under 3 minutes?", rule: "Wanted level cleared, timer on screen.", status: "settled", outcome: "NO", yesPool: 387, noPool: 256, predictors: 298, closedMinsAgo: 2_100, settledMinsAgo: 2_092, evidence: "Arrested at 2:48.", clipAt: "1:15:48", paidMinsAgo: 2090 },
  { id: "m-1024", handle: "sophie-carter", question: "Will Sophie reach the lighthouse before sunset?", rule: "Arrival on camera before the official sunset time (16:41).", status: "settled", outcome: "YES", yesPool: 553, noPool: 210.50, predictors: 455, closedMinsAgo: 1_380, settledMinsAgo: 1_340, evidence: "At the lighthouse 16:22.", clipAt: "4:22:06", paidMinsAgo: 1335 },
  { id: "m-1025", handle: "alice", question: "Will chat hit 1,000 messages in 10 minutes?", rule: "Chat counter overlay on stream.", status: "settled", outcome: "YES", yesPool: 795, noPool: 316.50, predictors: 690, closedMinsAgo: 5_760, settledMinsAgo: 5_748, evidence: "1,000 at 8:51.", clipAt: "0:38:51", paidMinsAgo: 5746 },

  // ── Voided: everything returned (5) ───────────────────────────────────────
  { id: "m-1026", handle: "kallemand", question: "Will Flora score in the first half?", rule: "First-half goals in the career mode match.", status: "voided", yesPool: 95, noPool: 62, predictors: 73, closedMinsAgo: 3_000, voidReason: "Stream crashed before kick-off." },
  { id: "m-1027", handle: "dealerdani", question: "Will the player split aces this shoe?", rule: "Current shoe at the live table.", status: "voided", yesPool: 49, noPool: 71.50, predictors: 52, closedMinsAgo: 7_200, voidReason: "Table closed by the casino mid-shoe." },
  { id: "m-1028", handle: "teonash", question: "Will Teo double up before the first break?", rule: "Chip count at the first scheduled break.", status: "voided", yesPool: 138.50, noPool: 100.50, predictors: 118, closedMinsAgo: 4_100, voidReason: "Tournament start delayed past the stream." },
  { id: "m-1029", handle: "glassgarage", question: "Will the blue marble finish the 40 m run?", rule: "Marble crosses the finish gate on camera.", status: "voided", yesPool: 67, noPool: 44, predictors: 64, closedMinsAgo: 10_080, voidReason: "Track section collapsed, run could not finish." },
  { id: "m-1030", handle: "leahbyrne", question: "Will Leah keep a clean sheet?", rule: "No goals conceded in the full match.", status: "voided", yesPool: 173, noPool: 146, predictors: 157, closedMinsAgo: 8_640, voidReason: "Match postponed, waterlogged pitch." },
];

/**
 * Settled history: earlier questions from the same creators. Gives each channel a track record,
 * fills "Past questions" and the public ledger. Early-stage scale on purpose (tens, not thousands).
 * PLACEHOLDER: settled questions from the platform database.
 */
const past = (
  id: string, handle: string, question: string, rule: string, outcome: Side, yesPool: number, noPool: number, predictors: number,
  closedMinsAgo: number, resolveAfter: number, payAfter: number, evidence: string, clipAt: string, extra: Partial<Market> = {}
): Market => ({ id, handle, question, rule, status: "settled", outcome, yesPool, noPool, predictors, closedMinsAgo, settledMinsAgo: closedMinsAgo - resolveAfter, paidMinsAgo: closedMinsAgo - resolveAfter - payAfter, evidence, clipAt, ...extra });

export const history: Market[] = [
  past("m-0901", "marblerally", "Will the green marble win heat 2?", "Official finish of heat 2 as shown on stream.", "NO", 402, 377.5, 188, 41, 6, 2, "Green finished 3rd, photo finish replay", "1:31:08"),
  past("m-0902", "marblerally", "Will any marble leave the track in heat 1?", "Marble fully off the track on camera.", "YES", 233, 301, 151, 88, 5, 3, "Teal marble off the banked turn", "1:04:51"),
  past("m-0903", "marblerally", "Will last night's champion win the final?", "Final heat finish order.", "NO", 615, 284, 247, 1_510, 7, 2, "Champion finished 4th in the final", "2:46:02"),
  past("m-0904", "kovac", "Will Kovac top-frag this map?", "Scoreboard at the end of the map, most kills.", "YES", 788, 512, 433, 64, 4, 3, "End-of-map scoreboard, 27 kills", "1:58:44"),
  past("m-0905", "kovac", "Will Kovac's team win pistol round two?", "Round 13 result on the round banner.", "NO", 356, 410.5, 297, 1_455, 2, 2, "Round 13 lost, banner shown", "1:12:30"),
  past("m-0906", "kovac", "Will Kovac get an ace tonight?", "Five kills in one round, any map.", "NO", 190, 702, 381, 2_940, 9, 3, "Stream ended without an ace", "3:59:10", { disputeOutcome: "rejected" }),
  past("m-0907", "mirelasun", "Will Mirela take the first dragon?", "In-game objective feed.", "YES", 520, 305, 360, 112, 3, 2, "Dragon slain feed at 9:41", "0:47:16"),
  past("m-0908", "mirelasun", "Will this game end before 25 minutes?", "Game clock when the nexus falls.", "NO", 288, 461, 302, 1_380, 4, 3, "Nexus down at 31:20", "2:19:40"),
  past("m-0909", "mirelasun", "Will Mirela finish with more kills than deaths?", "End-of-game KDA.", "YES", 640, 233, 389, 2_890, 3, 2, "Final KDA 9/3/11", "1:35:27"),
  past("m-0910", "renoblitz", "Will Reno get 10 eliminations this match?", "Elimination counter on screen.", "YES", 1_120, 905, 1_010, 58, 5, 3, "12th elimination at storm circle 5", "1:22:18"),
  past("m-0911", "renoblitz", "Will Reno land at Brutal Bastion?", "Landing spot at the start of the match.", "NO", 344, 612, 501, 1_420, 2, 2, "Landed at Lavish Lair", "0:33:05"),
  past("m-0912", "renoblitz", "Will Reno win a cash cup round?", "Placement in the cash cup round.", "YES", 1_480, 1_130, 1_102, 4_310, 6, 3, "Round won, placement screen", "2:12:49"),
  past("m-0913", "vinnymoretti", "Will the getaway car survive the chase?", "Car reaches the drop-off without being destroyed.", "YES", 760, 548, 512, 95, 4, 2, "Drop-off reached, car smoking but intact", "2:44:12"),
  past("m-0914", "vinnymoretti", "Will Vinny get arrested this heist?", "Arrest screen shown on stream.", "NO", 402, 777, 488, 1_470, 6, 3, "Heist completed, no arrest", "1:51:36"),
  past("m-0915", "diegoferraz", "Will Diego win the Weekend League match?", "Full-time score screen.", "YES", 380, 291, 266, 132, 3, 2, "Full time 3–1", "1:06:44"),
  past("m-0916", "diegoferraz", "Will the match go to extra time?", "Extra time shown on the match clock.", "NO", 120, 344.5, 201, 2_870, 2, 3, "Won 2–0 in normal time", "2:31:12"),
  past("m-0917", "hannaplays", "Will Hanna win her first berserk game?", "Result of the first berserked game in the arena.", "YES", 205, 166, 154, 150, 3, 2, "Checkmate in 31 moves", "0:27:55"),
  past("m-0918", "hannaplays", "Will Hanna beat the GM in round 4?", "Round 4 result on the tournament page.", "NO", 288, 190, 233, 4_350, 8, 2, "Lost on time in an equal endgame", "2:05:19"),
  past("m-0919", "marcus-reed", "Will the player hit blackjack in the next five hands?", "Natural 21 in the next five hands dealt.", "YES", 66.5, 81, 64, 120, 2, 2, "Natural 21 on hand four", "0:31:40"),
  past("m-0920", "marcus-reed", "Will the session end above the starting stack?", "Stack shown at the end of the session.", "NO", 140, 177.5, 102, 2_960, 5, 3, "Ended 18% down", "2:58:01"),
  past("m-0921", "ironines", "Will Ines hold the plank for 4 minutes?", "On-screen timer from first frame of the plank.", "YES", 310, 122, 240, 160, 2, 2, "Plank held to 4:07", "0:18:33"),
  past("m-0922", "ironines", "Will Ines beat her 5 km PB on the treadmill?", "Treadmill display at 5.00 km.", "NO", 196, 239, 205, 2_980, 3, 3, "5 km at 21:48, PB is 21:31", "0:52:10"),
  past("m-0923", "liftoffleo", "Will chat pick drum and bass?", "Poll result shown on stream.", "YES", 150, 98, 121, 175, 1, 2, "Poll closed at 58% drum and bass", "0:14:22"),
  past("m-0924", "liftoffleo", "Will Leo finish the track before the hour?", "Track ends when Leo says done, timer on screen.", "YES", 112, 205, 140, 3_020, 4, 2, "Done at 52:40", "1:02:13"),
  past("m-0925", "nordic-slots-god", "Will the bonus hunt end in profit?", "Total won vs total spent, shown on the hunt tracker.", "NO", 488, 520, 344, 1_540, 6, 3, "Hunt ended at 0.71× of spend", "3:12:44"),
  past("m-0926", "nordic-slots-god", "Will any bonus pay over 500×?", "Highest multiplier on the hunt tracker.", "NO", 233, 601, 389, 4_420, 5, 2, "Best bonus paid 212×", "2:40:06"),
  past("m-0927", "reelrita", "Will the 50 GBP budget last an hour?", "Balance above zero at the one-hour mark.", "YES", 140, 162, 128, 1_600, 3, 2, "Balance 6.40 at 1:00:00", "1:00:00"),
  past("m-0928", "ashokafor", "Will Ash drop 30 kills this match?", "End-of-match scoreboard.", "NO", 488, 361, 377, 1_500, 3, 2, "Finished on 24 kills", "1:44:52"),
  past("m-0929", "novadrift", "Will Nova win three games in a row?", "Three consecutive wins shown on stream.", "YES", 260, 233, 210, 1_560, 2, 3, "Third win at 3–2", "1:20:18"),
  past("m-0930", "terracetom", "Will the home side score first?", "First goal of the match, official clock.", "YES", 402, 366, 344, 2_900, 5, 2, "Home goal in the 23rd minute", "0:36:40"),
  past("m-0931", "sophie-carter", "Will Sophie find the hidden bunker?", "Bunker entrance shown on camera.", "YES", 311, 210, 254, 4_400, 4, 3, "Bunker entrance at the dune ridge", "2:12:05"),
  past("m-0932", "rasmuswalks", "Will Rasmus cross all four bridges before midnight?", "Each bridge shown on camera before 00:00.", "NO", 120, 188, 133, 1_480, 7, 2, "Third bridge at 23:58, fourth after midnight", "1:41:20"),
  past("m-0933", "alice", "Will Alice finish the 1,000-piece puzzle on stream?", "Last piece placed on camera.", "NO", 360, 412, 377, 7_120, 3, 2, "Stopped at 812 pieces", "4:01:15"),
  past("m-0934", "olivergrant", "Will Oliver reach 2000 rating today?", "Rating shown on profile at end of stream.", "NO", 211, 260, 207, 5_810, 4, 3, "Peaked at 1984", "3:33:02"),
  past("m-0935", "kaireps", "Will Kai finish the 25 km long run under 2 hours?", "Watch time at 25.0 km.", "YES", 180, 151, 140, 8_600, 6, 2, "25 km in 1:57:12", "2:01:40"),
  past("m-0936", "ivykeys", "Will Ivy play the full request list tonight?", "Every request on the list played on stream.", "YES", 98, 77, 81, 9_400, 2, 2, "Last request played at 1:58", "1:58:02"),
  past("m-0937", "tobilane", "Will Tobi get first blood?", "In-game first blood announcement.", "NO", 233, 196, 201, 130, 3, 2, "Enemy jungler took first blood", "0:42:31"),
  past("m-0938", "tobilane", "Will Tobi's team take Baron?", "Objective feed, Baron Nashor.", "YES", 300, 188, 244, 1_420, 4, 3, "Baron taken at 26:10", "1:51:44"),
  past("m-0939", "yukimori", "Will Yuki find diamonds in the first 10 minutes?", "In-game timer when diamonds are mined.", "YES", 202, 240, 196, 1_600, 3, 2, "Diamonds at 8:47 IGT", "0:20:31"),
  past("m-0940", "arvolinn", "Will Arvo's team win the lane phase?", "Net worth lead at 10:00.", "YES", 150, 166, 138, 13_200, 5, 3, "Net worth lead 2.1k at 10:00", "0:40:10", { disputeOutcome: "upheld" }),
  past("m-0941", "saskiarae", "Will Saskia finish her shift without a crash?", "No crash shown during the delivery shift.", "NO", 140, 151, 128, 14_100, 3, 2, "Crashed at the docks", "1:22:50"),
  past("m-0942", "pixiehart", "Will Pixie win a Zero Build match tonight?", "Victory Royale on stream.", "YES", 190, 166, 172, 15_300, 4, 3, "Victory Royale in game 6", "2:14:27"),
];

/** Payout multiplier for a side: total pool / side pool, less the 4% fee (3% platform, 1% creator). Settled on-chain. */
export function multiplier(m: Pick<Market, "yesPool" | "noPool">, side: Side) {
  const total = m.yesPool + m.noPool;
  const pool = side === "YES" ? m.yesPool : m.noPool;
  if (pool === 0) return 0;
  return Math.max(1.01, (total * 0.96) / pool);
}
export const yesPct = (m: Pick<Market, "yesPool" | "noPool">) => {
  const t = m.yesPool + m.noPool;
  return t === 0 ? 50 : Math.round((m.yesPool / t) * 100);
};
export const pool = (m: Pick<Market, "yesPool" | "noPool">) => m.yesPool + m.noPool;

/** One dataset for every screen. */
export const markets: Market[] = [...current, ...history];
