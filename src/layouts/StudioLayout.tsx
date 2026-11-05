import { Link, Outlet } from "react-router-dom";
import {
  Activity, Bell, BarChart3, Ban, Bot, CircleDollarSign, Clapperboard, Coins, Gauge, Handshake, Heart, LayoutDashboard, LifeBuoy, MessageSquare,
  MessagesSquare, Award, Smartphone, Radio, Rocket, Scissors, Settings, Shield, Smile, Sparkles, Star, Trophy, Users, Zap, Terminal,
} from "lucide-react";
import { ConsoleLayout, type NavGroup } from "./ConsoleLayout";
import { useStore } from "@/lib/store";
import { streamerByHandle } from "@/data/streamers";
import { ChannelAvatar, LiveBadge } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth";
import { Logo } from "@/components/brand/Logo";
import { compact } from "@/lib/utils";

function useGroups(needsResult: number, open: number): NavGroup[] {
  return [
    { items: [{ to: "/studio", label: "Live dashboard", icon: LayoutDashboard, end: true }] },
    {
      label: "Stream",
      items: [
        { to: "/studio/stream", label: "Stream setup", icon: Radio },
        { to: "/studio/predictions", label: "Predictions", icon: Trophy, badge: needsResult ? <span className="rounded bg-warn/15 px-1.5 font-mono text-[11px] text-warn">{needsResult}</span> : open ? <span className="h-2 w-2 rounded-full bg-lime" /> : undefined },
        { to: "/studio/companion", label: "Companion app", icon: Smartphone },
      ],
    },
    { label: "Content", items: [{ to: "/studio/content", label: "Past streams", icon: Clapperboard }, { to: "/studio/clips", label: "Clips", icon: Scissors }] },
    { label: "Insights", items: [{ to: "/studio/analytics", label: "Analytics", icon: BarChart3 }, { to: "/studio/activity", label: "Activity feed", icon: Activity }] },
    {
      label: "Engagement",
      items: [
        { to: "/studio/alerts", label: "Alerts", icon: Bell },
        { to: "/studio/points", label: "Channel points", icon: Sparkles },
        { to: "/studio/raids", label: "Raids", icon: Rocket },
        { to: "/studio/hype-trains", label: "Hype trains", icon: Zap },
        { to: "/studio/subscriptions", label: "Subscriptions", icon: Star },
      ],
    },
    {
      label: "Community",
      items: [
        { to: "/studio/community/followers", label: "Followers", icon: Heart },
        { to: "/studio/community/mods", label: "Moderators", icon: Shield },
        { to: "/studio/community/bans", label: "Bans", icon: Ban },
        { to: "/studio/community/automod", label: "AutoMod", icon: Bot },
        { to: "/studio/community/commands", label: "Chat commands", icon: Terminal },
        { to: "/studio/community/triggers", label: "Chat triggers", icon: Gauge },
        { to: "/studio/community/emotes", label: "Emotes", icon: Smile },
        { to: "/studio/community/badges", label: "Badges", icon: Award },
      ],
    },
    { label: "Earnings", items: [{ to: "/studio/payouts", label: "Earnings & payouts", icon: CircleDollarSign }, { to: "/studio/sponsorships", label: "Sponsorships", icon: Handshake, badge: <span className="rounded bg-neon-dim px-1.5 font-mono text-[11px] text-neon">1</span> }] },
    { label: "Channel", items: [{ to: "/studio/settings", label: "Channel settings", icon: Settings }] },
    { label: "Help", items: [{ to: "/studio/messages", label: "Messages", icon: MessageSquare, badge: <span className="h-2 w-2 rounded-full bg-lime" /> }, { to: "/studio/support", label: "Support", icon: LifeBuoy }] },
  ];
}

export function RoleGate({ need, children }: { need: "creator" | "admin"; children: React.ReactNode }) {
  const { user } = useStore();
  const auth = useAuthDialog();
  if (user?.role === need) return <>{children}</>;
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <Link to="/" className="mb-8 inline-block"><Logo size={36} /></Link>
        <h1 className="font-display text-3xl font-extrabold">{need === "creator" ? "Creator Studio" : "Admin console"}</h1>
        <p className="mt-2 text-muted-foreground">
          {user ? (need === "creator" ? "This account doesn’t have a channel yet. Claim one to unlock streaming, predictions and community tools." : "This account doesn’t have admin access.") : `Log in with a ${need === "creator" ? "creator" : "staff"} account to continue.`}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {!user && <Button onClick={() => auth.open("signin")}>Log in</Button>}
          {user && need === "creator" && <Button>Claim your channel</Button>}
          <Button asChild variant="secondary"><Link to="/">Back to balz</Link></Button>
        </div>
      </div>
    </div>
  );
}

export default function StudioLayout() {
  const { user, markets } = useStore();
  const s = user?.channel ? streamerByHandle(user.channel) : undefined;
  const mine = markets.filter((m) => m.handle === user?.channel);
  const groups = useGroups(mine.filter((m) => m.status === "awaiting").length, mine.filter((m) => m.status === "open").length);
  return (
    <RoleGate need="creator">
      <ConsoleLayout
        title="Studio"
        groups={groups}
        topRight={s && (
          <>
            {s.live ? <span className="hidden items-center gap-2 text-sm sm:flex"><LiveBadge /><span className="font-mono text-xs text-label">{compact(s.viewers)} watching</span></span> : <span className="text-sm text-muted-foreground">Offline</span>}
            <Button asChild variant="outline" size="sm"><Link to={`/${s.handle}`}>View channel</Link></Button>
            <ChannelAvatar s={s} size={30} ring={false} />
          </>
        )}
      >
        <Outlet />
      </ConsoleLayout>
    </RoleGate>
  );
}
