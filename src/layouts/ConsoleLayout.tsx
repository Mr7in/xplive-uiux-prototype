import * as React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/lib/theme";

export interface NavItem { to: string; label: string; icon: React.ElementType; badge?: React.ReactNode; end?: boolean }
export interface NavGroup { label?: string; items: NavItem[] }

function Nav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5 text-sm">
      {groups.map((g, i) => (
        <div key={g.label ?? i}>
          {g.label && <p className="mb-1 px-3 text-xs font-medium text-muted-foreground">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-label transition-colors hover:bg-secondary hover:text-foreground", isActive && "bg-secondary font-semibold text-foreground")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <it.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Shared shell for Creator Studio and Admin: grouped side nav, slim top bar, optional banner. */
export function ConsoleLayout({ title, groups, topRight, banner, children }: { title: string; groups: NavGroup[]; topRight?: React.ReactNode; banner?: React.ReactNode; children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const loc = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="min-h-screen bg-background">
      {banner}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/90 px-3 backdrop-blur md:px-5">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
        <Link to="/" aria-label="balz home" className="pt-1"><Logo size={30} /></Link>
        <Badge variant="default">{title}</Badge>
        <div className="ml-auto flex items-center gap-2">
          {topRight}
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/"><ArrowLeft /> Back to balz</Link></Button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r p-3 pb-10 lg:block">
          <Nav groups={groups} />
        </aside>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <SheetTitle className="px-3 pt-1 font-display text-lg font-bold">{title}</SheetTitle>
            <Nav groups={groups} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
