export type CategoryGroup = "Games" | "Casino" | "IRL" | "Sports";
export type Motif =
  | "crosshair" | "lanes" | "diamond" | "storm" | "blocks" | "pitch" | "carball" | "city" | "map" | "board"
  | "reels" | "cards" | "wheel" | "chips" | "curve" | "marbles" | "street" | "mic" | "goal" | "bars";

export interface Category {
  slug: string;
  name: string;
  group: CategoryGroup;
  tags: string[];
  description: string;
  followers: number;
  motif: Motif;
  /** Ground and accent for the generated cover art. */
  ground: string;
  accent: string;
  /** Casino categories carry an 18+ notice. */
  adult?: boolean;
  /** Box art id on the Twitch/IGDB image CDN (same source the current xplive.dev uses). */
  boxArt?: string;
}

/** Category box art. Sizes: 144x192 (small), 285x380 (cards). Falls back to generated CoverArt when missing or blocked. */
export const boxArtUrl = (c: Pick<Category, "boxArt">, w = 285, h = 380) =>
  c.boxArt ? `https://static-cdn.jtvnw.net/ttv-boxart/${c.boxArt}-${w}x${h}.jpg` : undefined;

export const categories: Category[] = [
  { slug: "counter-strike-2", name: "Counter-Strike 2", group: "Games", tags: ["Shooter", "Esports"], description: "Tactical 5v5 rounds, pro scrims and pug grinds. Call clutches, aces and round winners.", followers: 412_300, motif: "crosshair", ground: "#1a1c14", accent: "#c8ff00", boxArt: "32399" },
  { slug: "league-of-legends", name: "League of Legends", group: "Games", tags: ["MOBA", "Esports"], description: "Solo queue climbs, coaching and pro VOD reviews. Predict first blood, dragons and comebacks.", followers: 388_900, motif: "lanes", ground: "#151629", accent: "#a78bfa", boxArt: "21779_IGDB" },
  { slug: "valorant", name: "Valorant", group: "Games", tags: ["Shooter", "Esports"], description: "Agent mains, ranked grinds and tournament watch parties.", followers: 301_400, motif: "diamond", ground: "#24131a", accent: "#ff4d6d", boxArt: "516575_IGDB" },
  { slug: "fortnite", name: "Fortnite", group: "Games", tags: ["Battle Royale"], description: "Zero build, cash cups and creative maps. Will they take the Victory Royale?", followers: 296_200, motif: "storm", ground: "#16152a", accent: "#a78bfa", boxArt: "33214_IGDB" },
  { slug: "minecraft", name: "Minecraft", group: "Games", tags: ["Sandbox", "Speedrun"], description: "Speedruns, hardcore worlds and mega builds.", followers: 254_700, motif: "blocks", ground: "#12201a", accent: "#34edc5", boxArt: "27471_IGDB" },
  { slug: "ea-sports-fc-26", name: "EA Sports FC 26", group: "Games", tags: ["Sports game"], description: "Ultimate Team pack openings, Weekend League and Division Rivals.", followers: 188_100, motif: "pitch", ground: "#10211b", accent: "#c8ff00", boxArt: "624536948_IGDB" },
  { slug: "rocket-league", name: "Rocket League", group: "Games", tags: ["Sports game", "Esports"], description: "Ranked 2s, freestyle clips and RLCS watch-alongs.", followers: 121_800, motif: "carball", ground: "#121a29", accent: "#34edc5", boxArt: "30921_IGDB" },
  { slug: "gta-v", name: "Grand Theft Auto V", group: "Games", tags: ["Open world", "Roleplay"], description: "Roleplay servers, heists and chaos. Does the getaway work?", followers: 233_500, motif: "city", ground: "#1d1622", accent: "#ff4d6d", boxArt: "32982_IGDB" },
  { slug: "dota-2", name: "Dota 2", group: "Games", tags: ["MOBA", "Esports"], description: "Immortal-rank pubs and tournament analysis.", followers: 142_000, motif: "map", ground: "#1e1414", accent: "#ff6b81", boxArt: "29595_IGDB" },
  { slug: "chess", name: "Chess", group: "Games", tags: ["Strategy"], description: "Bullet, blitz and viewer arenas. Call the checkmate before it lands.", followers: 98_600, motif: "board", ground: "#17181d", accent: "#eef0fb", boxArt: "743" },
  { slug: "slots", name: "Slots", group: "Casino", tags: ["Bonus hunts"], description: "Bonus hunts, bonus buys and big-multiplier chases.", followers: 276_400, motif: "reels", ground: "#191629", accent: "#c8ff00", adult: true },
  { slug: "virtual-casino", name: "Virtual Casino", group: "Casino", tags: ["Live dealer", "Blackjack", "Roulette"], description: "Live-dealer blackjack, roulette and game shows. Will the dealer bust?", followers: 88_200, motif: "cards", ground: "#0f1d19", accent: "#34edc5", adult: true, boxArt: "29452_IGDB" },
  { slug: "apex-legends", name: "Apex Legends", group: "Games", tags: ["Battle Royale", "Esports"], description: "Ranked grinds, ALGS scrims and three-stack chaos. Will the squad take the win?", followers: 196_500, motif: "wheel", ground: "#211218", accent: "#ff4d6d", boxArt: "511224_IGDB" },
  { slug: "poker", name: "Poker", group: "Casino", tags: ["Tournaments"], description: "MTT deep runs, cash games and hand reviews.", followers: 112_900, motif: "chips", ground: "#14182a", accent: "#a78bfa", adult: true, boxArt: "488190" },
  { slug: "music", name: "Music", group: "IRL", tags: ["Live music", "DJ"], description: "Live sets, song requests and loop-pedal challenges.", followers: 157_300, motif: "curve", ground: "#1a1a10", accent: "#c8ff00", boxArt: "26936" },
  { slug: "marble-racing", name: "Marble Racing", group: "Sports", tags: ["Races"], description: "Hand-built tracks, eight-marble heats and grand prix nights.", followers: 46_800, motif: "marbles", ground: "#0f2219", accent: "#34edc5", boxArt: "509511_IGDB" },
  { slug: "irl", name: "IRL", group: "IRL", tags: ["Outdoors", "Travel"], description: "City walks, road trips and real-world dares.", followers: 342_100, motif: "street", ground: "#1c1a14", accent: "#ff6b81", boxArt: "509672" },
  { slug: "just-chatting", name: "Just Chatting", group: "IRL", tags: ["Talk"], description: "Hangouts, reactions and chat-driven chaos.", followers: 610_200, motif: "mic", ground: "#191526", accent: "#a78bfa", boxArt: "509658" },
  { slug: "sports", name: "Sports", group: "Sports", tags: ["Watch-along"], description: "Matchday watch-alongs, fan cams and five-a-side.", followers: 207_500, motif: "goal", ground: "#11201a", accent: "#eef0fb", boxArt: "518203" },
  { slug: "fitness-health", name: "Fitness & Health", group: "IRL", tags: ["Challenges"], description: "Push-up ladders, lift PRs and endurance dares.", followers: 73_400, motif: "bars", ground: "#201714", accent: "#c8ff00", boxArt: "509671" },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
