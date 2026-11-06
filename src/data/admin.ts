import { streamers } from "./streamers";

export const adminUsers = [
  { id: "u-viewer", name: "Test Viewer", email: "test.viewer@xplive.com", role: "Viewer", status: "Active", joined: "Jun 2, 2026", country: "EE", flags: 0 },
  { id: "u-streamer", name: "Nordic Slots God", email: "test.streamer@xplive.com", role: "Creator", status: "Active", joined: "May 29, 2026", country: "FI", flags: 0 },
  { id: "u-admin", name: "Test Admin", email: "test.admin@xplive.com", role: "Admin", status: "Active", joined: "May 20, 2026", country: "EE", flags: 0 },
  { id: "u-1042", name: "tallinn_tom", email: "tom.k@mail.ee", role: "Viewer", status: "Active", joined: "Jul 3, 2026", country: "EE", flags: 1 },
  { id: "u-1077", name: "mira_k", email: "mira@proton.me", role: "Viewer", status: "Active", joined: "Jul 9, 2026", country: "LV", flags: 0 },
  { id: "u-1101", name: "rage_kid", email: "ragekid99@gmail.com", role: "Viewer", status: "Suspended", joined: "Aug 14, 2026", country: "GB", flags: 3 },
  { id: "u-1188", name: "spam_bot_77", email: "x8812@tempmail.io", role: "Viewer", status: "Banned", joined: "Oct 28, 2026", country: "?", flags: 5 },
  ...streamers.slice(0, 12).map((s, i) => ({ id: `u-c${i}`, name: s.name, email: `${s.handle.replace(/-/g, ".")}@creators.xp.live`, role: "Creator", status: "Active", joined: "Jun 2026", country: s.country, flags: 0 })),
];

export const reports = [
  { id: "R-5521", severity: "High", category: "Harassment", target: "Chat message in Olivia Bennett", reporter: "mira_k", filed: "18 min ago", status: "Open", excerpt: "you rigged it, I know where you stream from" },
  { id: "R-5518", severity: "Medium", category: "Self-harm", target: "Chat message in Nordic Slots God", reporter: "Krzysztof", filed: "2 h ago", status: "Open", excerpt: "[message hidden pending review]" },
  { id: "R-5509", severity: "Medium", category: "Spam", target: "User spam_bot_77", reporter: "AutoMod", filed: "3 h ago", status: "In review", excerpt: "free coins at [link]" },
  { id: "R-5490", severity: "Low", category: "Misleading question", target: "Question in Reel Rita", reporter: "tallinn_tom", filed: "Yesterday", status: "Triaged", excerpt: "Will I win? (asked after the spin finished)" },
  { id: "R-5471", severity: "Critical", category: "Underage user", target: "User pixel_pia", reporter: "Sophie Carter", filed: "Yesterday", status: "Escalated", excerpt: "Said they are 15 in chat" },
];

export const sanctions = [
  { user: "spam_bot_77", type: "Permanent ban", reason: "Spam / scam links", by: "AutoMod", when: "Today", expires: "Never" },
  { user: "rage_kid", type: "Suspension", reason: "Harassment after prediction result", by: "Test Admin", when: "Oct 25", expires: "Nov 1" },
  { user: "freecoinz", type: "Permanent ban", reason: "Scam links", by: "AutoMod", when: "Oct 21", expires: "Never" },
  { user: "lowkey_lu", type: "Chat restriction", reason: "Repeated slurs", by: "Test Admin", when: "Oct 18", expires: "Nov 18" },
];

export const appeals = [
  { id: "A-311", user: "rage_kid", sanction: "Suspension · 7 days", statement: "I got heated after losing a bonus prediction. It won’t happen again.", filed: "Oct 26", status: "Pending" },
  { id: "A-305", user: "lowkey_lu", sanction: "Chat restriction · 30 days", statement: "Someone else used my account.", filed: "Oct 20", status: "Pending" },
];

export const supportQueue = [
  { id: "T-20418", from: "Test Viewer", subject: "Dispute: Will Olivia make the final table?", topic: "Predictions", priority: "High", age: "2 h", assignee: "Unassigned" },
  { id: "T-20391", from: "Nordic Slots God", subject: "Payout on hold after bank change", topic: "Payouts", priority: "Normal", age: "1 d", assignee: "Test Admin" },
  { id: "T-20377", from: "Reel Rita", subject: "Can I run predictions on low-stakes slots?", topic: "Predictions", priority: "Normal", age: "1 d", assignee: "Unassigned" },
  { id: "T-20310", from: "mira_k", subject: "Sent USDC on the wrong network", topic: "Wallet", priority: "High", age: "2 d", assignee: "Unassigned" },
];

export const payoutQueue = [
  { id: "PO-1042", creator: "Nordic Slots God", amount: 312.4, method: "0x4417…02be", status: "Scheduled", hold: "" },
  { id: "PO-1043", creator: "Marble Rally", amount: 188.0, method: "0x0921…7f1d", status: "Needs approval", hold: "" },
  { id: "PO-1044", creator: "Kovac", amount: 2_940.55, method: "0x7310…a9c2", status: "Needs approval", hold: "Over 2,500 USDC: second approver required" },
  { id: "PO-1045", creator: "Reel Rita", amount: 96.2, method: "0x5520…e43a", status: "On hold", hold: "Payout address changed 26 h ago (72 h hold)" },
];

