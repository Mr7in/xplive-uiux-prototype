import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Download, Loader2, PenLine, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore, backToYou } from "@/lib/store";
import { positionOutcome, useReceipt } from "@/components/trust";
import { at, when } from "@/lib/ledger";
import { type Market } from "@/data/markets";
import { streamerByHandle } from "@/data/streamers";
import { EmptyState, PageHeader, SideChip, Stat } from "@/components/xp";
import { NetworkChip, TxLink, useWalletUI } from "@/components/WalletDialogs";
import { Tabs, TabsContent, TabsList, TabsTrigger, PillTabsList, PillTabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthDialog } from "@/components/auth";
import { NETWORK, short } from "@/lib/chain";
import { cn, fmtUSD2, fmtUSDC, timeLeft } from "@/lib/utils";

function PayoutAddressCard() {
  const { payoutAddress, setPayoutAddress, verifyPayoutAddress, wallet } = useStore();
  const ui = useWalletUI();
  const [addr, setAddr] = React.useState("");
  const [signing, setSigning] = React.useState(false);
  const valid = /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Payout address {payoutAddress?.verified && <Badge variant="yes"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}</CardTitle>
        <CardDescription>Where withdrawals and winnings you take out are sent. A new address must prove you control it, and a replacement waits 72 hours before taking over. That delay protects you if someone else gets into your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {!payoutAddress ? (
          <>
            <div className="grid gap-2">
              <label htmlFor="payout" className="text-sm font-medium">{NETWORK.name} address</label>
              <Input id="payout" value={addr} onChange={(e) => setAddr(e.target.value.trim())} placeholder="0x…" className="font-mono" />
              <p className="text-xs text-muted-foreground">A USDC address on {NETWORK.name}. Double-check it: transfers can’t be reversed.</p>
              {addr && !valid && <p className="text-xs text-coral-soft">That doesn’t look like a {NETWORK.name} address. It starts with 0x and has 42 characters.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!valid} onClick={() => { setPayoutAddress(addr); setAddr(""); }}>Add address</Button>
              <Button variant="outline" onClick={() => (wallet ? setPayoutAddress(wallet.address) : ui.open("add"))}><WalletIcon /> {wallet ? "Use my connected wallet" : "Connect a wallet"}</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
            <div className="min-w-0 flex-1">
              <p className="break-all font-mono text-sm">{payoutAddress.address}</p>
              <p className="text-xs text-muted-foreground">{payoutAddress.verified ? "Verified · ready for withdrawals" : "Not verified yet: sign a message from this address to prove it’s yours."}</p>
            </div>
            {!payoutAddress.verified ? (
              <Button disabled={signing} onClick={() => { setSigning(true); window.setTimeout(() => { verifyPayoutAddress(); setSigning(false); toast.success("Payout address verified"); }, 1200); }}>
                {signing ? <><Loader2 className="animate-spin" /> Sign in your wallet…</> : <><PenLine /> Verify by signing</>}
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => toast("Replacement requested", { description: "The new address takes over in 72 hours." })}>Replace</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Wallet() {
  usePageMeta("Wallet");
  const { user, balance, positions, markets, transfers, wallet, disconnectWallet, depositAddress } = useStore();
  const auth = useAuthDialog();
  const ui = useWalletUI();
  const receipt = useReceipt();
  const [filter, setFilter] = React.useState("all");
  const [kind, setKind] = React.useState("all");
  const [dispute, setDispute] = React.useState<Market | null>(null);
  if (!user) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState icon={WalletIcon} title="Log in to see your wallet" action={<Button onClick={() => auth.open("signin")}>Log in</Button>} /></div>;

  const rows = positions.map((p) => ({ p, m: markets.find((m) => m.id === p.marketId)! })).filter((r) => r.m);
  const shown = rows.filter(({ m, p }) => { const k = positionOutcome(m, p).key; return filter === "all" || (filter === "open" && (k === "open" || k === "awaiting")) || filter === k; });
  const openRows = rows.filter((r) => (r.m.status === "open" || r.m.status === "awaiting") && r.p.tx !== "failed");
  const atStake = openRows.reduce((a, r) => a + r.p.amount, 0);
  const settled = rows.filter((r) => r.m.status === "settled" && !r.m.dispute && r.p.tx === "confirmed");
  const won = settled.filter((r) => r.m.outcome === r.p.side);
  const net = settled.reduce((a, r) => a + (r.m.outcome === r.p.side ? backToYou(r.m, r.p) - r.p.amount : -r.p.amount), 0);
  const pendingIn = transfers.filter((t) => t.kind === "deposit" && t.state === "pending").reduce((a, t) => a + t.amount, 0);
  const tx = transfers.filter((t) => kind === "all" || t.kind === kind || (kind === "predictions" && (t.kind === "prediction" || t.kind === "payout" || t.kind === "refund")) || (kind === "funding" && (t.kind === "deposit" || t.kind === "withdrawal" || t.kind === "faucet")));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <PageHeader title="Wallet & predictions" description={<span className="inline-flex flex-wrap items-center gap-2">Your USDC balance, deposits and withdrawals, and every prediction you’ve made. <NetworkChip /></span>} actions={<Button asChild variant="ghost" size="sm"><Link to="/settings?tab=limits">Limits &amp; self-exclusion</Link></Button>} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">USDC balance</p>
                <p className="mt-1 font-mono text-4xl font-bold tabular md:text-5xl">{fmtUSD2(balance)} <span className="text-lg text-muted-foreground">USDC</span></p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fmtUSDC(atStake)} in open predictions{pendingIn > 0 && <> · <span className="text-warn">{fmtUSDC(pendingIn)} arriving</span></>}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => ui.open("withdraw")}><ArrowUpRight /> Withdraw</Button>
                <Button onClick={() => ui.open("add")}><ArrowDownLeft /> Add funds</Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t pt-4 text-sm">
              {wallet ? (
                <>
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yes-fill" /> {wallet.provider} connected · <span className="font-mono">{short(wallet.address)}</span> · {fmtUSDC(wallet.balance)}</span>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet}>Disconnect</Button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">No wallet connected.</span>
                  <Button variant="link" size="sm" onClick={() => ui.open("add")}>Connect a wallet</Button>
                </>
              )}
              <span className="ml-auto text-xs text-muted-foreground">Your balz wallet: <span className="font-mono">{short(depositAddress)}</span></span>
            </div>
          </CardContent>
        </Card>
        <PayoutAddressCard />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="In open predictions" value={fmtUSD2(atStake)} sub={`${openRows.length} positions · USDC`} />
        <Stat label="Net from settled" value={`${net >= 0 ? "+" : ""}${fmtUSD2(net)}`} tone={net >= 0 ? "neon" : "danger"} sub={`${won.length} won · ${settled.length - won.length} lost`} />
        <Stat label="Hit rate" value={`${settled.length ? Math.round((won.length / settled.length) * 100) : 0}%`} sub="of settled questions" />
        <Stat label="Deposited this month" value={fmtUSD2(transfers.filter((t) => t.kind === "deposit" && t.state === "confirmed").reduce((a, t) => a + t.amount, 0))} sub="USDC" />
      </div>

      <Tabs defaultValue="predictions" className="mt-8">
        <TabsList>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tips">Tips sent</TabsTrigger>
        </TabsList>
        <TabsContent value="predictions">
          <Tabs value={filter} onValueChange={setFilter}>
            <PillTabsList className="mb-4" aria-label="Filter">{[["all", "All"], ["open", "Open"], ["won", "Won"], ["lost", "Lost"], ["refunded", "Refunded"]].map(([v, l]) => <PillTabsTrigger key={v} value={v}>{l} <span className="ml-1 font-mono text-xs tabular opacity-70">{rows.filter(({ m, p }) => { const k = positionOutcome(m, p).key; return v === "all" || (v === "open" && (k === "open" || k === "awaiting")) || v === k; }).length}</span></PillTabsTrigger>)}</PillTabsList>
          </Tabs>
          {shown.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Your pick</TableHead><TableHead className="text-right">Stake</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Back to you</TableHead><TableHead><span className="sr-only">Receipt</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {shown.map(({ p, m }) => {
                  const o = positionOutcome(m, p);
                  const canDispute = m.status === "settled" && !m.dispute && (m.settledMinsAgo ?? 999) < 120 && p.tx === "confirmed";
                  const back = o.key === "open" ? <>est. {fmtUSD2(o.back)}</> : o.key === "awaiting" ? <>{fmtUSD2(o.back)} if right</> : o.key === "won" ? <span className="font-bold text-neon">{fmtUSD2(o.back)}</span> : o.key === "refunded" ? fmtUSD2(o.back) : o.key === "held" ? "held" : o.key === "failed" ? "–" : "0.00";
                  return (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => receipt.open(p.id)}>
                      <TableCell className="min-w-[240px]"><span className="font-semibold">{m.question}</span><span className="block text-xs text-muted-foreground">{streamerByHandle(m.handle)?.name} · {when(at(p.placedMinsAgo, p.placedAt))}</span></TableCell>
                      <TableCell><SideChip side={p.side} /></TableCell>
                      <TableCell className="text-right font-mono tabular">{fmtUSD2(p.amount)}</TableCell>
                      <TableCell className="min-w-[170px]">
                        <span className="flex items-center gap-1.5 font-semibold">{(p.tx === "submitting" || p.tx === "recorded") && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{p.tx === "submitting" ? "Submitting" : p.tx === "recorded" ? "Recorded" : o.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.status === "open" ? <>Closes in <span className="font-mono tabular">{timeLeft(m.secondsLeft ?? 0)}</span> · estimate moves until then</> : o.key === "awaiting" ? "Locked · creator posts the result" : o.key === "won" || o.key === "lost" ? `Result ${m.outcome}` : o.line}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular">{back}</TableCell>
                      <TableCell className="whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        {canDispute && <Button size="sm" variant="ghost" onClick={() => setDispute(m)}>Dispute</Button>}
                        <Button size="sm" variant="outline" onClick={() => receipt.open(p.id)}>Receipt</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : <EmptyState title="Nothing here yet" body="Your predictions appear here as soon as you make one." action={<Button asChild><Link to="/markets">Find a question</Link></Button>} />}
        </TabsContent>
        <TabsContent value="transactions">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs value={kind} onValueChange={setKind}><PillTabsList>{[["all", "All"], ["funding", "Deposits & withdrawals"], ["predictions", "Predictions & winnings"], ["tip", "Tips"]].map(([v, l]) => <PillTabsTrigger key={v} value={v}>{l}</PillTabsTrigger>)}</PillTabsList></Tabs>
            <Button variant="secondary" size="sm" onClick={() => toast("Export started", { description: "We’ll email you a CSV." })}><Download /> Export CSV</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>When</TableHead><TableHead>What</TableHead><TableHead>Status</TableHead><TableHead>Transaction</TableHead><TableHead className="text-right">USDC</TableHead></TableRow></TableHeader>
            <TableBody>{tx.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{when(at(t.minsAgo, t.at))}</TableCell>
                <TableCell>{t.label}</TableCell>
                <TableCell>{t.state === "confirmed" ? <span className="inline-flex items-center gap-1 text-xs text-yes"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmed</span> : t.state === "pending" ? <span className="inline-flex items-center gap-1 text-xs text-warn"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.confirmations !== undefined ? `${t.confirmations} confirmations` : "Pending"}</span> : <span className="text-xs text-coral-soft">Failed</span>}</TableCell>
                <TableCell><TxLink hash={t.txHash} pending={t.state === "pending"} /></TableCell>
                <TableCell className={cn("text-right font-mono tabular", t.amount > 0 && "text-neon")}>{t.amount > 0 ? "+" : ""}{fmtUSD2(t.amount)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="tips">
          <Table>
            <TableHeader><TableRow><TableHead>To</TableHead><TableHead>When</TableHead><TableHead>Transaction</TableHead><TableHead className="text-right">USDC</TableHead></TableRow></TableHeader>
            <TableBody>{transfers.filter((t) => t.kind === "tip").map((t) => <TableRow key={t.id}><TableCell className="font-semibold">{t.label.replace("Tip to ", "")}</TableCell><TableCell className="text-muted-foreground">{when(at(t.minsAgo, t.at))}</TableCell><TableCell><TxLink hash={t.txHash} /></TableCell><TableCell className="text-right font-mono">{fmtUSD2(Math.abs(t.amount))}</TableCell></TableRow>)}</TableBody>
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">Tips go straight to the creator in USDC. Creators keep 95%.</p>
        </TabsContent>
      </Tabs>

      <Dialog open={!!dispute} onOpenChange={(o) => !o && setDispute(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dispute this result</DialogTitle><DialogDescription>{dispute?.question} · settled {dispute?.outcome}. An admin reviews the stream recording. If you’re right, everyone is paid on the corrected result.</DialogDescription></DialogHeader>
          <Textarea placeholder="What happened on stream? Include a timestamp if you can." aria-label="Your reason" />
          <p className="text-xs text-muted-foreground">Disputes hold a 5.00 USDC bond, returned if the result is changed.</p>
          <DialogFooter><Button variant="secondary" onClick={() => setDispute(null)}>Cancel</Button><Button onClick={() => { setDispute(null); toast.success("Dispute filed", { description: "We’ll reply within 24 hours." }); }}>File dispute</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
