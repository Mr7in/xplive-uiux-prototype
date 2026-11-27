import * as React from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, Copy, CreditCard, Droplets, Loader2, Lock, LogOut, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useStore, type FiatMethod, type WalletProvider } from "@/lib/store";
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
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-polygon/40 bg-polygon/10 px-2 py-0.5 text-[11px] font-semibold text-violet", className)}>
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
          <Label>Your xp.live deposit address</Label>
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


/* ───────────────────────── Fiat on-ramp (Circle) ───────────────────────── */

/**
 * Card, Apple Pay and Google Pay top-ups through Circle's on-ramp. The viewer pays in their own
 * currency; Circle converts it to USDC and sends it to their xp.live wallet on Polygon.
 * PLACEHOLDER: Circle on-ramp session (quote, hosted payment, ID check, webhook on settlement).
 * Rate, fee and limits below are placeholders, not Circle's pricing.
 */
type Fiat = "EUR" | "USD";
const RATE: Record<Fiat, number> = { EUR: 1.08, USD: 1 }; // PLACEHOLDER: live quote from the on-ramp
const FEE = 0.015; // PLACEHOLDER: on-ramp processing fee
const SYM: Record<Fiat, string> = { EUR: "€", USD: "$" };
const METHODS: { m: FiatMethod; hint: string; icon: React.ElementType }[] = [
  { m: "Apple Pay", hint: "Face ID or Touch ID", icon: Smartphone },
  { m: "Google Pay", hint: "Saved cards on your Google account", icon: Smartphone },
  { m: "Card", hint: "Visa, Mastercard, Maestro", icon: CreditCard },
];
const money = (n: number, c: Fiat) => `${SYM[c]}${n.toFixed(2)}`;

export function fiatQuote(amount: number, cur: Fiat) {
  const fee = Math.round(amount * FEE * 100) / 100;
  const usdc = Math.max(0, Math.round((amount - fee) * RATE[cur] * 100) / 100);
  return { fee, usdc };
}

function PoweredByCircle({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground", className)}>
      <Lock className="h-3 w-3" /> Secure payment · Powered by <span className="font-semibold text-label">Circle</span>
    </p>
  );
}

