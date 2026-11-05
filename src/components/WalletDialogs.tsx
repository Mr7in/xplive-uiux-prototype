import * as React from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, Copy, Droplets, Loader2, LogOut, Wallet as WalletIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useStore, type WalletProvider } from "@/lib/store";
import { NETWORK, short } from "@/lib/chain";
import { cn, fmtUSD2, fmtUSDC } from "@/lib/utils";

type Panel = "add" | "withdraw" | null;
const Ctx = React.createContext<{ open: (p: Exclude<Panel, null>) => void } | null>(null);

export function WalletUIProvider({ children }: { children: React.ReactNode }) {
  const [panel, setPanel] = React.useState<Panel>(null);
  const value = React.useMemo(() => ({ open: (p: Exclude<Panel, null>) => setPanel(p) }), []);
  return (
    <Ctx.Provider value={value}>
      {children}
      <AddFundsDialog open={panel === "add"} onOpenChange={(o) => setPanel(o ? "add" : null)} />
      <WithdrawDialog open={panel === "withdraw"} onOpenChange={(o) => setPanel(o ? "withdraw" : null)} />
    </Ctx.Provider>
  );
}

export function useWalletUI() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useWalletUI outside provider");
  return c;
}

/** Testnet / mainnet chip. */
export function NetworkChip({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-label", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-polygon" />
      {NETWORK.name}{NETWORK.testnet && " · testnet"}
    </span>
  );
}

/**
 * Transaction reference. In the mock it opens a preview of the explorer record inside the prototype
 * (/tx/:hash), so it never lands on a "not found" page. A hash that is not confirmed yet shows
 * "On-chain record pending" with no link.
 * PLACEHOLDER: in the build, link only confirmed hashes to `${NETWORK.explorer}/tx/<hash>` (amoy.polygonscan.com in dev).
 */
export function TxLink({ hash, className, pending, label }: { hash: string; className?: string; pending?: boolean; label?: string }) {
  if (pending) return <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}><Loader2 className="h-3 w-3 animate-spin" /> On-chain record pending</span>;
  return (
    <Link to={`/tx/${hash}`} className={cn("inline-flex items-center gap-1 font-mono text-xs text-label underline-offset-2 hover:text-foreground hover:underline", className)} title={`View on Polygonscan (${NETWORK.testnet ? "testnet" : NETWORK.name})`}>
      {label ?? short(hash, 8, 6)} <span aria-hidden>↗</span><span className="sr-only">(opens the explorer record)</span>
    </Link>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-2">
      <Input ref={ref} readOnly value={value} aria-label={label} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          try { await navigator.clipboard.writeText(value); setDone(true); window.setTimeout(() => setDone(false), 1500); }
          catch { ref.current?.select(); toast("Press Ctrl+C or ⌘C to copy"); }
        }}
      >
        {done ? <Check /> : <Copy />} {done ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function Qr({ value }: { value: string }) {
  const [svg, setSvg] = React.useState("");
  React.useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 1, color: { dark: "#0e1019", light: "#ffffff" } }).then((s) => { if (alive) setSvg(s); });
    return () => { alive = false; };
  }, [value]);
  return <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-white p-2 [&_svg]:h-full [&_svg]:w-full" role="img" aria-label="QR code of your deposit address" dangerouslySetInnerHTML={{ __html: svg }} />;
}

const WALLETS: { name: WalletProvider; hint: string }[] = [
  { name: "MetaMask", hint: "Browser extension" },
  { name: "Coinbase Wallet", hint: "Extension or app" },
  { name: "Rabby", hint: "Browser extension" },
  { name: "WalletConnect", hint: "Scan with a mobile wallet" },
];

