/**
 * Network config. Dev/staging runs on Polygon Amoy testnet; production on Polygon PoS mainnet.
 * Switch with VITE_CHAIN=polygon at build time.
 */
export interface Network {
  key: "amoy" | "polygon";
  name: string;
  chainId: number;
  testnet: boolean;
  explorer: string;
  /** Circle USDC token contract on this network */
  usdc: string;
  /** How many block confirmations before a deposit is credited */
  confirmations: number;
}

export const NETWORKS: Record<Network["key"], Network> = {
  amoy: { key: "amoy", name: "Polygon Amoy", chainId: 80002, testnet: true, explorer: "https://amoy.polygonscan.com", usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", confirmations: 12 },
  polygon: { key: "polygon", name: "Polygon", chainId: 137, testnet: false, explorer: "https://polygonscan.com", usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", confirmations: 64 },
};

const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CHAIN;
export const NETWORK: Network = NETWORKS[envKey === "polygon" ? "polygon" : "amoy"];

export const txUrl = (hash: string) => `${NETWORK.explorer}/tx/${hash}`;
export const addressUrl = (addr: string) => `${NETWORK.explorer}/address/${addr}`;
export const short = (addr: string, a = 6, b = 4) => (addr.length > a + b + 2 ? `${addr.slice(0, a)}…${addr.slice(-b)}` : addr);

/** Deterministic mock hash/address generator for fixtures. */
export function mockHex(seed: string, len = 64) {
  let h = 2166136261;
  let out = "";
  for (let i = 0; out.length < len; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    out += h.toString(16).padStart(8, "0");
  }
  return "0x" + out.slice(0, len);
}

/** The signed-in user's xp.live deposit wallet (custodial smart account) — mock. */
export const depositAddressFor = (userId: string) => mockHex("deposit:" + userId, 40);
