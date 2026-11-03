import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { streamerByHandle } from "@/data/streamers";
import { categoryBySlug } from "@/data/categories";
import { ChannelAvatar, EmptyState, MarketCard, PageHeader, SectionHeader, StreamCard, Verified } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth";

export default function Following() {
  usePageMeta("Following");
  const { user, follows, markets } = useStore();
  const auth = useAuthDialog();
  if (!user)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={Heart} title="Log in to see who you follow" body="Follow creators to get go-live alerts and see their questions first." action={<Button onClick={() => auth.open("signin")}>Log in</Button>} />
      </div>
    );
  const list = (follows[user.id] ?? []).map((h) => streamerByHandle(h)!).filter(Boolean);
  const live = list.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const offline = list.filter((s) => !s.live);
  const theirMarkets = markets.filter((m) => list.some((s) => s.handle === m.handle) && (m.status === "open" || m.status === "awaiting"));
  return (
    <div className="mx-auto max-w-[1600px] space-y-12 px-4 py-8 md:px-8">
      <PageHeader title="Following" description={`${list.length} channels · ${live.length} live now`} />
      <section>
        <SectionHeader title="Live" count={live.length} />
        {live.length ? <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{live.map((s) => <StreamCard key={s.handle} s={s} />)}</div>
          : <EmptyState title="None of your channels are live" body="We’ll notify you the moment one goes live." action={<Button asChild variant="secondary"><Link to="/browse?tab=live">Find someone live</Link></Button>} />}
      </section>
      {theirMarkets.length > 0 && (
        <section>
          <SectionHeader title="Questions from channels you follow" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{theirMarkets.map((m) => <MarketCard key={m.id} m={m} />)}</div>
        </section>
      )}
      <section>
        <SectionHeader title="Offline" count={offline.length} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offline.map((s) => (
            <Link key={s.handle} to={`/${s.handle}`} className="flex gap-3 rounded-xl border bg-card p-4 hover:border-input">
              <ChannelAvatar s={s} size={48} />
              <span className="min-w-0"><span className="block font-semibold">{s.name} {s.verified && <Verified />}</span><span className="block text-xs text-muted-foreground">{categoryBySlug(s.category)?.name} · {s.schedule}</span><span className="mt-1 line-clamp-2 text-sm text-label">{s.bio}</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
