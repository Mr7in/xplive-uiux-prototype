export const studioFollowers = [
  { name: "tallinn_tom", since: "Today", subs: true }, { name: "mira_k", since: "Today", subs: false }, { name: "Test Viewer", since: "Oct 19", subs: false },
  { name: "Mr7in", since: "Jul 5", subs: true }, { name: "Krzysztof", since: "Jun 16", subs: false }, { name: "Ka", since: "Jun 4", subs: false },
  { name: "Frank Garcia", since: "Jun 2", subs: false }, { name: "Emma Foster", since: "Jun 2", subs: true }, { name: "David Evans", since: "Jun 2", subs: false },
  { name: "Charlie Davis", since: "Jun 2", subs: false }, { name: "Bobby Carter", since: "Jun 2", subs: false }, { name: "Alice Stevens", since: "Jun 2", subs: false },
];

export const studioMods = [
  { name: "Krzysztof", role: "Lead moderator", added: "Jun 16", actions: 142 },
  { name: "mira_k", role: "Moderator", added: "Aug 2", actions: 61 },
  { name: "nordwind", role: "VIP", added: "Sep 9", actions: 0 },
];

export const studioBans = [
  { name: "spam_bot_77", reason: "Spam links", by: "AutoMod", when: "Today 21:18", type: "Permanent" },
  { name: "rage_kid", reason: "Harassment over a prediction result", by: "Krzysztof", when: "Oct 25", type: "7 days" },
  { name: "freecoinz", reason: "Scam links", by: "AutoMod", when: "Oct 21", type: "Permanent" },
];

export const studioCommands = [
  { cmd: "!rules", reply: "Be kind, no links, no begging for tips. Full rules on the About tab.", uses: 412, level: "Everyone" },
  { cmd: "!budget", reply: "Tonight’s session budget is 200 USDC. When it’s gone, we stop.", uses: 188, level: "Everyone" },
  { cmd: "!predict", reply: "Predictions use USDC on Polygon. Pick YES or NO beside the player before the timer ends. 18+.", uses: 301, level: "Everyone" },
  { cmd: "!discord", reply: "Join the community: discord.gg/[your-invite]", uses: 96, level: "Everyone" },
  { cmd: "!shoutout", reply: "Go follow {user}, they’re great!", uses: 22, level: "Moderators" },
];

export const studioTriggers = [
  { when: "Someone follows", then: "Thank them in chat", on: true },
  { when: "A question settles", then: "Post the result and top winner in chat", on: true },
  { when: "Tip over 10 USDC", then: "Play the big-tip alert", on: true },
  { when: "First-time chatter", then: "Send welcome message with !rules", on: false },
];

export const studioEmotes = [
  { code: "nsgBonus", tier: "Followers", status: "Live" }, { code: "nsgSpin", tier: "Everyone", status: "Live" }, { code: "nsgRip", tier: "Followers", status: "Live" },
  { code: "nsgMax", tier: "Subscribers", status: "In review" }, { code: "nsgGg", tier: "Everyone", status: "Live" }, { code: "nsgCope", tier: "Subscribers", status: "Rejected" },
];

export const studioBadges = [
  { name: "Founder", rule: "First 100 followers", holders: 100 }, { name: "1 month", rule: "Subscribed 1 month", holders: 41 },
  { name: "Oracle", rule: "10 correct predictions in a row", holders: 6 }, { name: "Moderator", rule: "Assigned by you", holders: 2 },
];

export const studioRewards = [
  { name: "Pick the next slot", cost: 5000, redemptions: 31, on: true }, { name: "Choose the bet size (within budget)", cost: 12000, redemptions: 4, on: true },
  { name: "Highlight my message", cost: 300, redemptions: 207, on: true }, { name: "Name a bonus hunt", cost: 20000, redemptions: 1, on: false },
];

export const studioRedemptions = [
  { user: "mira_k", reward: "Pick the next slot", input: "Wanted Dead or a Wild", when: "2 min ago" },
  { user: "tallinn_tom", reward: "Highlight my message", input: "LETS GO HUNT #212", when: "6 min ago" },
];

export const studioRaids = [
  { dir: "Out", channel: "reelrita", viewers: 611, when: "Oct 26" }, { dir: "In", channel: "spindoctor", viewers: 204, when: "Oct 24" }, { dir: "In", channel: "liftoffleo", viewers: 88, when: "Oct 19" },
];

export const studioHypeTrains = [
  { level: 4, when: "Oct 26", duration: "11 min", contributors: 38, top: "tallinn_tom" },
  { level: 2, when: "Oct 19", duration: "6 min", contributors: 14, top: "mira_k" },
];

export const studioSubs = [
  { name: "Mr7in", tier: "Tier 1", months: 4, gifted: false }, { name: "Emma Foster", tier: "Tier 2", months: 2, gifted: false },
  { name: "tallinn_tom", tier: "Tier 1", months: 1, gifted: true }, { name: "ka_ka", tier: "Tier 1", months: 7, gifted: false },
];

