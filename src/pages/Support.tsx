import { usePageMeta } from "@/lib/meta";
import { PageHeader } from "@/components/xp";
import { SupportCenter } from "@/components/SupportCenter";

export default function Support() {
  usePageMeta("Help & support");
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <PageHeader title="Help & support" description="Answers to common questions, or talk to a person." className="mb-6" />
      <SupportCenter audience="viewer" tickets={[
        { id: "T-20418", subject: "Dispute: Will Olivia make the final table?", topic: "Predictions & results", status: "Open", updated: "2 h ago" },
        { id: "T-19907", subject: "Deposit stuck at 8 confirmations", topic: "Wallet & USDC", status: "Resolved", updated: "Oct 14" },
      ]} />
    </div>
  );
}
