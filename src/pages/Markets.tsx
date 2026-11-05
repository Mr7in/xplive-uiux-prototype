import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { pool, type Market, type MarketStatus as MStatus } from "@/data/markets";
import { Link } from "react-router-dom";
import { clock, ledgerStats, paidAt, settledAt, when, winners } from "@/lib/ledger";
import { ResolutionBlock } from "@/components/trust";
import { categories, categoryBySlug } from "@/data/categories";
import { streamerByHandle } from "@/data/streamers";
import { EmptyState, MarketCard, MarketStatus, PageHeader } from "@/components/xp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compact, fmt, fmtUSD2 } from "@/lib/utils";
import { Trophy } from "lucide-react";

const TABS: { v: MStatus; label: string; empty: string }[] = [
  { v: "open", label: "Open", empty: "No questions are open right now. They appear here the moment a creator asks one." },
  { v: "awaiting", label: "Awaiting result", empty: "Nothing is waiting on a result." },
  { v: "settled", label: "Settled", empty: "No settled questions yet." },
  { v: "voided", label: "Voided", empty: "No voided questions." },
];

export default function Markets() {
  usePageMeta("Predictions", "Every open YES/NO question on balz, sorted by size and closing time.");
  const { markets } = useStore();
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as MStatus) || "open";
  const [sort, setSort] = React.useState("pool");
  const [cat, setCat] = React.useState("all");

  const list = (s: MStatus) =>
    markets
      .filter((m) => m.status === s && (cat === "all" || streamerByHandle(m.handle)?.category === cat))
      .sort((a, b) =>
        sort === "closing" ? (a.secondsLeft ?? a.closedMinsAgo ?? 0) - (b.secondsLeft ?? b.closedMinsAgo ?? 0) : sort === "predictors" ? b.predictors - a.predictors : pool(b) - pool(a)
      );

  const open = markets.filter((m) => m.status === "open");
  const st = ledgerStats(markets);
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      <PageHeader title="Predictions" description="Every open question, and a public ledger of every result: who resolved it, the evidence, and when winners were paid." />
      {/* Wall of impact: platform settlement data, computed from the same dataset as every other screen. */}
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-5">
        {[
          ["Open now", fmt(open.length)],
          ["Settled in the last 7 days", fmt(st.settledThisWeek)],
          ["Winners paid in the last 24 h", fmt(st.winnersPaid24h)],
          ["Paid out in the last 7 days", `${compact(Math.round(st.paidThisWeek))} USDC`],
          ["Median from result to payout", `${st.medianPayoutMin} min`],
        ].map(([k, v]) => (
          <div key={k} className="bg-card px-4 py-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 font-mono text-xl font-bold tabular">{v}</dd></div>
        ))}
      </dl>

      <Tabs value={status} onValueChange={(v) => setParams({ status: v })} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.v} value={t.v}>{t.label} <span className="font-mono text-xs text-muted-foreground">{markets.filter((m) => m.status === t.v).length}</span></TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2 pb-1">
            <div className="w-44">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger aria-label="Sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pool">Biggest pool</SelectItem>
                  <SelectItem value="closing">{status === "open" ? "Closing soon" : "Most recent"}</SelectItem>
                  <SelectItem value="predictors">Most predictors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {TABS.map((t) => (
          <TabsContent key={t.v} value={t.v}>
            {t.v === "settled" ? <Ledger rows={list("settled").sort((a, b) => settledAt(b) - settledAt(a))} /> : list(t.v).length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list(t.v).map((m) => <MarketCard key={m.id} m={m} />)}</div>
            ) : (
              <EmptyState icon={Trophy} title={cat === "all" ? t.empty : `Nothing in ${categoryBySlug(cat)?.name} here`} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {status !== "settled" && (
        <section className="mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Recent results</h2>
            <button type="button" onClick={() => setParams({ status: "settled" })} className="text-sm text-label hover:text-foreground">Full ledger →</button>
          </div>
          <Ledger rows={markets.filter((m) => m.status === "settled").sort((a, b) => settledAt(b) - settledAt(a)).slice(0, 8)} />
        </section>
      )}
    </div>
  );
}

/** Public ledger of settled questions. PLACEHOLDER: aggregates from settled questions and payouts. */
function Ledger({ rows }: { rows: Market[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  if (!rows.length) return <EmptyState icon={Trophy} title="No settled questions yet." />;
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground">
          <tr><th className="px-4 py-2.5 font-medium">Question</th><th className="px-3 py-2.5 font-medium">Resolved by</th><th className="px-3 py-2.5 font-medium">Result</th><th className="px-3 py-2.5 text-right font-medium">Pool</th><th className="px-3 py-2.5 text-right font-medium">Winners paid</th><th className="px-4 py-2.5 text-right font-medium">Paid</th></tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((m) => {
            const s = streamerByHandle(m.handle);
            const paid = paidAt(m);
            const isOpen = open === m.id;
            return (
              <React.Fragment key={m.id}>
                <tr className="cursor-pointer hover:bg-secondary/40" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
                  <td className="px-4 py-3"><span className="font-medium">{m.question}</span></td>
                  <td className="whitespace-nowrap px-3 py-3"><Link to={`/${m.handle}`} onClick={(e) => e.stopPropagation()} className="text-label hover:text-foreground">{s?.name}</Link> <span className="font-mono text-xs text-muted-foreground">{clock(settledAt(m))}</span></td>
                  <td className="px-3 py-3"><MarketStatus m={m} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono tabular">{fmtUSD2(pool(m))}</td>
                  <td className="px-3 py-3 text-right font-mono tabular">{m.dispute ? "held" : fmt(winners(m))}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">{m.dispute ? "On hold" : paid ? when(paid) : "Paying"}</td>
                </tr>
                {isOpen && <tr><td colSpan={6} className="px-4 pb-4"><ResolutionBlock m={m} /></td></tr>}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
