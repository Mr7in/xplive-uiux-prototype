import { Outlet } from "react-router-dom";
import { Activity, AtSign, Award, Ban, BadgeAlert, CircleDollarSign, FileClock, Flag, FolderTree, Gauge, Gift, LayoutDashboard, LifeBuoy, Percent, Scale, ShieldCheck, Smile, Trophy, Tv, Users, Wallet, CreditCard } from "lucide-react";
import { ConsoleLayout, type NavGroup } from "./ConsoleLayout";
import { RoleGate } from "./StudioLayout";
import { useStore } from "@/lib/store";
import { reports, appeals, supportQueue, payoutQueue } from "@/data/admin";

const Count = ({ n, tone = "neutral" }: { n: number; tone?: "warn" | "danger" | "neutral" }) =>
  n ? <span className={`rounded px-1.5 font-mono text-[11px] ${tone === "danger" ? "bg-coral/15 text-coral-soft" : tone === "warn" ? "bg-warn/15 text-warn" : "bg-secondary text-label"}`}>{n}</span> : null;

export default function AdminLayout() {
  const { markets } = useStore();
  const disputes = markets.filter((m) => m.dispute).length;
  const awaiting = markets.filter((m) => m.status === "awaiting").length;
  const groups: NavGroup[] = [
    { items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }] },
    {
      label: "Predictions",
      items: [
        { to: "/admin/markets", label: "All questions", icon: Trophy, badge: <Count n={awaiting} tone="warn" /> },
        { to: "/admin/disputes", label: "Disputes", icon: Scale, badge: <Count n={disputes} tone="warn" /> },
        { to: "/admin/controls", label: "Platform controls", icon: Gauge },
        { to: "/admin/referrals", label: "Referral programme", icon: Gift },
      ],
    },
    {
      label: "Trust & safety",
      items: [
        { to: "/admin/moderation/reports", label: "Reports", icon: Flag, badge: <Count n={reports.filter((r) => r.status !== "Resolved").length} tone="danger" /> },
        { to: "/admin/moderation/sanctions", label: "Sanctions", icon: Ban },
        { to: "/admin/moderation/appeals", label: "Appeals", icon: BadgeAlert, badge: <Count n={appeals.length} /> },
        { to: "/admin/moderation/emotes", label: "Emote review", icon: Smile, badge: <Count n={3} /> },
        { to: "/admin/moderation/badges", label: "Badge review", icon: Award, badge: <Count n={2} /> },
      ],
    },
    {
      label: "Accounts",
      items: [
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/channels", label: "Channels", icon: Tv },
        { to: "/admin/handles", label: "Reserved handles", icon: AtSign },
        { to: "/admin/categories", label: "Categories", icon: FolderTree },
      ],
    },
    {
      label: "Money",
      items: [
        { to: "/admin/payouts", label: "Payouts", icon: CircleDollarSign, badge: <Count n={payoutQueue.filter((p) => p.status === "Needs approval").length} tone="warn" /> },
        { to: "/admin/payments", label: "Deposit & withdrawal issues", icon: CreditCard, badge: <Count n={2} /> },
        { to: "/admin/revenue", label: "Revenue splits", icon: Percent },
        { to: "/admin/rewards", label: "Limits & fees", icon: Wallet },
        { to: "/admin/integrity", label: "Treasury & on-chain", icon: ShieldCheck },
      ],
    },
    {
      label: "Operations",
      items: [
        { to: "/admin/support", label: "Support queue", icon: LifeBuoy, badge: <Count n={supportQueue.filter((t) => t.assignee === "Unassigned").length} /> },
        { to: "/admin/audit", label: "Audit log", icon: FileClock },
        { to: "/admin/health", label: "Stream health", icon: Activity },
      ],
    },
  ];
  return (
    <RoleGate need="admin">
      <ConsoleLayout
        title="Admin"
        groups={groups}
        banner={<div role="note" className="flex h-8 items-center justify-center gap-2 bg-warn-banner text-xs text-warn"><b className="tracking-wider">STAGING</b> Changes here affect the staging environment only.</div>}
      >
        <Outlet />
      </ConsoleLayout>
    </RoleGate>
  );
}
