import { Link, useParams } from "react-router-dom";
import { Heart, Play } from "lucide-react";
import { LivePlayer } from "@/components/LivePlayer";
import { toast } from "sonner";
import { usePageMeta } from "@/lib/meta";
import { categoryBySlug } from "@/data/categories";
import { streamersInCategory } from "@/data/streamers";
import { BoxArt } from "@/components/brand/BoxArt";
import { ChannelAvatar, EmptyState, MarketCard, SectionHeader, StreamCard, Verified, categoryStats } from "@/components/xp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/components/auth";
import { compact } from "@/lib/utils";
import NotFound from "./NotFound";

export default function Category() {
  const { slug = "" } = useParams();
  const c = categoryBySlug(slug);
  usePageMeta(c?.name, c?.description);
  const { markets } = useStore();
  const guard = useRequireAuth();
  if (!c) return <NotFound />;
  const list = streamersInCategory(c.slug);
  const live = list.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const offline = list.filter((s) => !s.live);
  const st = categoryStats(c.slug);
  const catMarkets = markets.filter((m) => list.some((s) => s.handle === m.handle));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      <div className="relative -mx-4 -mt-8 overflow-hidden md:-mx-8">
        {live[0] && (
          <div className="absolute inset-0" aria-hidden>
            <LivePlayer s={live[0]} zoom={1.25} className="h-full w-full rounded-none aspect-auto" />
            <div className="absolute inset-0 bg-background/80" />
          </div>
        )}
        <div className="relative flex flex-col gap-6 px-4 pb-6 pt-16 sm:flex-row sm:items-end md:px-8 md:pt-28">
          <div className="w-36 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 sm:w-44"><div className="aspect-[3/4]"><BoxArt c={c} /></div></div>
          <div className="min-w-0 flex-1">
            <Link to="/browse" className="text-sm text-label hover:text-foreground">Categories / {c.group}</Link>
            <h1 className="mt-1 font-display text-4xl font-extrabold leading-tight md:text-5xl">{c.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-label">
              <span><span className="font-mono font-bold text-foreground">{compact(st.viewers)}</span> watching</span>
              <span><span className="font-mono font-bold text-foreground">{compact(c.followers)}</span> followers</span>
              <span>{st.live} live now</span>
            </p>
            <p className="mt-2 max-w-2xl text-label">{c.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {c.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
              {c.adult && <Badge variant="warning">18+ · gamble responsibly</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {live[0] && <Button asChild variant="secondary"><Link to={`/${live[0].handle}`}><Play /> Watch {live[0].name}</Link></Button>}
            <Button onClick={() => guard(() => toast.success(`Following ${c.name}`))}><Heart /> Follow</Button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <SectionHeader title="Live channels" count={live.length} />
        {live.length ? <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{live.map((s) => <StreamCard key={s.handle} s={s} />)}</div>
          : <EmptyState title={`Nobody is live in ${c.name} right now`} body="Follow the category and we’ll tell you when someone goes live." />}
      </section>

      {catMarkets.length > 0 && (
        <section className="mt-12">
          <SectionHeader title={`Predictions in ${c.name}`} href="/markets" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{catMarkets.map((m) => <MarketCard key={m.id} m={m} />)}</div>
        </section>
      )}

      {offline.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Offline creators" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offline.map((s) => (
              <Link key={s.handle} to={`/${s.handle}`} className="flex gap-3 rounded-xl border bg-card p-4 hover:border-input">
                <ChannelAvatar s={s} size={48} />
                <span className="min-w-0"><span className="block font-semibold">{s.name} {s.verified && <Verified />}</span><span className="block text-xs text-muted-foreground">Next: {s.schedule}</span><span className="mt-1 line-clamp-2 text-sm text-label">{s.bio}</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