function FiatTab() {
  const { buyWithFiat, transfers } = useStore();
  const [cur, setCur] = React.useState<Fiat>("EUR");
  const [amount, setAmount] = React.useState("25");
  const [method, setMethod] = React.useState<FiatMethod>("Apple Pay");
  const [step, setStep] = React.useState<"form" | "pay" | "authorising" | "sent">("form");
  const [hash, setHash] = React.useState("");
  const amt = Number(amount) || 0;
  const q = fiatQuote(amt, cur);
  const tx = transfers.find((t) => t.txHash === hash);
  const tooSmall = amt > 0 && amt < 5;
  const tooBig = amt > 1000;

  const pay = () => {
    setStep("authorising");
    window.setTimeout(() => { setHash(buyWithFiat(q.usdc, method)); setStep("sent"); }, 1600);
  };

  if (step === "sent" && tx) {
    const k = (tx.confirmations ?? 0) / NETWORK.confirmations;
    const stages = ["Payment approved", "Circle converts it to USDC", `USDC sent to your xp.live wallet on ${NETWORK.name}`];
    const idx = tx.state === "confirmed" ? 3 : k > 0.5 ? 2 : 1;
    return (
      <div className="grid gap-4 py-2">
        <div className="text-center">
          {tx.state === "confirmed" ? <CheckCircle2 className="mx-auto h-10 w-10 text-neon" /> : <Loader2 className="mx-auto h-10 w-10 animate-spin text-neon" />}
          <p className="mt-2 font-display text-xl font-bold">{tx.state === "confirmed" ? <><span className="text-neon">+{fmtUSDC(tx.amount)}</span> added</> : "Adding your funds"}</p>
          <p className="text-sm text-muted-foreground">{tx.state === "confirmed" ? "It’s in your balance and ready to use." : `You paid ${money(amt, cur)} with ${method}.`}</p>
        </div>
        <ol className="grid gap-1.5 rounded-xl border p-3 text-sm">
          {stages.map((l, i) => (
            <li key={l} className={cn("flex items-center gap-2", i <= idx ? "text-foreground" : "text-muted-foreground")}>
              {i < idx ? <Check className="h-3.5 w-3.5 text-neon" strokeWidth={3} /> : i === idx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="mx-[5px] h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
              {l}
            </li>
          ))}
        </ol>
        <TxLink hash={hash} className="mx-auto" pending={tx.state !== "confirmed"} />
        <Button variant="secondary" onClick={() => { setStep("form"); setHash(""); }}>Add more</Button>
        <PoweredByCircle />
      </div>
    );
  }

  if (step === "pay" || step === "authorising") {
    return (
      <div className="grid gap-4">
        <div className="rounded-xl border bg-secondary/40 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-label">Pay xp.live</p>
            <p className="font-mono text-2xl font-bold tabular">{money(amt, cur)}</p>
          </div>
          <p className="mt-0.5 text-right text-xs text-muted-foreground">You get <span className="font-mono tabular text-foreground">{fmtUSDC(q.usdc)}</span></p>
          {method === "Card" ? (
            <div className="mt-4 grid gap-2">
              <Label htmlFor="cc-num">Card number</Label>
              <Input id="cc-num" inputMode="numeric" defaultValue="4242 4242 4242 4242" className="font-mono" autoComplete="cc-number" />
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5"><Label htmlFor="cc-exp">Expiry</Label><Input id="cc-exp" defaultValue="12 / 28" className="font-mono" autoComplete="cc-exp" /></div>
                <div className="grid gap-1.5"><Label htmlFor="cc-cvc">CVC</Label><Input id="cc-cvc" defaultValue="123" className="font-mono" autoComplete="cc-csc" /></div>
              </div>
              <p className="text-xs text-muted-foreground">Preview: a test card is filled in and nothing is charged. 3-D Secure may ask your bank app to approve.</p>
            </div>
          ) : (
            <div className="mt-4 grid place-items-center gap-2 rounded-lg border bg-background py-6 text-center">
              <Smartphone className="h-7 w-7" />
              <p className="text-sm font-semibold">{method === "Apple Pay" ? "Confirm with Face ID or double-click the side button" : "Choose a card in Google Pay and confirm"}</p>
              <p className="text-xs text-muted-foreground">Preview: nothing is charged.</p>
            </div>
          )}
        </div>
        <Button size="lg" disabled={step === "authorising"} onClick={pay}>
          {step === "authorising" ? <><Loader2 className="animate-spin" /> Approving payment…</> : `Pay ${money(amt, cur)}`}
        </Button>
        <button type="button" disabled={step === "authorising"} onClick={() => setStep("form")} className="text-sm text-label underline underline-offset-2 hover:text-foreground disabled:opacity-50">Back</button>
        <PoweredByCircle />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="fiat-amt">You pay</Label>
          <div role="group" aria-label="Currency" className="inline-flex rounded-md bg-secondary p-0.5 text-xs">
            {(["EUR", "USD"] as Fiat[]).map((c) => (
              <button key={c} type="button" aria-pressed={cur === c} onClick={() => setCur(c)} className={cn("rounded px-2 py-1 font-semibold", cur === c ? "bg-background text-foreground" : "text-muted-foreground")}>{c}</button>
            ))}
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg text-muted-foreground">{SYM[cur]}</span>
          <Input id="fiat-amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))} className="h-12 pl-8 font-mono text-lg" />
        </div>
        <div className="flex gap-1.5">{[10, 25, 50, 100].map((v) => <Button key={v} type="button" size="sm" variant="outline" onClick={() => setAmount(String(v))}>{SYM[cur]}{v}</Button>)}</div>
        {tooSmall && <p className="text-sm text-coral-soft">The minimum top-up is {SYM[cur]}5.00.</p>}
        {tooBig && <p className="text-sm text-coral-soft">The maximum is {SYM[cur]}1,000.00 per top-up.</p>}
      </div>

      <div role="radiogroup" aria-label="Payment method" className="grid gap-2">
        {METHODS.map(({ m, hint, icon: Icon }) => (
          <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)}
            className={cn("flex h-14 items-center gap-3 rounded-xl border px-4 text-left transition", method === m ? "border-foreground bg-secondary" : "hover:border-input hover:bg-secondary/60")}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Icon className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block font-semibold">{m}</span><span className="text-xs text-muted-foreground">{hint}</span></span>
            <span className={cn("h-4 w-4 rounded-full border-2", method === m ? "border-foreground bg-foreground shadow-[inset_0_0_0_3px_hsl(var(--background))]" : "border-muted-foreground/50")} aria-hidden />
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-y-1 rounded-xl bg-secondary p-3 text-sm" aria-label="Quote">
        <dt className="text-muted-foreground">You pay</dt><dd className="text-right font-mono tabular">{money(amt, cur)}</dd>
        <dt className="text-muted-foreground">Processing fee</dt><dd className="text-right font-mono tabular">{money(q.fee, cur)}</dd>
        <dt className="text-muted-foreground">Rate</dt><dd className="text-right font-mono tabular">1 {cur} = {RATE[cur].toFixed(2)} USDC</dd>
        <dt className="font-semibold">You get</dt><dd className="text-right font-mono font-bold tabular">{fmtUSDC(q.usdc)}</dd>
      </dl>

      <Button size="lg" disabled={amt < 5 || tooBig} onClick={() => setStep("pay")}>Continue with {method}</Button>
      <p className="text-xs text-muted-foreground">Usually in your balance within a minute. Your first top-up may ask for a quick ID check. You don’t need a crypto wallet.</p>
      <PoweredByCircle />
    </div>
  );
}

export function AddFundsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { claimFaucet, faucetClaimedToday } = useStore();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mb-1"><NetworkChip /></div>
          <DialogTitle>Add funds</DialogTitle>
          <DialogDescription>Pay by card, Apple Pay or Google Pay and it’s converted to USDC for you. Already hold USDC on {NETWORK.name}? Connect a wallet or send it.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="fiat">
          <TabsList className="grid grid-cols-3 border-0 bg-secondary p-1 rounded-lg">
            <TabsTrigger value="fiat" className="h-9 justify-center rounded-md border-0 px-1 text-xs sm:text-sm data-[state=active]:bg-background">Card & Pay</TabsTrigger>
            <TabsTrigger value="connect" className="h-9 justify-center rounded-md border-0 px-1 text-xs sm:text-sm data-[state=active]:bg-background">Crypto wallet</TabsTrigger>
            <TabsTrigger value="manual" className="h-9 justify-center rounded-md border-0 px-1 text-xs sm:text-sm data-[state=active]:bg-background">Send USDC</TabsTrigger>
          </TabsList>
          <TabsContent value="fiat"><FiatTab /></TabsContent>
          <TabsContent value="connect"><ConnectTab /></TabsContent>
          <TabsContent value="manual"><ManualTab /></TabsContent>
        </Tabs>
        {NETWORK.testnet && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed p-3">
            <Droplets className="h-5 w-5 text-cyan" />
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
          <DialogDescription>USDC is sent to your verified payout address on {NETWORK.name}. Network fees are covered by xp.live.</DialogDescription>
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
              <dt className="text-muted-foreground">Network fee</dt><dd className="text-right">Paid by xp.live</dd>
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
