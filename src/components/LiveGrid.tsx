import * as React from "react";
import { streamers } from "@/data/streamers";
import { categories } from "@/data/categories";
import { useStore } from "@/lib/store";
import { channelState } from "@/lib/ledger";
import { StreamCard } from "@/components/xp";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Live channels with a game filter row (testers chose by game) and an "Open questions only" toggle,
 * on by default for signed-in users who have predicted before.
 */
export function LiveGrid({ limit, title = "Live now", id, query = "", group = "All" }: { limit?: number; title?: string; id?: string; query?: string; group?: string }) {
  const { markets } = useStore();
  const [game, setGame] = React.useState<string>("all");
  // Streaming first: every live channel shows by default; the question filter is opt-in.
  const [onlyOpen, setOnlyOpen] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  const live = streamers.filter((s) => s.live && (group === "All" || categories.find(c => c.slug === s.category)?.group === group) && (s.name + " " + s.title).toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.viewers - a.viewers);
  const games = categories
    .map((c) => ({ c, n: live.filter((s) => s.category === c.slug).reduce((a, s) => a + s.viewers, 0) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.c);
  const list = live.filter((s) => (game === "all" || s.category === game) && (!onlyOpen || channelState(s.handle, markets).kind === "open"));
  const shown = limit && !showAll ? list.slice(0, limit) : list;
  const openCount = live.filter((s) => channelState(s.handle, markets).kind === "open").length;

  return (
    <section id={id} aria-labelledby="live-grid-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="live-grid-title" className="font-display text-lg font-bold md:text-xl">{title} <span className="ml-1 font-mono text-sm font-normal text-muted-foreground">{list.length}</span></h2>
        <label className="hidden cursor-pointer items-center gap-2 text-sm sm:inline-flex">
          <Switch checked={onlyOpen} onCheckedChange={setOnlyOpen} aria-label="Open questions only" />
          Open questions only <span className="font-mono text-xs text-muted-foreground">{openCount}</span>
        </label>
      </div>
      <div className="-mx-4 mb-4 overflow-x-auto md:mb-5 px-4 md:mx-0 md:px-0" role="group" aria-label="Filter by game">
        <div className="flex w-max gap-2">
          {[{ slug: "all", name: "All games" }, ...games].map((c) => (
            <button key={c.slug} type="button" aria-pressed={game === c.slug} onClick={() => setGame(c.slug)}
              className={cn("h-8 md:h-9 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors", game === c.slug ? "border-foreground bg-foreground font-semibold text-background" : "text-label hover:border-input hover:text-foreground")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {shown.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{shown.map((s) => <StreamCard key={s.handle} s={s} />)}</div>
      ) : (
        <div className="rounded-xl border px-5 py-6">
          <p className="font-semibold">No live channel here has a question open right now.</p>
          <p className="mt-1 text-sm text-muted-foreground">Turn off “Open questions only” to see every live channel in this game.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setOnlyOpen(false)}>Show all live channels</Button>
        </div>
      )}
      {limit && list.length > limit && !showAll && <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setShowAll(true)}>Show all {list.length} channels</Button></div>}
    </section>
  );
}
