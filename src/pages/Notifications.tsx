import * as React from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { usePageMeta } from "@/lib/meta";
import { notifications } from "@/data/viewer";
import { PageHeader, EmptyState } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { Tabs, PillTabsList, PillTabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Notifications() {
  usePageMeta("Notifications");
  const [kind, setKind] = React.useState("All");
  const [read, setRead] = React.useState(false);
  const list = notifications.filter((n) => kind === "All" || n.kind === kind);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <PageHeader title="Notifications" actions={<><Button variant="secondary" size="sm" onClick={() => setRead(true)}><Check /> Mark all read</Button><Button asChild variant="ghost" size="sm"><Link to="/settings?tab=notifications">Settings</Link></Button></>} />
      <Tabs value={kind} onValueChange={setKind} className="mt-6"><PillTabsList>{["All", "Predictions", "Go-live", "Mentions"].map((k) => <PillTabsTrigger key={k} value={k}>{k}</PillTabsTrigger>)}</PillTabsList></Tabs>
      {list.length ? (
        <ul className="mt-5 divide-y rounded-xl border">
          {list.map((n) => (
            <li key={n.id}>
              <Link to={n.href} className="flex gap-3 p-4 hover:bg-surface">
                <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", !n.read && !read ? "bg-lime" : "bg-transparent")} aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block">{n.text}</span><span className="text-xs text-muted-foreground">{n.kind} · {n.when}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <div className="mt-5"><EmptyState icon={Bell} title="You’re all caught up" /></div>}
      <p className="mt-4 text-center text-xs text-muted-foreground">Repeated go-live alerts from the same channel are grouped into one.</p>
    </div>
  );
}