export const paymentIssues = [
  { id: "PI-88", what: "USDC sent on Ethereum instead of Polygon", user: "mira_k", amount: 25, status: "Recovery requested", when: "2 d" },
  { id: "PI-86", what: "Withdrawal reverted: out of gas", user: "Reel Rita", amount: 96.2, status: "Retrying", when: "5 d" },
  { id: "PI-85", what: "Amoy RPC lagging, deposits slow to confirm", user: "Multiple", amount: 0, status: "Monitoring", when: "6 d" },
];

export const auditLog = [
  { when: "Today 21:05", who: "Test Admin", action: "Paused kill switch", target: "Referral bonuses", reason: "Abuse sweep tuning" },
  { when: "Today 18:42", who: "Test Admin", action: "Suspended user", target: "rage_kid", reason: "Harassment, report R-5402" },
  { when: "Today 14:11", who: "System", action: "Auto-voided question", target: "Will Flora score in the first half?", reason: "No result after 60 min" },
  { when: "Yesterday 22:30", who: "Test Admin", action: "Changed revenue split", target: "Tips 10% → 5%", reason: "Creator programme launch" },
  { when: "Yesterday 11:02", who: "Test Admin", action: "Approved payout", target: "PO-1031 · 268.10 USDC", reason: "" },
  { when: "Oct 26", who: "Test Admin", action: "Reserved handle", target: "xplive-official", reason: "Brand protection" },
];

export const reservedHandles = [
  { handle: "xplive", reason: "Brand", added: "May 20" }, { handle: "xplive-official", reason: "Brand", added: "Oct 26" },
  { handle: "support", reason: "System", added: "May 20" }, { handle: "admin", reason: "System", added: "May 20" }, { handle: "thunderpick", reason: "Partner", added: "Jun 2" },
];

export const emoteReviews = [
  { code: "nsgMax", channel: "Nordic Slots God", submitted: "Today", note: "" },
  { code: "kovAce", channel: "Kovac", submitted: "Today", note: "" },
  { code: "marbleWin", channel: "Marble Rally", submitted: "Yesterday", note: "Possible trademark (team logo)" },
];

export const badgeReviews = [
  { name: "Oracle", channel: "Nordic Slots God", rule: "10 correct predictions in a row", submitted: "Yesterday" },
  { name: "Pit crew", channel: "Marble Rally", rule: "Subscribed 3 months", submitted: "Oct 25" },
];

export const killSwitches = [
  { key: "new_questions", name: "New questions", body: "Creators can start new YES/NO questions.", on: true, changed: "Oct 22 by Test Admin" },
  { key: "new_predictions", name: "New predictions", body: "Viewers can join open questions. Paused stakes are held, not lost.", on: true, changed: "Oct 22 by Test Admin" },
  { key: "disputes", name: "Disputes", body: "Viewers can challenge a creator’s result within 2 hours.", on: true, changed: "—" },
  { key: "settlement", name: "Automatic settlement", body: "Pay winners as soon as a creator proposes a result.", on: true, changed: "—" },
  { key: "referrals", name: "Referral bonuses", body: "Credit USDC bonuses for referred sign-ups.", on: false, changed: "Today by Test Admin" },
];

export const stopLevers = [
  { name: "Deposits", body: "Credits incoming USDC on Polygon after final confirmation.", on: true },
  { name: "Withdrawals", body: "Sends USDC to verified payout addresses. Held withdrawals wait, nothing is lost.", on: true },
  { name: "Testnet faucet", body: "Daily 10.00 test USDC on Amoy. Testnet only.", on: true },
  { name: "All signing", body: "Every contract call: market creation, answers, settlement, claims. Incidents only.", on: true },
  { name: "Creator payouts", body: "Weekly batched USDC payouts to creators.", on: true },
];

export const farmFlags = [
  { user: "acct_58821", rule: "Faucet claimed from 6 accounts on one device", xp: 60, mode: "Enforced", when: "Today" },
  { user: "acct_58830", rule: "Faucet claimed from 6 accounts on one device", xp: 60, mode: "Enforced", when: "Today" },
  { user: "ref_ring_3", rule: "Referral bonuses from linked wallets", xp: 75, mode: "Shadow", when: "Yesterday" },
];

/** Hot wallet and settlement contract balances on the active network. */
export const treasury = [
  { name: "Hot wallet (withdrawals)", address: "0x3a91c0d5e2f84b7a9c1d6e3f0b2a4c8d9e7f1a20", balance: 18_420.55, note: "Auto top-up below 5,000 USDC" },
  { name: "Prediction settlement contract", address: "0x8f2d4e6a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e", balance: 9_266.1, note: "Holds open and awaiting pools" },
  { name: "Fee collector", address: "0x1c3e5a7b9d0f2e4c6a8b0d1f3e5c7a9b2d4f6e81", balance: 1_204.32, note: "Platform 3% + creator 1%, claimable" },
];
export const stuckTx = [
  { hash: "0x9be1d4f07a2c5e8b3d6f9a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b", what: "Settlement · Am I old enough to ask this question?", age: "42 min", retries: 2 },
];
