export interface Streamer {
  handle: string;
  name: string;
  category: string; // category slug
  bio: string;
  country: string;
  language: string;
  followers: number;
  live: boolean;
  viewers: number;
  title: string;
  tags: string[];
  /** Avatar ring/ground colour from the brand palette. */
  color: string;
  startedMinsAgo: number;
  schedule: string;
  verified?: boolean;
}

const N = "#c8ff00", V = "#a78bfa", C = "#ff6b81", Y = "#34edc5", W = "#b3b9d4";

export const streamers: Streamer[] = [
  // Counter-Strike 2
  { handle: "kovac", name: "Kovac", category: "counter-strike-2", bio: "Ex-pro AWPer from Zagreb. FACEIT level 10 grind every weeknight, demo reviews on Sundays.", country: "HR", language: "English", followers: 184_200, live: true, viewers: 6_412, title: "FACEIT lvl 10 grind · call my clutches", tags: ["FPS", "Competitive"], color: N, startedMinsAgo: 142, schedule: "Mon–Fri 19:00 CET", verified: true },
  { handle: "junovale", name: "Juno Vale", category: "counter-strike-2", bio: "IGL for an amateur five-stack. Utility nerd, lineup teacher, terrible at aim duels.", country: "SE", language: "English", followers: 41_800, live: false, viewers: 0, title: "Smoke lineups for every map", tags: ["Educational"], color: V, startedMinsAgo: 0, schedule: "Tue, Thu 18:00 CET" },
  // League of Legends
  { handle: "mirelasun", name: "Mirela Sun", category: "league-of-legends", bio: "Challenger jungler. I path out loud so you can learn. Coffee-powered.", country: "RO", language: "English", followers: 226_900, live: true, viewers: 8_930, title: "Challenger jungle · first blood calls on every game", tags: ["Ranked", "Coaching"], color: V, startedMinsAgo: 96, schedule: "Daily 16:00 CET", verified: true },
  { handle: "tobilane", name: "Tobi Lane", category: "league-of-legends", bio: "Mid laner chasing Master tier. Wins are loud, losses are louder.", country: "DE", language: "German", followers: 58_300, live: true, viewers: 1_204, title: "Promo game tonight, no pressure (lots of pressure)", tags: ["Ranked"], color: C, startedMinsAgo: 61, schedule: "Wed–Sun 20:00 CET" },
  // Valorant
  { handle: "ashokafor", name: "Ash Okafor", category: "valorant", bio: "Radiant duelist from London. Fast hands, faster opinions.", country: "GB", language: "English", followers: 162_400, live: true, viewers: 4_118, title: "Radiant ranked · Jett only", tags: ["Ranked", "FPS"], color: C, startedMinsAgo: 188, schedule: "Daily 21:00 GMT", verified: true },
  { handle: "lumikask", name: "Lumi Kask", category: "valorant", bio: "Tallinn-based sentinel main. Calm comms, cosy streams.", country: "EE", language: "Estonian", followers: 19_600, live: false, viewers: 0, title: "Cosy unrated with viewers", tags: ["Chill"], color: Y, startedMinsAgo: 0, schedule: "Sat, Sun 15:00 EET" },
  // Fortnite
  { handle: "renoblitz", name: "Reno Blitz", category: "fortnite", bio: "Zero build cash cup regular. I play for the Victory Royale, never for placement.", country: "US", language: "English", followers: 301_700, live: true, viewers: 11_204, title: "Cash cup qualifiers · win or bust", tags: ["Competitive"], color: N, startedMinsAgo: 54, schedule: "Daily 14:00 ET", verified: true },
  { handle: "pixiehart", name: "Pixie Hart", category: "fortnite", bio: "Creative mode builder and duo queue menace with my little brother.", country: "CA", language: "English", followers: 77_100, live: false, viewers: 0, title: "Duos with lil bro", tags: ["Family friendly"], color: V, startedMinsAgo: 0, schedule: "Fri–Sun 17:00 ET" },
  // Minecraft
  { handle: "bramstone", name: "Bram Stone", category: "minecraft", bio: "Mega builder. Currently recreating Tallinn Old Town block by block.", country: "NL", language: "English", followers: 92_400, live: true, viewers: 2_011, title: "Old Town build day 41", tags: ["Building", "Chill"], color: Y, startedMinsAgo: 230, schedule: "Mon, Wed, Fri 18:00 CET" },
  { handle: "yukimori", name: "Yuki Mori", category: "minecraft", bio: "Any% speedrunner. Personal best 14:52. Seed resets are my cardio.", country: "JP", language: "English", followers: 133_800, live: false, viewers: 0, title: "Sub-15 attempts", tags: ["Speedrun"], color: N, startedMinsAgo: 0, schedule: "Daily 12:00 CET" },
  // EA Sports FC 26
  { handle: "diegoferraz", name: "Diego Ferraz", category: "ea-sports-fc-26", bio: "Weekend League elite. Pack openings every Friday, tears every Saturday.", country: "PT", language: "Portuguese", followers: 145_500, live: true, viewers: 3_402, title: "Weekend League 15–0 attempt", tags: ["Ultimate Team"], color: Y, startedMinsAgo: 120, schedule: "Thu–Sun 19:00 WET", verified: true },
  { handle: "kallemand", name: "Kalle Mänd", category: "ea-sports-fc-26", bio: "Career mode with Flora Tallinn to Champions League glory. Slowly.", country: "EE", language: "Estonian", followers: 22_700, live: false, viewers: 0, title: "Flora Tallinn career · season 4", tags: ["Career mode"], color: W, startedMinsAgo: 0, schedule: "Tue, Thu 19:00 EET" },
  // Rocket League
  { handle: "novadrift", name: "Nova Drift", category: "rocket-league", bio: "Freestyler and ranked 2s grinder. Ceiling shots or nothing.", country: "FR", language: "English", followers: 88_900, live: true, viewers: 1_766, title: "Grand Champ push, ceiling shots only", tags: ["Ranked"], color: V, startedMinsAgo: 77, schedule: "Daily 20:00 CET" },
  { handle: "samoduya", name: "Sam Oduya", category: "rocket-league", bio: "RLCS caster on weekends, chaotic 3s with viewers during the week.", country: "GB", language: "English", followers: 51_200, live: false, viewers: 0, title: "Viewer 3s", tags: ["Community"], color: C, startedMinsAgo: 0, schedule: "Mon, Wed 19:00 GMT" },
  // GTA V
  { handle: "vinnymoretti", name: "Vinny Moretti", category: "gta-v", bio: "Roleplay heist crew leader on the Lumen server. Plans never survive contact.", country: "IT", language: "English", followers: 211_300, live: true, viewers: 7_655, title: "The Pacific Standard job · take three", tags: ["Roleplay"], color: C, startedMinsAgo: 166, schedule: "Daily 21:00 CET", verified: true },
  { handle: "saskiarae", name: "Saskia Rae", category: "gta-v", bio: "Getaway driver character on RP servers. Knows every alley in Los Santos.", country: "NL", language: "English", followers: 64_800, live: false, viewers: 0, title: "Getaway driver shift", tags: ["Roleplay"], color: Y, startedMinsAgo: 0, schedule: "Wed–Sat 22:00 CET" },
  // Dota 2
  { handle: "arvolinn", name: "Arvo Linn", category: "dota-2", bio: "Immortal offlaner from Tartu. Explains every item build, whether you want it or not.", country: "EE", language: "English", followers: 47_300, live: false, viewers: 0, title: "Immortal offlane, explained", tags: ["Educational"], color: N, startedMinsAgo: 0, schedule: "Mon–Thu 18:00 EET" },
  { handle: "mikapetrov", name: "Mika Petrov", category: "dota-2", bio: "Support main, ward placement artist, TI watch-party host.", country: "BG", language: "English", followers: 33_900, live: true, viewers: 640, title: "Support from Herald to Immortal", tags: ["Ranked"], color: V, startedMinsAgo: 45, schedule: "Daily 17:00 EET" },
  // Chess
  { handle: "hannaplays", name: "Hanna Lõhmus", category: "chess", bio: "Woman FIDE Master. Bullet arenas, viewer simuls and opening prep.", country: "EE", language: "English", followers: 71_600, live: true, viewers: 2_388, title: "Titled arena · can I finish top 3?", tags: ["Bullet", "Educational"], color: W, startedMinsAgo: 38, schedule: "Tue, Thu, Sat 19:00 EET", verified: true },
  { handle: "olivergrant", name: "Oliver Grant", category: "chess", bio: "Club player documenting a 1500 to 2000 journey, one blunder at a time.", country: "IE", language: "English", followers: 18_200, live: false, viewers: 0, title: "Road to 2000, day 212", tags: ["Improvement"], color: N, startedMinsAgo: 0, schedule: "Daily 20:00 GMT" },
  // Slots
  { handle: "nordic-slots-god", name: "Nordic Slots God", category: "slots", bio: "Bonus hunts from Helsinki. Viewers pick the slot, I pick the bet. Gamble responsibly.", country: "FI", language: "English", followers: 96_400, live: true, viewers: 842, title: "Bonus hunt #212 · viewers pick the slot", tags: ["Bonus hunt", "18+"], color: N, startedMinsAgo: 72, schedule: "Daily 20:00 EET" },
  { handle: "reelrita", name: "Reel Rita", category: "slots", bio: "Low-stakes slots and honest reviews. Every session ends at the set budget.", country: "GB", language: "English", followers: 38_700, live: true, viewers: 512, title: "£50 budget, how far can it go?", tags: ["Low stakes", "18+"], color: C, startedMinsAgo: 33, schedule: "Mon–Fri 21:00 GMT" },
  // Virtual Casino
  { handle: "marcus-reed", name: "Marcus Reed", category: "virtual-casino", bio: "Basic strategy purist at the live-dealer tables. Explains every decision.", country: "US", language: "English", followers: 57_900, live: true, viewers: 287, title: "Basic strategy, no deviations", tags: ["Live dealer", "18+"], color: V, startedMinsAgo: 58, schedule: "Daily 22:00 ET" },
  { handle: "dealerdani", name: "Dealer Dani", category: "virtual-casino", bio: "Former croupier answering every question about how the tables really work.", country: "ES", language: "Spanish", followers: 29_400, live: false, viewers: 0, title: "Ask a croupier", tags: ["Educational", "18+"], color: Y, startedMinsAgo: 0, schedule: "Thu, Sat 21:00 CET" },
  // Apex Legends
  { handle: "rubylane", name: "Ruby Lane", category: "apex-legends", bio: "Predator-rank Wraith from Dublin. Fast rotations, faster jokes.", country: "IE", language: "English", followers: 31_100, live: false, viewers: 0, title: "Predator ranked, solo queue", tags: ["Ranked", "FPS"], color: C, startedMinsAgo: 0, schedule: "Fri, Sat 22:00 GMT" },
  { handle: "spindoctor", name: "Spin Doctor", category: "apex-legends", bio: "Movement tech coach. Tap-strafes slowed down and explained, every night.", country: "DE", language: "English", followers: 22_800, live: true, viewers: 344, title: "Movement tech masterclass", tags: ["Educational"], color: N, startedMinsAgo: 102, schedule: "Sun 18:00 CET" },
  // Poker
  { handle: "olivia-bennett", name: "Olivia Bennett", category: "poker", bio: "MTT grinder and hand-history nerd. Deep runs, honest bust-outs.", country: "GB", language: "English", followers: 104_600, live: false, viewers: 0, title: "Sunday Million deep run", tags: ["Tournaments", "18+"], color: V, startedMinsAgo: 0, schedule: "Sun 17:00 GMT", verified: true },
  { handle: "teonash", name: "Teo Nash", category: "poker", bio: "Cash game regular at 2/5. Every hand narrated, every mistake owned.", country: "CA", language: "English", followers: 36_500, live: false, viewers: 0, title: "2/5 cash, full narration", tags: ["Cash games", "18+"], color: W, startedMinsAgo: 0, schedule: "Tue, Thu 21:00 ET" },
  // Music
  { handle: "liftoffleo", name: "Lift-Off Leo", category: "music", bio: "Loop-pedal live sets from Vilnius. Chat picks the genre, I build the track from scratch.", country: "LT", language: "English", followers: 27_300, live: true, viewers: 618, title: "Chat picks the genre, I build the track", tags: ["Live music", "Loops"], color: N, startedMinsAgo: 29, schedule: "Daily 21:00 EET" },
  { handle: "ivykeys", name: "Ivy Keys", category: "music", bio: "Classical piano covers of game soundtracks. Requests open every Friday.", country: "LV", language: "English", followers: 14_900, live: false, viewers: 0, title: "Game OST request night", tags: ["Piano", "Requests"], color: V, startedMinsAgo: 0, schedule: "Wed, Fri 20:00 EET" },
  // Marble racing
  { handle: "marblerally", name: "Marble Rally", category: "marble-racing", bio: "Hand-built tracks in a Tartu garage. Eight marbles, eight heats, one champion.", country: "EE", language: "English", followers: 18_200, live: true, viewers: 1_284, title: "Grand Prix night · 8 heats, you call the winners", tags: ["Races"], color: Y, startedMinsAgo: 73, schedule: "Wed, Sat 20:00 EET" },
  { handle: "glassgarage", name: "Glass Garage", category: "marble-racing", bio: "Engineering student building the longest marble run in Scandinavia.", country: "NO", language: "English", followers: 12_600, live: false, viewers: 0, title: "Track extension, 40 metres", tags: ["Building"], color: W, startedMinsAgo: 0, schedule: "Sun 14:00 CET" },
  // IRL
  { handle: "sophie-carter", name: "Sophie Carter", category: "irl", bio: "Hiking, cold dips and dares from chat. Currently walking the Baltic coast.", country: "GB", language: "English", followers: 148_200, live: true, viewers: 1_980, title: "Baltic coast walk, day 9", tags: ["Outdoors", "Travel"], color: C, startedMinsAgo: 211, schedule: "Most days, weather allowing", verified: true },
  { handle: "rasmuswalks", name: "Rasmus Walks", category: "irl", bio: "Night walks through Nordic cities with a mic and a thermos.", country: "DK", language: "English", followers: 39_400, live: true, viewers: 702, title: "Copenhagen after midnight", tags: ["City walk"], color: Y, startedMinsAgo: 64, schedule: "Fri, Sat 23:00 CET" },
  // Just Chatting
  { handle: "alice", name: "Alice Live", category: "just-chatting", bio: "Reacts, chat games and the occasional bad decision. Daily at noon.", country: "US", language: "English", followers: 268_300, live: false, viewers: 0, title: "Chat picks my week", tags: ["Reactions"], color: V, startedMinsAgo: 0, schedule: "Daily 12:00 ET", verified: true },
  { handle: "nikotalks", name: "Niko Talks", category: "just-chatting", bio: "Tech news, gadget unboxings and long conversations with chat.", country: "FI", language: "English", followers: 44_100, live: true, viewers: 930, title: "Unboxing the weirdest gadgets of 2026", tags: ["Tech"], color: N, startedMinsAgo: 48, schedule: "Mon–Thu 18:00 EET" },
  // Sports
  { handle: "terracetom", name: "Terrace Tom", category: "sports", bio: "Matchday watch-alongs from the cheap seats. Opinions loud, predictions louder.", country: "GB", language: "English", followers: 121_000, live: true, viewers: 3_015, title: "North London derby watch-along", tags: ["Watch-along"], color: W, startedMinsAgo: 81, schedule: "Every matchday", verified: true },
  { handle: "leahbyrne", name: "Leah Byrne", category: "sports", bio: "Five-a-side keeper with a GoPro. Sunday league, every save on camera.", country: "IE", language: "English", followers: 26_700, live: false, viewers: 0, title: "Sunday league, GoPro cam", tags: ["Grassroots"], color: Y, startedMinsAgo: 0, schedule: "Sun 11:00 GMT" },
  // Fitness & Health
  { handle: "ironines", name: "Iron Ines", category: "fitness-health", bio: "Powerlifter and push-up ladder queen. Chat sets the target, I hit it.", country: "PT", language: "English", followers: 59_800, live: true, viewers: 1_102, title: "100 push-ups in 5 minutes, round 4", tags: ["Challenges"], color: C, startedMinsAgo: 26, schedule: "Mon, Wed, Fri 07:00 WET" },
  { handle: "kaireps", name: "Kai Reps", category: "fitness-health", bio: "Hybrid athlete training for an ultra. Long runs live, with snacks.", country: "AU", language: "English", followers: 21_300, live: false, viewers: 0, title: "Long run Sunday", tags: ["Running"], color: N, startedMinsAgo: 0, schedule: "Sun 06:00 AEST" },
];

export const streamerByHandle = (h: string) => streamers.find((s) => s.handle === h);
export const liveStreamers = () => streamers.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
export const streamersInCategory = (slug: string) => streamers.filter((s) => s.category === slug);
export const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
