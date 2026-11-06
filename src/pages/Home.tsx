import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePageMeta } from "@/lib/meta";
import { streamers, streamerByHandle } from "@/data/streamers";
import { categories, categoryBySlug } from "@/data/categories";
import { pool, yesPct, type Market } from "@/data/markets";
import { ledgerStats, paidOut, winners } from "@/lib/ledger";
import { estimateBack } from "@/components/trust";
import { LiveGrid } from "@/components/LiveGrid";
import { LivePlayer } from "@/components/LivePlayer";
import { CategoryCard, ChannelAvatar, LiveBadge, MarketCard, MarketStatus, SectionHeader, SplitBar, StreamCard, ViewerCount, Verified, categoryStats } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { cn, compact, compactUSDC, fmt, fmtUSDC, timeLeft } from "@/lib/utils";

/** Scripted lifecycle of the featured question: open > your position > paid. Steps 2 and 3 are an example. */
function QuestionLifecycle({ m }: { m: Market }) {
  const s = streamerByHandle(m.handle)!;
  const [step, setStep] = React.useState(0);
  const [hold, setHold] = React.useState(false);
  React.useEffect(() => { setStep(0); }, [m.id]);
  React.useEffect(() => {
    if (hold) return;
    const t = window.setTimeout(() => setStep((x) => (x + 1) % 3), step === 0 ? 5000 : 4200);
    return () => window.clearTimeout(t);
  }, [step, hold]);
  const STAKE = 10;
  const back = estimateBack(m, "YES", STAKE);
  const steps = ["Question open", "Your position", "Paid"];
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <ol className="flex gap-1.5" aria-label="How a question plays out">
        {steps.map((l, i) => (
          <li key={l} className="flex-1">
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} className="w-full text-left">
              <span className={cn("block h-1 rounded-full", i <= step ? "bg-foreground" : "bg-secondary")} />
              <span className={cn("mt-1.5 block text-xs", step === i ? "font-semibold text-foreground" : "text-muted-foreground")}>{l}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-label">{s.name} asks</p>
      <p className="mt-1 font-display text-xl font-bold leading-tight text-balance">{m.question}</p>

      <div className="mt-4 min-h-[148px]" aria-live="polite">
        {step === 0 && (
          <div>
            <SplitBar m={m} />
            <div className="mt-2 flex justify-between font-mono text-xs tabular"><span className="text-yes">YES {yesPct(m)}%</span><span className="text-muted-foreground">{fmtUSDC(pool(m))}</span><span className="text-no">{100 - yesPct(m)}% NO</span></div>
            <p className="mt-3 text-sm text-label">Closes in <span className="font-mono font-bold tabular text-foreground">{timeLeft(m.secondsLeft ?? 0)}</span> · {fmt(m.predictors)} predictors</p>
          </div>
        )}
        {step === 1 && (
          <div className="rounded-xl border border-neon/40 p-3 text-sm">
            <p className="font-semibold">Your position <span className="font-normal text-muted-foreground">· example</span></p>
            <dl className="mt-2 space-y-1 font-mono tabular">
              <div className="flex justify-between"><dt className="font-sans text-label">Pick</dt><dd className="font-sans font-bold text-yes">YES</dd></div>
              <div className="flex justify-between"><dt className="font-sans text-label">Stake</dt><dd>{fmtUSDC(STAKE)}</dd></div>
              <div className="flex justify-between"><dt className="font-sans text-label">Back to you if YES</dt><dd>{fmtUSDC(back)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Estimate until the question closes, then locked.</p>
          </div>
        )}
        {step === 2 && (
          <div className="rounded-xl border border-neon/40 p-3 text-sm">
            <p className="font-display text-lg font-bold">Result: <span className="text-yes">YES</span> · <span className="text-neon">{fmtUSDC(back)}</span> back to you</p>
            <p className="mt-1 text-label">Resolved by {s.name}, who asked the question, with the moment from the stream as evidence.</p>
            <p className="mt-2 text-xs text-muted-foreground">Example. Winnings land in your wallet within minutes; anyone can dispute for 2 hours.</p>
          </div>
        )}
      </div>
      <Button asChild variant="outline" className="mt-auto"><Link to={`/${m.handle}`}>Predict on this question</Link></Button>
    </div>
  );
}

function Hero() {
  const { markets, user } = useStore();
  const st = ledgerStats(markets);
  const featured = React.useMemo(
    () => streamers.filter((s) => s.live && markets.some((m) => m.handle === s.handle && m.status === "open" && (m.secondsLeft ?? 0) > 240)).sort((a, b) => b.viewers - a.viewers).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [i, setI] = React.useState(0);
  const s = featured[i];
  const m = markets.find((x) => x.handle === s.handle && x.status === "open") ?? markets.find((x) => x.handle === s.handle)!;
  const cat = categoryBySlug(s.category)!;
  const go = (d: number) => setI((v) => (v + d + featured.length) % featured.length);
  const startHref = user ? `/${s.handle}` : "/signup";
  return (
    <section aria-labelledby="hero-title" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-2xl">
          <h1 id="hero-title" className="font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">Predict live streams</h1>
          <p className="mt-3 max-w-xl text-lg text-label">Watch live creators and back YES or NO on what happens next. Results are settled by the creator, with evidence.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to={startHref}>Start predicting</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/how-it-works">How payouts work</Link></Button>
          </div>
        </div>
        <Link to="/markets" className="text-sm text-label hover:text-foreground md:text-right">
          <span className="font-mono tabular text-foreground">{st.settledThisWeek}</span> questions settled this week<br className="hidden md:block" /><span className="md:hidden"> · </span>median payout <span className="font-mono tabular text-foreground">{st.medianPayoutMin} min</span> after the result
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative overflow-hidden rounded-2xl border bg-black">
          <Link to={`/${s.handle}`} className="block" aria-label={`Watch ${s.name}`}>
            <LivePlayer key={s.handle} s={s} className="rounded-none">
              <span className="absolute left-4 top-4 flex gap-2"><LiveBadge /><span className="rounded-md bg-black/80 px-2 py-0.5 text-white"><ViewerCount n={s.viewers} className="text-xs" /></span></span>
            </LivePlayer>
          </Link>
          <div className="flex items-center gap-3 border-t bg-card px-4 py-3">
            <ChannelAvatar s={s} size={40} />
            <div className="min-w-0 flex-1">
              <Link to={`/${s.handle}`} className="block truncate font-semibold hover:underline">{s.title}</Link>
              <p className="truncate text-sm text-label">{s.name} {s.verified && <Verified />} · {cat.name}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button size="icon-sm" variant="outline" onClick={() => go(-1)} aria-label="Previous featured channel"><ChevronLeft /></Button>
              <Button size="icon-sm" variant="outline" onClick={() => go(1)} aria-label="Next featured channel"><ChevronRight /></Button>
            </div>
          </div>
        </div>
        <QuestionLifecycle m={m} />
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(undefined);
  const { user, follows, markets } = useStore();
  const followed = user ? (follows[user.id] ?? []).map((h) => streamerByHandle(h)!).filter(Boolean) : [];
  const followedLive = followed.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const followedOffline = followed.filter((s) => !s.live);

  const topMarkets = markets.filter((m) => m.status === "open").sort((a, b) => pool(b) - pool(a)).slice(0, 8);
  const closingSoon = markets.filter((m) => m.status === "open").sort((a, b) => (a.secondsLeft ?? 0) - (b.secondsLeft ?? 0)).slice(0, 4);
  const justSettled = markets.filter((m) => m.status === "settled").sort((a, b) => (a.settledMinsAgo ?? 0) - (b.settledMinsAgo ?? 0)).slice(0, 5);

  const topCats = [...categories].sort((a, b) => categoryStats(b.slug).viewers - categoryStats(a.slug).viewers).slice(0, 7);
  const suggested = streamers.filter((s) => !followed.includes(s)).sort((a, b) => b.followers - a.followers).slice(0, 6);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-12 px-4 py-6 md:px-8">
      <Hero />

      {user && followedLive.length > 0 && (
        <section>
          <SectionHeader title="Live channels you follow" href="/following" count={followedLive.length} />
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {followedLive.slice(0, 4).map((s) => <StreamCard key={s.handle} s={s} />)}
          </div>
        </section>
      )}


      <LiveGrid limit={8} />

      <section>
        <SectionHeader title="Top predictions right now" href="/markets" linkLabel="All predictions" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topMarkets.map((m) => <MarketCard key={m.id} m={m} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="Categories we think you’ll like" href="/browse" linkLabel="Browse all 20" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {topCats.map((c) => <CategoryCard key={c.slug} c={c} />)}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 [&>*]:min-w-0">
        <section>
          <SectionHeader title="Closing soon" href="/markets" />
          <ul className="divide-y rounded-xl border">
            {closingSoon.map((m) => {
              const s = streamerByHandle(m.handle)!;
              return (
                <li key={m.id}>
                  <Link to={`/${m.handle}`} className="flex items-center gap-3 p-3.5 hover:bg-surface">
                    <ChannelAvatar s={s} size={36} />
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{m.question}</span><span className="text-sm text-muted-foreground">{s.name} · {fmt(m.predictors)} predictors</span></span>
                    <span className="font-mono text-sm font-bold tabular">{timeLeft(m.secondsLeft ?? 0)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <SectionHeader title="Just settled" href="/markets?status=settled" />
          <ul className="divide-y rounded-xl border">
            {justSettled.map((m) => {
              const s = streamerByHandle(m.handle)!;
              return (
                <li key={m.id}>
                  <Link to={`/${m.handle}`} className="flex items-center gap-3 p-3.5 hover:bg-surface">
                    <ChannelAvatar s={s} size={36} ring={false} />
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{m.question}</span><span className="text-sm text-muted-foreground">{s.name} · {fmt(winners(m))} winners paid {compactUSDC(paidOut(m))}</span></span>
                    <MarketStatus m={m} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section>
        <SectionHeader title={user ? "Creators you might like" : "Popular creators"} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggested.map((s) => (
            <Link key={s.handle} to={`/${s.handle}`} className="flex gap-3 rounded-xl border bg-card p-4 hover:border-input">
              <ChannelAvatar s={s} size={52} />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-semibold">{s.name} {s.verified && <Verified />} {s.live && <LiveBadge className="ml-1 scale-90" />}</span>
                <span className="block text-xs text-muted-foreground">{compact(s.followers)} followers · {categoryBySlug(s.category)?.name}</span>
                <span className="mt-1 line-clamp-2 text-sm text-label">{s.bio}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {user && followedOffline.length > 0 && (
        <section>
          <SectionHeader title="Offline channels you follow" href="/following" />
          <div className="flex flex-wrap gap-3">
            {followedOffline.map((s) => (
              <Link key={s.handle} to={`/${s.handle}`} className="flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 hover:border-input">
                <ChannelAvatar s={s} size={32} ring={false} />
                <span className="text-sm"><span className="font-semibold">{s.name}</span> <span className="text-muted-foreground">· {s.schedule}</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
