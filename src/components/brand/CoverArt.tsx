import type { Motif } from "@/data/categories";
import { cn } from "@/lib/utils";

/**
 * Generated, rights-free cover art for categories and stream thumbnails.
 * Swap for real box art / live thumbnails from the media service when available.
 */
export function CoverArt({ motif, ground, accent, className, seed = 0 }: { motif: Motif; ground: string; accent: string; className?: string; seed?: number }) {
  const a = accent, dim = "rgba(238,240,251,0.10)", mid = "rgba(238,240,251,0.22)";
  const shift = (seed % 5) * 6;
  const shapes: Record<Motif, JSX.Element> = {
    crosshair: <g><circle cx={80 + shift} cy="45" r="22" fill="none" stroke={a} strokeWidth="2.5" /><path d={`M${80 + shift} 15v16M${80 + shift} 59v16M${50 + shift} 45h16M${94 + shift} 45h16`} stroke={a} strokeWidth="2.5" /><circle cx={80 + shift} cy="45" r="2.5" fill={a} /><path d="M0 70h160" stroke={dim} strokeWidth="18" /></g>,
    lanes: <g><path d="M10 80 L150 10" stroke={mid} strokeWidth="6" /><path d="M10 80 L10 12 L150 12" fill="none" stroke={dim} strokeWidth="6" /><path d="M10 80 L150 80 L150 12" fill="none" stroke={dim} strokeWidth="6" /><circle cx={60 + shift} cy="55" r="6" fill={a} /><circle cx="110" cy="30" r="6" fill="#ff6b81" /></g>,
    diamond: <g><path d={`M${80 + shift} 12 L${112 + shift} 45 L${80 + shift} 78 L${48 + shift} 45Z`} fill="none" stroke={a} strokeWidth="3" /><path d={`M${80 + shift} 28 L${96 + shift} 45 L${80 + shift} 62 L${64 + shift} 45Z`} fill={a} opacity="0.85" /><path d="M0 84h160" stroke={dim} strokeWidth="8" /></g>,
    storm: <g><circle cx={80 + shift} cy="45" r="34" fill="none" stroke={a} strokeWidth="3" strokeDasharray="6 5" /><circle cx={84 + shift} cy="48" r="16" fill={dim} /><path d={`M${74 + shift} 30 l10 14 h-8 l10 16`} fill="none" stroke="#eef0fb" strokeWidth="2.5" /></g>,
    blocks: <g>{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={20 + i * 20} y={70 - (i % 3) * 18 - (i === 2 ? 18 : 0)} width="18" height="18" fill={i % 2 ? a : mid} opacity={i % 2 ? 0.9 : 1} />)}<rect x="0" y="88" width="160" height="2" fill={dim} /></g>,
    pitch: <g><rect x="14" y="12" width="132" height="66" fill="none" stroke={mid} strokeWidth="2" /><path d="M80 12v66" stroke={mid} strokeWidth="2" /><circle cx="80" cy="45" r="12" fill="none" stroke={mid} strokeWidth="2" /><circle cx={98 + shift} cy="38" r="4" fill={a} /></g>,
    carball: <g><circle cx={96 + shift} cy="38" r="16" fill={a} opacity="0.9" /><rect x="30" y="52" width="44" height="16" rx="5" fill={mid} /><rect x="36" y="44" width="24" height="10" rx="3" fill={dim} /><path d="M0 74h160" stroke={dim} strokeWidth="6" /></g>,
    city: <g>{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={8 + i * 22} y={30 + ((i * 37) % 30)} width="18" height="70" fill={i === 3 ? a : mid} opacity={i === 3 ? 0.85 : 1} />)}<circle cx="132" cy="18" r="7" fill="#eef0fb" opacity="0.6" /></g>,
    map: <g><path d="M12 78 C 40 50, 60 70, 80 45 S 130 20, 150 12" fill="none" stroke={a} strokeWidth="4" /><circle cx="20" cy="72" r="7" fill={mid} /><circle cx="142" cy="16" r="7" fill={a} /><path d="M12 12 L60 12 M100 78 L150 78" stroke={dim} strokeWidth="6" /></g>,
    board: <g>{Array.from({ length: 32 }).map((_, i) => { const r = Math.floor(i / 8), c = i % 8; return (r + c) % 2 ? null : <rect key={i} x={48 + c * 8} y={13 + r * 8} width="8" height="8" fill={mid} />; })}<rect x="48" y="13" width="64" height="64" fill="none" stroke={mid} /><path d={`M${74 + shift} 70 h12 l-2 -6 h-8z M${80 + shift} 40 v24`} stroke={a} strokeWidth="3" fill={a} /></g>,
    reels: <g>{[0, 1, 2].map((i) => <g key={i}><rect x={38 + i * 30} y="18" width="24" height="54" rx="5" fill={dim} /><text x={50 + i * 30} y="52" textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="Outfit, sans-serif" fill={i === 2 && seed % 2 ? "#9ca2c0" : a}>7</text></g>)}</g>,
    cards: <g><rect x={58 + shift} y="20" width="30" height="44" rx="4" fill="#eef0fb" transform={`rotate(-10 ${73 + shift} 42)`} /><rect x={76 + shift} y="22" width="30" height="44" rx="4" fill="#eef0fb" transform={`rotate(8 ${91 + shift} 44)`} /><text x={92 + shift} y="50" fontSize="14" fontWeight="800" fontFamily="Outfit, sans-serif" fill={ground} transform={`rotate(8 ${91 + shift} 44)`}>A</text><path d="M0 82h160" stroke={a} strokeWidth="3" opacity="0.6" /></g>,
    wheel: <g><circle cx="80" cy="45" r="32" fill="none" stroke={mid} strokeWidth="8" /><circle cx="80" cy="45" r="32" fill="none" stroke={a} strokeWidth="8" strokeDasharray="8 8" /><circle cx="80" cy="45" r="14" fill={dim} /><circle cx={98 + shift / 2} cy="22" r="3.5" fill="#eef0fb" /></g>,
    chips: <g>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={64 + (i % 2) * 34} cy={64 - i * 8} rx="16" ry="6" fill={i % 2 ? a : mid} stroke={ground} strokeWidth="2" />)}<rect x="96" y="20" width="22" height="30" rx="3" fill="#eef0fb" opacity="0.85" /></g>,
    curve: <g><path d="M10 80 C 60 78, 100 60, 140 10" fill="none" stroke={a} strokeWidth="4" /><path d="M10 80 H150 M10 80 V10" stroke={dim} strokeWidth="2" /><circle cx="140" cy="10" r="5" fill={a} /></g>,
    marbles: <g><path d="M-10 66 C 40 40, 70 84, 110 58 S 160 34, 175 48" fill="none" stroke={dim} strokeWidth="22" /><circle cx={92 + shift} cy="58" r="7" fill="#ff4d6d" /><circle cx={78 + shift} cy="63" r="7" fill="#5b8cff" /><circle cx={106 + shift} cy="53" r="7" fill="#f5c542" /><circle cx={64 + shift} cy="66" r="7" fill="#eef0fb" /></g>,
    street: <g><path d="M60 90 L76 30 H84 L100 90Z" fill={dim} /><path d="M80 84 V72 M80 62 V52 M80 44 V36" stroke={a} strokeWidth="2.5" /><rect x="10" y="20" width="34" height="70" fill={mid} /><rect x="118" y="34" width="34" height="56" fill={mid} /><circle cx="130" cy="16" r="6" fill={a} opacity="0.7" /></g>,
    mic: <g><rect x={72 + shift / 2} y="14" width="16" height="34" rx="8" fill={a} /><path d={`M${64 + shift / 2} 38 a16 16 0 0 0 32 0 M${80 + shift / 2} 54 v12 M${70 + shift / 2} 68 h20`} fill="none" stroke="#eef0fb" strokeWidth="3" /><circle cx="30" cy="30" r="10" fill={dim} /><circle cx="132" cy="58" r="14" fill={dim} /></g>,
    goal: <g><path d="M36 74 V26 H124 V74" fill="none" stroke="#eef0fb" strokeWidth="3" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${50 + i * 15} 26 V74`} stroke={dim} />)}<circle cx={88 + shift} cy="56" r="7" fill={a} /><path d="M0 80h160" stroke={dim} strokeWidth="8" /></g>,
    bars: <g><rect x="22" y="40" width="116" height="6" rx="3" fill="#eef0fb" /><rect x="30" y="26" width="10" height="34" rx="2" fill={a} /><rect x="120" y="26" width="10" height="34" rx="2" fill={a} /><rect x="42" y="31" width="6" height="24" rx="2" fill={mid} /><rect x="112" y="31" width="6" height="24" rx="2" fill={mid} /></g>,
  };
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={cn("block h-full w-full", className)} aria-hidden="true">
      <rect width="160" height="90" fill={ground} />
      {shapes[motif]}
    </svg>
  );
}
