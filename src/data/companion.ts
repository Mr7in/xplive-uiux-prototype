/**
 * Companion app (streamer second-screen controls) mock data.
 * PLACEHOLDER: saved questions, device sessions and companion links from the platform API.
 */

export interface Preset {
  id: string;
  question: string;
  rule: string;
  /** Seconds the question stays open. */
  seconds: number;
}

export const DURATIONS = [
  { s: 60, l: "1 min" },
  { s: 120, l: "2 min" },
  { s: 300, l: "5 min" },
  { s: 600, l: "10 min" },
];

const p = (id: string, question: string, rule: string, seconds: number): Preset => ({ id, question, rule, seconds });

export const seedPresets: Record<string, Preset[]> = {
  "nordic-slots-god": [
    p("pr-1", "Will the next bonus buy pay over 100×?", "Next bonus buy on stream after this question closes. Multiplier as shown by the game.", 120),
    p("pr-2", "Will the next spin land a bonus?", "The first spin after this question closes.", 60),
    p("pr-3", "Will this bonus hunt end in profit?", "Total won vs total spent, shown on the hunt tracker.", 600),
    p("pr-4", "Will any bonus in this hunt pay over 500×?", "Highest multiplier on the hunt tracker when the hunt ends.", 600),
    p("pr-5", "Will I hit a max win tonight?", "Max win screen shown on stream before the stream ends.", 300),
  ],
  marblerally: [
    p("pr-m1", "Will the red marble win the next heat?", "Official finish of the next heat as shown on stream.", 120),
    p("pr-m2", "Will the favourite finish top 3?", "Top 3 on the official finish board.", 120),
    p("pr-m3", "Will any marble fall off the track?", "Any marble leaving the track before the finish gate.", 60),
    p("pr-m4", "Will the heat take longer than 45 seconds?", "Race clock on screen, first marble through the gate.", 60),
  ],
};

/** Starter questions for channels without saved ones. */
export const genericPresets: Preset[] = [
  p("pr-g1", "Will I win the next round?", "Settled on the end-of-round screen.", 120),
  p("pr-g2", "Will it happen in the next 5 minutes?", "Shown on stream before the timer ends.", 300),
];

/** Evidence options, same set as Studio's Propose result. */
export const EVIDENCE = ["On screen at the moment it happened", "Clip saved", "Game result screen shown"];
export const VOID_REASONS = ["The event didn’t happen", "Stream cut out", "The question was unclear", "I made a mistake asking it"];

/**
 * Each streamer's companion link. Uses the channel handle so it is easy to type on a phone;
 * only the channel owner's account can sign in there.
 * Production: https://balz.tv/control/<handle> (BrowserRouter).
 */
export const companionPath = (handle: string) => `/control/${handle}`;
export function companionUrl(handle: string) {
  if (typeof window === "undefined") return `https://balz.tv/control/${handle}`;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${companionPath(handle)}`;
}

export interface DeviceSession { id: string; device: string; browser: string; place: string; lastSeen: string; current?: boolean }

/** PLACEHOLDER: companion sessions from the auth service. */
export const seedDevices: DeviceSession[] = [
  { id: "d1", device: "iPhone 15", browser: "Safari", place: "Helsinki, FI", lastSeen: "Active now", current: true },
  { id: "d2", device: "iPad Air", browser: "Chrome", place: "Helsinki, FI", lastSeen: "Yesterday, 23:41" },
];
