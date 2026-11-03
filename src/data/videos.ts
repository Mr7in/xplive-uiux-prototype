/**
 * PLACEHOLDER: live stream ingest and player (Mux / HLS).
 * Mock stream footage. Each channel plays a public, embeddable YouTube video of
 * real gameplay / footage for its category so the prototype looks and moves like
 * a live platform. In production the player plays the channel's HLS stream and
 * thumbnails come from the media service.
 *
 * All 40 ids were checked to play inside an embed (gambling uploads are often
 * age-restricted and refuse embedding with error 150, so check new ones).
 *
 * id: YouTube video id · dur: video length in seconds · credit: uploader (shown in the player info)
 */
export interface StreamVideo { id: string; dur: number; credit: string }

const v = (id: string, dur: string, credit: string): StreamVideo => {
  const parts = dur.split(":").map(Number);
  const secs = parts.reduce((a, n) => a * 60 + n, 0);
  return { id, dur: secs, credit };
};

export const streamVideos: Record<string, StreamVideo> = {
  kovac: v("x-m24USPutM", "28:59", "Hytron"),
  junovale: v("eYOrG6qfgLw", "11:45:48", "UG Counter Strike"),
  mirelasun: v("MSAv87XaaeI", "11:54:08", "Loopy Longplays"),
  tobilane: v("Qb7dZ-XyI-4", "32:42", "Sargesor"),
  ashokafor: v("2LnFuREmbpk", "31:12", "Kryptek Muted"),
  lumikask: v("c6J3qBT0AXo", "10:00:23", "Anime Gaming"),
  renoblitz: v("lJezisnMT-M", "34:58", "IknowDuffy"),
  pixiehart: v("YL8rttimHP0", "11:52:53", "SENSEI"),
  bramstone: v("Dy3VtjcHdCs", "10:29:08", "CottonVelvet"),
  yukimori: v("HSwGH710EgA", "3:12:48", "Danvacraft"),
  diegoferraz: v("0DhlHlUX3eA", "18:40", "Throneful"),
  kallemand: v("cbTIg9mU2MA", "20:00:30", "Chaiypobza"),
  novadrift: v("jA7JMHt9R6o", "1:46:42", "Orbital Gameplay"),
  samoduya: v("crhTHgXHVfo", "8:46:04", "Artima"),
  vinnymoretti: v("9LnEko94knI", "14:44:00", "NRMwalkthroughHD"),
  saskiarae: v("xv3wFGGeIsI", "17:25:35", "MKIceAndFire"),
  arvolinn: v("zUlgUaqkD1E", "37:15", "Rugoh"),
  mikapetrov: v("6_-zw9tjtsQ", "44:27", "Ezgi"),
  hannaplays: v("rvxlB3f_FOE", "37:10", "Kirk O'Bayne"),
  olivergrant: v("zwyF6k4sldY", "1:19:56", "kanoa_iron"),
  "nordic-slots-god": v("A5cDsm1XdUc", "17:56", "Casino Realness"),
  reelrita: v("ub9j2F00ADc", "14:34", "Slotty by Nature"),
  "marcus-reed": v("QKnlCRAxSJI", "9:59", "Zylen"),
  dealerdani: v("P9URYkNN1Qo", "2:44:42", "J L"),
  rubylane: v("m8awXISvVpo", "1:02:17", "Orbital Gameplay"),
  spindoctor: v("tYu4MrUStdc", "1:08:47", "Silent Gaming"),
  "olivia-bennett": v("PFDNN4IBrGY", "2:13:55", "Kalipoker TV"),
  teonash: v("1N3MPHuM0oQ", "1:11:42", "Knightaker"),
  liftoffleo: v("P7xYgfoBZxs", "1:50:44", "DJ Contour"),
  ivykeys: v("EY9uI5d3SIo", "20:30", "今野俊郎"),
  marblerally: v("KcygF0N504E", "2:46:58", "Jelle's Marble Runs"),
  glassgarage: v("O2AbcCbyJ2U", "16:49", "Jelle's Marble Runs"),
  "sophie-carter": v("GwWhkQ0psxU", "1:29:30", "Wilmas Walking"),
  rasmuswalks: v("J-Z9rvKgorc", "1:17:15", "THE CITY WALKER"),
  alice: v("W_ZULqTV3nI", "3:00:00", "Cozy Timez"),
  nikotalks: v("jllKfuDlR9o", "22:07", "MassageASMR"),
  terracetom: v("oQ801H0LOT8", "9:59", "Liverpool FC"),
  leahbyrne: v("CNhrwaChUAA", "1:51:06", "Sarisbury Spartans FC"),
  ironines: v("rayH_WiIAi0", "1:00:32", "Wanderlust Walks"),
  kaireps: v("bTjETWnwQC8", "45:09", "Virtual Running Adventures"),
};

/** Which auto-generated frame (25 / 50 / 75 % through the video) to use as the thumbnail. */
const frameFor: Record<string, 1 | 2 | 3> = { reelrita: 3, kallemand: 3 };

export function videoFor(handle: string): StreamVideo | undefined {
  return streamVideos[handle.replace(/(clip)?\d+$/, "")];
}

/** 16:9 frame from the video (YouTube serves 4:3 with letterbox bars; crop with object-cover). */
export function frameUrl(handle: string, frame?: 1 | 2 | 3) {
  const vid = videoFor(handle);
  if (!vid) return undefined;
  const base = handle.replace(/(clip)?\d+$/, "");
  return `https://i.ytimg.com/vi/${vid.id}/hq${frame ?? frameFor[base] ?? 2}.jpg`;
}

/**
 * Start the embed partway in, so it looks like a stream already in progress, and always leave
 * at least 6 minutes before the end so no loop is visible in a 5-minute test session.
 */
export function startAt(handle: string, startedMinsAgo: number) {
  const vid = videoFor(handle);
  if (!vid) return 0;
  const latest = Math.max(0, vid.dur - 6 * 60);
  if (latest === 0) return 0;
  return 20 + Math.floor((Math.max(30, startedMinsAgo * 60) * 7) % Math.max(1, latest - 20));
}
