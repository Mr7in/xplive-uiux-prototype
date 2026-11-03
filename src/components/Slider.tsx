import * as React from "react";

/** Minimal accessible range input styled for the brand (swap for shadcn Slider if preferred). */
export function Slider({ defaultValue, min, max, unit = "", label }: { defaultValue: number; min: number; max: number; unit?: string; label?: string }) {
  const [v, setV] = React.useState(defaultValue);
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} value={v} onChange={(e) => setV(Number(e.target.value))} aria-label={label ?? "Value"} className="h-2 w-48 cursor-pointer appearance-none rounded-full bg-secondary accent-[rgb(var(--neon-fg))]" />
      <span className="w-12 font-mono text-sm">{v}{unit}</span>
    </div>
  );
}
