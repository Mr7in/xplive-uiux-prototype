import { LiveGrid } from "@/components/LiveGrid";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { categories, categoryBySlug } from "@/data/categories";
import { streamers } from "@/data/streamers";
import { CategoryCard, PageHeader, StreamCard, categoryStats, EmptyState } from "@/components/xp";
import { Tabs, TabsContent, TabsList, TabsTrigger, PillTabsList, PillTabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GROUPS = ["All", "Games", "Casino", "IRL", "Sports"];

export default function Browse() {
  usePageMeta("Browse", "Browse 20 categories of live streams: esports, slots, IRL, marble racing and more.");
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "live" ? "live" : "categories";
  const [group, setGroup] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("viewers");

  const cats = categories
    .filter((c) => (group === "All" || c.group === group) && c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "az" ? a.name.localeCompare(b.name) : sort === "followers" ? b.followers - a.followers : categoryStats(b.slug).viewers - categoryStats(a.slug).viewers));
  const live = streamers
    .filter((s) => s.live && (group === "All" || categoryBySlug(s.category)?.group === group) && (s.name + s.title).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.viewers - a.viewers);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      <PageHeader title="Browse" description="Find something live, or a question worth calling." />
      <Tabs value={tab} onValueChange={(v) => setParams(v === "live" ? { tab: "live" } : {})} className="mt-6">
        <TabsList>
          <TabsTrigger value="categories">Categories <span className="font-mono text-xs text-muted-foreground">{categories.length}</span></TabsTrigger>
          <TabsTrigger value="live">Live channels <span className="font-mono text-xs text-muted-foreground">{streamers.filter((s) => s.live).length}</span></TabsTrigger>
        </TabsList>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "live" ? "Filter channels" : "Filter categories"} aria-label="Filter" className="pl-9" />
          </div>
          <Tabs value={group} onValueChange={setGroup}>
            <PillTabsList aria-label="Category group">{GROUPS.map((g) => <PillTabsTrigger key={g} value={g}>{g}</PillTabsTrigger>)}</PillTabsList>
          </Tabs>
          {tab === "categories" && (
            <div className="ml-auto w-48">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger aria-label="Sort categories"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewers">Most watching</SelectItem>
                  <SelectItem value="followers">Most followed</SelectItem>
                  <SelectItem value="az">A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <TabsContent value="categories">
          {cats.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">{cats.map((c) => <CategoryCard key={c.slug} c={c} />)}</div>
          ) : <EmptyState title="No categories match" body="Try a shorter search, or switch the group filter back to All." />}
        </TabsContent>
        <TabsContent value="live">
          <LiveGrid title="Live channels" query={q} group={group} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
