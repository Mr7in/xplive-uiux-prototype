import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

/**
 * Profile pictures for mock creators and viewers: DiceBear "Notionists" (CC0 licence), generated locally from a seed.
 * In production use the uploaded profile image and keep this as the default for accounts without one.
 */
const cache = new Map<string, string>();
const BGS = ["c8ff00", "a78bfa", "34edc5", "ff6b81", "b3b9d4", "ffd66b"];

export function avatarUrl(seed: string, bg?: string) {
  const key = seed + (bg ?? "");
  let v = cache.get(key);
  if (!v) {
    const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
    v = createAvatar(notionists, { seed, backgroundColor: [(bg ?? BGS[hash % BGS.length]).replace("#", "")], radius: 50 }).toDataUri();
    cache.set(key, v);
  }
  return v;
}
