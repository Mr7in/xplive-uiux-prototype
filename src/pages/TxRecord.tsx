import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { NETWORK, mockHex, short } from "@/lib/chain";
import { at, blockAt, clock, when } from "@/lib/ledger";
import { Button } from "@/components/ui/button";
import { PositionSteps, useReceipt } from "@/components/trust";
import { fmtUSDC } from "@/lib/utils";

/** Mock settlement contract that holds prediction pools. PLACEHOLDER: the deployed contract address. */
const POOL_CONTRACT = mockHex("xplive:prediction-pool", 40);
const EXTERNAL = "0x9f3c2a7d1e8b40c6f5a19e0b3d7c42a58e6f41aa";

/**
 * Preview of the block explorer record, inside the prototype, so a tester who follows the
 * transaction link never lands on a "not found" page.
 * PLACEHOLDER: in the build this link goes to `${NETWORK.explorer}/tx/<hash>` (amoy.polygonscan.com in dev),
 * and only for hashes that exist on that network.
 */
export default function TxRecord() {
  const { hash = "" } = useParams();
  const nav = useNavigate();
  const { transfers, positions, depositAddress } = useStore();
  const receipt = useReceipt();
  usePageMeta("Transaction record");
  const t = transfers.find((x) => x.txHash === hash);
  const pos = positions.find((p) => p.txHash === hash);
  const confirmed = t?.state === "confirmed" && (!pos || pos.tx === "confirmed");
  const time = t ? at(t.minsAgo, t.at) : Date.now();
  const into = t ? t.amount > 0 : false;
  const from = !t ? "" : t.kind === "deposit" || t.kind === "faucet" ? EXTERNAL : into ? POOL_CONTRACT : depositAddress;
  const to = !t ? "" : into ? depositAddress : t.kind === "withdrawal" ? EXTERNAL : POOL_CONTRACT;
  const method = !t ? "" : { prediction: "placePrediction", payout: "claimPayout", refund: "refundVoided", deposit: "transfer", withdrawal: "transfer", faucet: "drip", tip: "tip" }[t.kind];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => nav(-1)}><ArrowLeft /> Back</Button>
      <p className="mt-4 rounded-lg border border-dashed px-3 py-2 text-sm text-label">
        Preview of the block explorer record. In the live build this link opens Polygonscan{NETWORK.testnet ? " (testnet)" : ""} in a new tab.
      </p>
      <h1 className="mt-6 font-display text-3xl font-bold">Transaction</h1>
      <p className="mt-1 break-all font-mono text-sm text-label">{hash}</p>

      {!t ? (
        <div className="mt-6 rounded-xl border p-5">
          <p className="flex items-center gap-2 font-semibold"><Loader2 className="h-4 w-4 animate-spin" /> On-chain record pending</p>
          <p className="mt-1 text-sm text-muted-foreground">This transaction hasn’t been indexed yet. Records usually appear within a minute of confirmation.</p>
        </div>
      ) : (
        <dl className="mt-6 divide-y rounded-xl border bg-card px-5">
          <Item k="Status">{confirmed ? <span className="inline-flex items-center gap-1.5 font-semibold text-neon"><CheckCircle2 className="h-4 w-4" /> Success · confirmed</span> : pos ? <PositionSteps tx={pos.tx} /> : <span className="inline-flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Pending</span>}</Item>
          <Item k="Network">{NETWORK.name}{NETWORK.testnet ? " (testnet)" : ""} · chain {NETWORK.chainId}</Item>
          <Item k="Block"><span className="font-mono tabular">{confirmed ? blockAt(time).toLocaleString("en-US") : "–"}</span></Item>
          <Item k="Timestamp">{when(time)}{!when(time).includes(":") && ` ${clock(time)}`}</Item>
          <Item k="Method"><span className="font-mono">{method}</span></Item>
          <Item k="From"><span className="font-mono">{short(from, 10, 8)}</span>{from === depositAddress && <span className="ml-2 text-xs text-muted-foreground">your xp.live wallet</span>}</Item>
          <Item k="To"><span className="font-mono">{short(to, 10, 8)}</span>{to === POOL_CONTRACT && <span className="ml-2 text-xs text-muted-foreground">xp.live prediction pool</span>}{to === depositAddress && <span className="ml-2 text-xs text-muted-foreground">your xp.live wallet</span>}</Item>
          <Item k="Token transfer"><span className="font-mono tabular">{fmtUSDC(Math.abs(t.amount))}</span> <span className="text-xs text-muted-foreground">USDC · {short(NETWORK.usdc)}</span></Item>
          <Item k="For">{t.label}</Item>
        </dl>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {pos && <Button variant="outline" onClick={() => receipt.open(pos.id)}>View receipt</Button>}
        <Button asChild variant="ghost"><Link to="/wallet">Wallet &amp; predictions</Link></Button>
      </div>
    </div>
  );
}

function Item({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{k}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}