function ConnectTab() {
  const { wallet, connectWallet, disconnectWallet, depositFromWallet, transfers } = useStore();
  const [connecting, setConnecting] = React.useState<WalletProvider | null>(null);
  const [amount, setAmount] = React.useState("25");
  const [step, setStep] = React.useState<"idle" | "approve" | "sent">("idle");
  const [hash, setHash] = React.useState("");
  const amt = Number(amount) || 0;
  const tx = transfers.find((t) => t.txHash === hash);

  if (!wallet)
    return (
      <div className="grid gap-2">
        {WALLETS.map((w) => (
          <button
            key={w.name}
            disabled={!!connecting}
            onClick={async () => { setConnecting(w.name); await connectWallet(w.name); setConnecting(null); toast.success(`${w.name} connected`); }}
            className="flex h-14 items-center gap-3 rounded-xl border px-4 text-left transition hover:border-input hover:bg-secondary disabled:opacity-60"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><WalletIcon className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block font-semibold">{w.name}</span><span className="text-xs text-muted-foreground">{w.hint}</span></span>
            {connecting === w.name && <Loader2 className="h-4 w-4 animate-spin" />}
          </button>
        ))}
        <p className="pt-1 text-xs text-muted-foreground">Your wallet will ask to switch to {NETWORK.name} (chain {NETWORK.chainId}) if it’s on another network.</p>
      </div>
    );

  if (step === "sent" && tx)
    return (
      <div className="grid gap-4 py-2 text-center">
        {tx.state === "confirmed" ? <CheckCircle2 className="mx-auto h-10 w-10 text-yes" /> : <Loader2 className="mx-auto h-10 w-10 animate-spin text-neon" />}
        <div>
          <p className="font-display text-xl font-bold">{tx.state === "confirmed" ? `${fmtUSDC(tx.amount)} added` : "Waiting for the block to finalise"}</p>
          <p className="text-sm text-muted-foreground">{tx.state === "confirmed" ? "It’s in your balance and ready to use." : `${tx.confirmations ?? 0} of ${NETWORK.confirmations} confirmations`}</p>
        </div>
        <Progress value={((tx.confirmations ?? 0) / NETWORK.confirmations) * 100} />
        <TxLink hash={hash} className="mx-auto" />
        <Button variant="secondary" onClick={() => { setStep("idle"); setHash(""); }}>{tx.state === "confirmed" ? "Add more" : "Deposit again"}</Button>
      </div>
    );

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 rounded-xl border p-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><WalletIcon className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{wallet.provider} · <span className="font-mono">{short(wallet.address)}</span></p>
          <p className="text-xs text-muted-foreground">Wallet balance {fmtUSDC(wallet.balance)} on {NETWORK.name}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Disconnect wallet" onClick={disconnectWallet}><LogOut /></Button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dep-amt">Amount</Label>
        <div className="relative"><Input id="dep-amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, "").slice(0, 9))} className="h-12 pr-16 font-mono text-lg" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">USDC</span></div>
        <div className="flex gap-1.5">{[10, 25, 50].map((v) => <Button key={v} type="button" size="sm" variant="outline" onClick={() => setAmount(String(v))}>{v}</Button>)}<Button type="button" size="sm" variant="outline" onClick={() => setAmount(fmtUSD2(wallet.balance).replace(/,/g, ""))}>Max</Button></div>
        {amt > wallet.balance && <p className="text-sm text-coral-soft">Your wallet only has {fmtUSDC(wallet.balance)}.</p>}
        {amt > 0 && amt < 1 && <p className="text-sm text-coral-soft">The minimum deposit is 1.00 USDC.</p>}
      </div>
      <Button
        size="lg"
        disabled={amt < 1 || amt > wallet.balance || step === "approve"}
        onClick={() => {
          setStep("approve");
          window.setTimeout(() => { setHash(depositFromWallet(amt)); setStep("sent"); }, 1400);
        }}
      >
        {step === "approve" ? <><Loader2 className="animate-spin" /> Confirm in {wallet.provider}…</> : `Deposit ${fmtUSDC(amt)}`}
      </Button>
      <p className="text-xs text-muted-foreground">You pay a small network fee in POL. Funds are credited after {NETWORK.confirmations} confirmations, usually under a minute.</p>
    </div>
  );
}

