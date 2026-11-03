import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { streamers } from "@/data/streamers";
import { categories } from "@/data/categories";
import { CategoryCard, EmptyState, MarketCard, PageHeader, SectionHeader, StreamCard } from "@/components/xp";
import { Input } from "@/components/ui/input";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  usePageMeta(q ? `Search: ${q}` : "Search");
  const { markets } = useStore();
  const [val, setVal] = React.useState(q);
  React.useEffect(() => { setVal(q); }, [q]);
  const t = q.toLowerCase();
  const chans = t ? streamers.filter((s) => (s.name + s.handle + s.title + s.tags.join(" ")).toLowerCase().includes(t)) : [];
  const cats = t ? categories.filter((c) => (c.name + c.tags.join(" ")).toLowerCase().includes(t)) : [];
  const mkts = t ? markets.filter((m) => m.question.toLowerCase().includes(t)) : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-10 px-4 py-8 md:px-8">
      <PageHeader title={q ? <>Results for “{q}”</> : "Search"} />
      <form role="search" onSubmit={(e) => { e.preventDefault(); setParams(val.trim() ? { q: val.trim() } : {}); }} className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Channels, categories, predictions" className="h-12 pl-9" aria-label="Search" autoFocus />
      </form>
      {q && !chans.length && !cats.length && !mkts.length && <EmptyState icon={SearchIcon} title={`Nothing found for “${q}”`} body="Check the spelling, or search a category like Slots or Chess." />}
      {cats.length > 0 && <section><SectionHeader title="Categories" count={cats.length} /><div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">{cats.map((c) => <CategoryCard key={c.slug} c={c} />)}</div></section>}
      {chans.length > 0 && <section><SectionHeader title="Channels" count={chans.length} /><div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{chans.map((s) => <StreamCard key={s.handle} s={s} />)}</div></section>}
      {mkts.length > 0 && <section><SectionHeader title="Predictions" count={mkts.length} /><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{mkts.map((m) => <MarketCard key={m.id} m={m} />)}</div></section>}
    </div>
  );
}
