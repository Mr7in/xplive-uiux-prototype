import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = (n: number) => n.toLocaleString("en-US");
const usd2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** USDC amounts always show two decimals: "12.50 USDC". */
export const fmtUSDC = (n: number) => `${usd2.format(Math.round(n * 100) / 100)} USDC`;
export const fmtUSD2 = (n: number) => usd2.format(Math.round(n * 100) / 100);
/** Compact for big pools: "1.2k USDC". */
export const compactUSDC = (n: number) => (n >= 1000 ? `${compact(Math.round(n))} USDC` : fmtUSDC(n));
export const fmtEUR = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);

export function timeLeft(sec: number) {
  if (sec <= 0) return "Closed";
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Strip combining marks used for Zalgo text and cap length before rendering chat. */
export function sanitizeChat(text: string) {
  return text.replace(/[̀-ͯ҃-҉᪰-᫿᷀-᷿⃐-⃿︠-︯]/g, "").slice(0, 300);
}