function ManualTab() {
  const { depositAddress, reportManualDeposit, transfers } = useStore();
  const pending = transfers.filter((t) => t.kind === "deposit").slice(0, 3);
  return (
    <div className="grid gap-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Qr value={depositAddress} />
        <div className="grid w-full gap-2">
          <Label>Your balz deposit address</Label>
          <CopyField value={depositAddress} label="Deposit address" />
          <div className="flex gap-2 rounded-lg border border-warn/40 bg-warn/10 p-3 text-xs text-warn">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Send only <b>USDC on {NETWORK.name}</b>. Other tokens, or USDC on another network, can’t be recovered.</span>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Network</dt><dd className="text-right">{NETWORK.name} · chain {NETWORK.chainId}</dd>
        <dt className="text-muted-foreground">Token contract</dt><dd className="text-right font-mono">{short(NETWORK.usdc)}</dd>
        <dt className="text-muted-foreground">Minimum</dt><dd className="text-right">1.00 USDC</dd>
        <dt className="text-muted-foreground">Credited after</dt><dd className="text-right">{NETWORK.confirmations} confirmations</dd>
      </dl>
      <Button variant="secondary" onClick={() => { reportManualDeposit(); toast("Watching for your deposit", { description: "We’ll credit it as soon as the block is final." }); }}>I’ve sent it</Button>
      {pending.length > 0 && (
        <div className="grid gap-2 border-t pt-3">
          <p className="text-sm font-semibold">Recent deposits</p>
          {pending.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-mono">{fmtUSDC(t.amount)}</span>
              <TxLink hash={t.txHash} />
              <span className={cn("text-xs", t.state === "confirmed" ? "text-yes" : "text-warn")}>{t.state === "confirmed" ? "Credited" : `${t.confirmations ?? 0}/${NETWORK.confirmations}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddFundsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { claimFaucet, faucetClaimedToday } = useStore();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-1"><NetworkChip /></div>
          <DialogTitle>Add funds</DialogTitle>
          <DialogDescription>Send USDC on {NETWORK.name}{NETWORK.testnet ? " (testnet)" : ""} to your balz wallet. It’s credited once the block is final, usually within a minute.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="connect">
          <TabsList className="grid grid-cols-2 border-0 bg-secondary p-1 rounded-lg">
            <TabsTrigger value="connect" className="h-9 justify-center rounded-md border-0 data-[state=active]:bg-background">Connect wallet</TabsTrigger>
            <TabsTrigger value="manual" className="h-9 justify-center rounded-md border-0 data-[state=active]:bg-background">Send manually</TabsTrigger>
          </TabsList>
          <TabsContent value="connect"><ConnectTab /></TabsContent>
          <TabsContent value="manual"><ManualTab /></TabsContent>
        </Tabs>
        {NETWORK.testnet && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed p-3">
            <Droplets className="h-5 w-5 text-label" />
            <div className="flex-1"><p className="text-sm font-semibold">Need test USDC?</p><p className="text-xs text-muted-foreground">Testnet only. Once a day.</p></div>
            <Button size="sm" variant="secondary" disabled={faucetClaimedToday} onClick={() => { claimFaucet(); toast.success("10.00 test USDC on its way"); }}>{faucetClaimedToday ? "Claimed today" : "Get 10.00 USDC"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function WithdrawDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { balance, payoutAddress, withdraw, transfers } = useStore();
  const [amount, setAmount] = React.useState("");
  const [hash, setHash] = React.useState("");
  const amt = Number(amount) || 0;
  const tx = transfers.find((t) => t.txHash === hash);
  React.useEffect(() => { if (!open) { setHash(""); setAmount(""); } }, [open]);
  const ready = payoutAddress?.verified;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1"><NetworkChip /></div>
          <DialogTitle>Withdraw</DialogTitle>
          <DialogDescription>USDC is sent to your verified payout address on {NETWORK.name}. Network fees are covered by balz.</DialogDescription>
        </DialogHeader>
        {!ready ? (
          <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
            {payoutAddress ? "Verify your payout address first: sign the message in your wallet from the Wallet page." : "Add a payout address on the Wallet page before you withdraw."}
          </div>
        ) : hash && tx ? (
          <div className="grid gap-3 text-center">
            {tx.state === "confirmed" ? <CheckCircle2 className="mx-auto h-10 w-10 text-yes" /> : <Loader2 className="mx-auto h-10 w-10 animate-spin text-neon" />}
            <p className="font-display text-xl font-bold">{tx.state === "confirmed" ? "Sent" : "Sending…"}</p>
            <p className="text-sm text-muted-foreground">{fmtUSDC(Math.abs(tx.amount))} to <span className="font-mono">{short(payoutAddress!.address)}</span></p>
            <TxLink hash={hash} className="mx-auto" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex justify-between text-sm"><Label htmlFor="wd-amt">Amount</Label><span className="text-xs text-muted-foreground">Available {fmtUSDC(balance)}</span></div>
              <div className="relative"><Input id="wd-amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, "").slice(0, 9))} className="h-12 pr-24 font-mono text-lg" placeholder="0.00" /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neon" onClick={() => setAmount(String(balance))}>Max</button></div>
              {amt > balance && <p className="text-sm text-coral-soft">That’s more than your available balance.</p>}
              {amt > 0 && amt < 5 && <p className="text-sm text-coral-soft">The minimum withdrawal is 5.00 USDC.</p>}
            </div>
            <dl className="grid grid-cols-2 gap-y-1 rounded-xl bg-secondary p-3 text-sm">
              <dt className="text-muted-foreground">To</dt><dd className="text-right font-mono">{short(payoutAddress!.address)}</dd>
              <dt className="text-muted-foreground">Network fee</dt><dd className="text-right">Paid by balz</dd>
              <dt className="text-muted-foreground">You receive</dt><dd className="text-right font-mono font-bold">{fmtUSDC(amt)}</dd>
            </dl>
            <Button size="lg" disabled={amt < 5 || amt > balance} onClick={() => setHash(withdraw(amt))}>Withdraw {fmtUSDC(amt)}</Button>
            <p className="text-xs text-muted-foreground">Withdrawals over 1,000.00 USDC are reviewed by our team before sending.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
