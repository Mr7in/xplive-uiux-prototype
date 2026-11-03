import { markets, multiplier } from "@/data/markets";

// Figures in notifications are computed from the dataset so they match the wallet.
const yuki = markets.find((m) => m.id === "m-1016")!;
const yukiWin = (Math.round(15 * multiplier(yuki, "YES") * 100) / 100).toFixed(2);

export const notifications = [
  { id: "n1", text: "Marble Rally asked: “Will the red marble win heat 3?”", when: "2 min ago", href: "/marblerally", read: false, kind: "Predictions" },
  { id: "n2", text: `${yukiWin} USDC back to you on “Will Yuki beat the Ender Dragon in under 20 minutes?”`, when: "3 h ago", href: "/wallet", read: false, kind: "Predictions" },
  { id: "n3", text: "Kovac went live: FACEIT lvl 10 grind · call my clutches", when: "2 h ago", href: "/kovac", read: false, kind: "Go-live" },
  { id: "n4", text: "“Will Olivia make the final table?” is under dispute review. Payouts are held until an admin decides.", when: "2 h ago", href: "/wallet", read: true, kind: "Predictions" },
  { id: "n5", text: "Mirela Sun went live: Challenger jungle", when: "1 h ago", href: "/mirelasun", read: true, kind: "Go-live" },
  { id: "n6", text: "mira_k mentioned you in Marble Rally’s chat", when: "Yesterday", href: "/marblerally", read: true, kind: "Mentions" },
  { id: "n7", text: "“Will the blue marble finish the 40 m run?” was voided. 5.00 USDC refunded.", when: "1 week ago", href: "/wallet", read: true, kind: "Predictions" },
  { id: "n8", text: "Sophie Carter went live: Baltic coast walk, day 9", when: "3 h ago", href: "/sophie-carter", read: true, kind: "Go-live" },
];

export const chatUsers = [
  { name: "mira_k", color: "#c6e0a8" }, { name: "tallinn_tom", color: "#a8c8f0" }, { name: "ka_ka", color: "#f2b8a0" },
  { name: "igor_m", color: "#a8e0d8" }, { name: "pixel_pia", color: "#e0c6f0" }, { name: "bramble", color: "#f0e0a8" },
  { name: "nordwind", color: "#b8d0ff" }, { name: "lumo", color: "#ffc2d1" }, { name: "jaanus", color: "#d0f0b8" },
];

export const chatLines = [
  "let’s gooo", "called it", "no way that’s happening", "YES all day", "NO, trust me", "this is the one",
  "chat is cooked", "inside line looks clean", "anyone else lagging?", "W stream", "that was so close",
  "first time here, this is fun", "I’m on NO for the drama", "lock it in", "here we go again",
];

export const conversations = [
  { id: "c1", with: "marblerally", preview: "Thanks for the tip! Heat 5 is going to be wild.", when: "12 min", unread: 1, kind: "Whispers" },
  { id: "c2", with: "sophie-carter", preview: "Haha yes, the lighthouse was worth it", when: "Yesterday", unread: 0, kind: "Whispers" },
  { id: "c3", with: "support", preview: "Your dispute has been received. We’ll reply within 24 hours.", when: "2 h", unread: 0, kind: "Support" },
  { id: "c4", with: "kovac", preview: "gg, see you tomorrow", when: "Mon", unread: 0, kind: "Whispers" },
];

export const thread = [
  { me: false, text: "Hey! Saw your tip during heat 3, thank you 🙏", when: "21:40" },
  { me: true, text: "That race was unreal. How long did the new track take to build?", when: "21:41" },
  { me: false, text: "About three weekends. The banked turn took the longest.", when: "21:44" },
  { me: false, text: "Thanks for the tip! Heat 5 is going to be wild.", when: "21:52" },
];

export const watchHistory = [
  { handle: "marblerally", what: "Grand Prix night · 8 heats", when: "Today", progress: 62 },
  { handle: "kovac", what: "FACEIT lvl 10 grind", when: "Today", progress: 18 },
  { handle: "yukimori", what: "Sub-15 attempts", when: "Yesterday", progress: 100 },
  { handle: "sophie-carter", what: "Baltic coast walk, day 8", when: "Yesterday", progress: 44 },
  { handle: "olivia-bennett", what: "Sunday Million deep run", when: "Sun", progress: 87 },
  { handle: "alice", what: "Chat picks my week", when: "Fri", progress: 100 },
];

export const balanceHistory = [
  { id: "b1", when: "Today 21:31", what: "Prediction · Will the red marble win heat 3?", amount: -250 },
  { id: "b2", when: "Today 21:20", what: "Prediction · Will Mirela's team get first blood this game?", amount: -100 },
  { id: "b3", when: "Today 18:48", what: "Winnings · Will Yuki beat the Ender Dragon in under 20 minutes?", amount: 476 },
  { id: "b4", when: "Today 09:00", what: "Daily watch reward", amount: 50 },
  { id: "b5", when: "Yesterday", what: "Winnings · Will Sophie reach the lighthouse before sunset?", amount: 199 },
  { id: "b6", when: "Mon", what: "Returned · Will the blue marble finish the 40 m run? (voided)", amount: 100 },
  { id: "b7", when: "Oct 20", what: "Welcome balance", amount: 2000 },
];

export const tipsSent = [
  { handle: "marblerally", amount: 5, message: "for the yellow underdog", when: "Today 21:40" },
  { handle: "nordic-slots-god", amount: 5, message: "", when: "Oct 19" },
  { handle: "sophie-carter", amount: 10, message: "lighthouse or bust!", when: "Oct 12" },
];