export const studioAlerts = [
  { event: "Follow", style: "Neon slide-in", sound: "Chime", on: true }, { event: "Tip", style: "Big card", sound: "Coin", on: true },
  { event: "Subscription", style: "Big card", sound: "Fanfare", on: true }, { event: "Raid", style: "Full-screen", sound: "Horn", on: true },
  { event: "Prediction result", style: "Banner", sound: "None", on: true },
];

export const studioSponsorships = [
  { brand: "Northbet Casino", campaign: "November bonus hunt series", fee: 1200, status: "Offer", deliverables: "4 streams · branded overlay · tracked link in panels", ends: "Reply by Nov 2" },
  { brand: "SpinHaus", campaign: "Launch week: Viking Reels", fee: 650, status: "Active", deliverables: "2 streams · 1 sponsored question per stream", ends: "Ends Nov 8" },
  { brand: "Reel Labs", campaign: "October showcase", fee: 400, status: "Completed", deliverables: "1 stream · overlay", ends: "Paid Oct 20" },
];

export const studioActivity = [
  { what: "tallinn_tom followed", when: "1 min ago", kind: "follow" },
  { what: "igor_m tipped 5.00 USDC · “for the next bonus”", when: "4 min ago", kind: "tip" },
  { what: "Question closed: Will the next bonus buy pay over 100×? · 233 predictors", when: "4 min ago", kind: "prediction" },
  { what: "AutoMod held a message from spam_bot_77", when: "7 min ago", kind: "mod" },
  { what: "mira_k redeemed Pick the next slot", when: "9 min ago", kind: "points" },
  { what: "Emma Foster subscribed (Tier 2, month 2)", when: "18 min ago", kind: "sub" },
  { what: "reelrita raided with 611 viewers", when: "Oct 26", kind: "raid" },
];

export const studioPastStreams = [
  { title: "Bonus hunt #211 · viewers pick the slot", date: "Oct 27", duration: "3:12:40", peak: 1_204, avg: 712, followers: 64, visibility: "Public" },
  { title: "Bonus hunt #210", date: "Oct 26", duration: "2:48:02", peak: 1_481, avg: 830, followers: 92, visibility: "Public" },
  { title: "Low stakes Sunday", date: "Oct 25", duration: "1:55:11", peak: 640, avg: 402, followers: 21, visibility: "Followers only" },
  { title: "Bonus hunt #209", date: "Oct 23", duration: "3:30:54", peak: 1_102, avg: 688, followers: 47, visibility: "Public" },
];

export const studioClips = [
  { title: "1,000× on the last bonus", by: "mira_k", views: 12_400, when: "Oct 27", length: "0:30" },
  { title: "Chat called it, NO wins", by: "tallinn_tom", views: 3_120, when: "Oct 26", length: "0:24" },
  { title: "Dead spin streak reaction", by: "Ka", views: 980, when: "Oct 23", length: "0:30" },
];

export const studioPayouts = [
  { id: "PO-1042", period: "Oct 20 – Oct 26", amount: 312.4, status: "Scheduled", date: "Mon 2 Nov" },
  { id: "PO-1031", period: "Oct 13 – Oct 19", amount: 268.1, status: "Paid", date: "Oct 26" },
  { id: "PO-1019", period: "Oct 6 – Oct 12", amount: 190.75, status: "Paid", date: "Oct 19" },
];

export const studioConvos = [
  { id: "s1", with: "support", preview: "Your payout method was verified. Payouts resume Monday.", when: "1 h", unread: 1, kind: "Support" },
  { id: "s2", with: "reelrita", preview: "raid you back tomorrow?", when: "3 h", unread: 0, kind: "Whispers" },
  { id: "s3", with: "marcus-reed", preview: "collab stream next week?", when: "Mon", unread: 0, kind: "Whispers" },
  { id: "s4", with: "spindoctor", preview: "sent you my spin tracker sheet", when: "Oct 24", unread: 0, kind: "Whispers" },
];

export const studioThread = [
  { me: true, text: "Hi, my payout last week showed as on hold. Anything I need to do?", when: "10:02" },
  { me: false, text: "Hi! We needed to re-verify your payout method after the bank change. That’s done now.", when: "11:40" },
  { me: false, text: "Your payout method was verified. Payouts resume Monday.", when: "11:41" },
];

export const analyticsDays = [
  { d: "Oct 22", viewers: 610, followers: 18, tips: 22 }, { d: "Oct 23", viewers: 688, followers: 47, tips: 41 }, { d: "Oct 24", viewers: 0, followers: 3, tips: 0 },
  { d: "Oct 25", viewers: 402, followers: 21, tips: 12 }, { d: "Oct 26", viewers: 830, followers: 92, tips: 66 }, { d: "Oct 27", viewers: 712, followers: 64, tips: 48 },
  { d: "Oct 28", viewers: 842, followers: 86, tips: 46.5 },
];
