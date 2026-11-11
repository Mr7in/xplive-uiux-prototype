import * as React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, CircleHelp, Clapperboard, Compass, LogOut, Menu, MessageSquare, Search, Settings, Shield, Plus, Trophy, User, Wallet, LifeBuoy, History } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { categories, type CategoryGroup } from "@/data/categories";
import { streamers, streamerByHandle } from "@/data/streamers";
import { ChannelAvatar, categoryStats } from "@/components/xp";
import { cn, compact, fmtUSD2 } from "@/lib/utils";
import { NETWORK } from "@/lib/chain";
import { ThemeToggle } from "@/lib/theme";
import { useWalletUI } from "@/components/WalletDialogs";
import { notifications } from "@/data/viewer";
import { SignInDialog, useAuthDialog } from "@/components/auth";

const navLinks = [
  { to: "/markets", label: "Predictions", icon: Trophy },
  { to: "/how-it-works", label: "How it works", icon: CircleHelp },
];

const groups: CategoryGroup[] = ["Games", "Casino", "IRL", "Sports"];

function CategoriesMenu() {
  const [open, setOpen] = React.useState(false);
  const loc = useLocation();
  React.useEffect(() => { setOpen(false); }, [loc.pathname]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors hover:text-foreground", loc.pathname.startsWith("/category") || loc.pathname === "/browse" ? "text-foreground" : "text-label")}>
          Browse <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(760px,calc(100vw-2rem))] p-5">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{g}</p>
              <ul className="space-y-0.5">
                {categories.filter((c) => c.group === g).map((c) => (
                  <li key={c.slug}>
                    <Link to={`/category/${c.slug}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
                      <span className="truncate">{c.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{compact(categoryStats(c.slug).viewers)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end border-t pt-3">
          <Link to="/browse" className="text-sm font-semibold hover:underline">Browse all categories →</Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Header balance: opens Wallet & predictions in one click; animates once when it changes. */
function BalancePill({ balance, onAdd }: { balance: number; onAdd: () => void }) {
  const [shown, setShown] = React.useState(balance);
  const [flash, setFlash] = React.useState(0);
  const prev = React.useRef(balance);
  React.useEffect(() => {
    const from = prev.current;
    prev.current = balance;
    if (Math.abs(from - balance) < 0.005) return;
    setFlash((n) => n + 1);
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 700);
      setShown(from + (balance - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [balance]);
  return (
    <span className="inline-flex h-9 items-center rounded-full border bg-surface text-sm">
      <Link to="/wallet" className="inline-flex h-full items-center gap-1.5 rounded-full pl-2.5 pr-3 hover:bg-secondary sm:rounded-r-none sm:pl-3 sm:pr-2" aria-label={`Balance ${fmtUSD2(balance)} USDC. Open wallet and predictions`}>
        <Wallet className="h-4 w-4 text-label sm:hidden" aria-hidden />
        <span key={flash} className={cn("rounded font-mono font-bold tabular sm:px-1", flash > 0 && "flash")}>{fmtUSD2(shown)}</span>
        <span className="hidden text-xs text-label sm:inline">USDC</span>
      </Link>
      <button onClick={onAdd} className="hidden h-full w-9 place-items-center rounded-r-full border-l hover:bg-secondary sm:grid" aria-label="Add funds"><Plus className="h-4 w-4" /></button>
    </span>
  );
}

function SearchBox({ className }: { className?: string }) {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search channels, categories, predictions" aria-label="Search" className="h-10 rounded-full bg-surface pl-9" />
    </form>
  );
}

function NotificationsMenu() {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-live px-1 font-mono text-[10px] font-bold text-white">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-display font-semibold">Notifications</p>
          <Link to="/notifications" className="text-xs text-label hover:text-foreground">See all</Link>
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {notifications.slice(0, 6).map((n) => (
            <li key={n.id}>
              <Link to={n.href} className={cn("flex gap-3 border-b px-4 py-3 text-sm last:border-0 hover:bg-secondary", !n.read && "bg-neon/[0.03]")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-lime")} />
                <span className="min-w-0">
                  <span className="block">{n.text}</span>
                  <span className="text-xs text-muted-foreground">{n.when}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function AccountMenu() {
  const { user, signOut } = useStore();
  const nav = useNavigate();
  if (!user) return null;
  const s = user.channel ? streamerByHandle(user.channel) : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-offset-2" aria-label="Account menu">
          <ChannelAvatar s={{ name: user.name, handle: user.channel ?? user.handle, color: s?.color ?? "#b3b9d4", live: false }} size={34} ring={false} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-foreground">
          <span className="block font-display text-sm">{user.name}</span>
          <span className="block font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.channel && <DropdownMenuItem onSelect={() => nav(`/${user.channel}`)}><User /> My channel</DropdownMenuItem>}
        {user.role === "creator" && <DropdownMenuItem onSelect={() => nav("/studio")}><Clapperboard /> Creator Studio</DropdownMenuItem>}
        {user.role === "admin" && <DropdownMenuItem onSelect={() => nav("/admin")}><Shield /> Admin console</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => nav("/wallet")}><Wallet /> Wallet &amp; predictions</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav("/history")}><History /> Watch history</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav("/settings")}><Settings /> Settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav("/support")}><LifeBuoy /> Help &amp; support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut(); nav("/"); }}><LogOut /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SideNav({ onNavigate, categories: showCats = true }: { onNavigate?: () => void; categories?: boolean }) {
  const { user, follows } = useStore();
  const [moreFollowed, setMoreFollowed] = React.useState(false);
  const [moreLive, setMoreLive] = React.useState(false);
  const followed = user ? (follows[user.id] ?? []).map((h) => streamerByHandle(h)!).filter(Boolean).sort((a, b) => Number(b.live) - Number(a.live) || b.viewers - a.viewers) : [];
  const followedSet = new Set(followed.map((s) => s.handle));
  const recommended = streamers.filter((s) => s.live && !followedSet.has(s.handle)).sort((a, b) => b.viewers - a.viewers);
  const topCats = [...categories].sort((a, b) => categoryStats(b.slug).viewers - categoryStats(a.slug).viewers).slice(0, 8);

  const Row = ({ s }: { s: (typeof streamers)[number] }) => (
    <li>
      <NavLink to={`/${s.handle}`} onClick={onNavigate} className={({ isActive }) => cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-secondary", isActive && "bg-secondary")}>
        <ChannelAvatar s={s} size={28} ring={false} className={cn(!s.live && "opacity-60")} />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-semibold", !s.live && "text-muted-foreground")}>{s.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{s.live ? categories.find((c) => c.slug === s.category)?.name : "Offline"}</span>
        </span>
        {s.live && <span className="flex items-center gap-1 font-mono text-[11px] text-label"><span className="h-1.5 w-1.5 rounded-full bg-live" />{compact(s.viewers)}</span>}
      </NavLink>
    </li>
  );

  return (
    <nav aria-label="Channels and categories" className="flex flex-col gap-6 text-sm">
      {user && (
        <section>
          <h2 className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground">Followed channels</h2>
          <ul className="space-y-0.5">{followed.slice(0, moreFollowed ? 20 : 6).map((s) => <Row key={s.handle} s={s} />)}</ul>
          {followed.length > 6 && <button onClick={() => setMoreFollowed((v) => !v)} className="mt-1 px-2 text-xs font-semibold text-label hover:text-foreground">{moreFollowed ? "Show less" : `Show ${followed.length - 6} more`}</button>}
        </section>
      )}
      <section>
        <h2 className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground">{user ? "Recommended live" : "Live channels"}</h2>
        <ul className="space-y-0.5">{recommended.slice(0, moreLive ? 12 : 5).map((s) => <Row key={s.handle} s={s} />)}</ul>
        <button onClick={() => setMoreLive((v) => !v)} className="mt-1 px-2 text-xs font-semibold text-label hover:text-foreground">{moreLive ? "Show less" : "Show more"}</button>
      </section>
      {showCats && <section>
        <h2 className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground">Categories</h2>
        <ul className="space-y-0.5">
          {topCats.map((c) => (
            <li key={c.slug}>
              <NavLink to={`/category/${c.slug}`} onClick={onNavigate} className={({ isActive }) => cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary", isActive && "bg-secondary")}>
                <span className="truncate">{c.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{compact(categoryStats(c.slug).viewers)}</span>
              </NavLink>
            </li>
          ))}
          <li><Link to="/browse" onClick={onNavigate} className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold hover:bg-secondary"><Compass className="h-4 w-4" /> All 20 categories</Link></li>
        </ul>
      </section>}
    </nav>
  );
}

export default function SiteLayout() {
  const { user, balance } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const auth = useAuthDialog();
  const walletUI = useWalletUI();
  const loc = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-lime focus:px-3 focus:py-2 focus:text-lime-ink">Skip to content</a>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-2 min-[360px]:gap-3 min-[360px]:px-3 md:h-16 md:px-5">
        <Button variant="ghost" size="icon" className="relative lg:hidden" aria-label={user && unread ? `Open menu, ${unread} unread notifications` : "Open menu"} onClick={() => setMenuOpen(true)}>
          <Menu className="h-5 w-5" />
          {user && unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-live md:hidden" aria-hidden />}
        </Button>
        <Link to="/" aria-label="xp.live home" className="shrink-0 pt-1 min-[360px]:mr-2"><Logo size={30} /></Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          <CategoriesMenu />
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("h-9 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors hover:text-foreground", l.to === "/how-it-works" ? "hidden lg:inline-flex" : "inline-flex", isActive ? "text-foreground" : "text-label")}>{l.label}</NavLink>
          ))}
        </nav>
        <SearchBox className="mx-auto hidden w-full max-w-md lg:block" />
        <div className="ml-auto flex items-center gap-1 min-[360px]:gap-1.5 lg:ml-0">
          <Button asChild variant="ghost" size="icon" className="lg:hidden" aria-label="Search"><Link to="/search"><Search className="h-5 w-5" /></Link></Button>
          {user ? (
            <>
              {user.role === "creator" && <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/studio"><Clapperboard /> Studio</Link></Button>}
              {user.role === "admin" && <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/admin"><Shield /> Admin</Link></Button>}
              <BalancePill balance={balance} onAdd={() => walletUI.open("add")} />
              {/* Phones keep only search, wallet and avatar; notifications live in the menu, theme in Settings. */}
              <span className="hidden md:contents"><ThemeToggle /><NotificationsMenu /></span>
              <Button asChild variant="ghost" size="icon" aria-label="Messages" className="hidden sm:inline-flex"><Link to="/messages"><MessageSquare className="h-5 w-5" /></Link></Button>
              <AccountMenu />
            </>
          ) : (
            <>
              {/* Logged out: the theme icon stays in the header at every width (no Settings page without an account). */}
              <ThemeToggle />
              {/* Log in is visible at every width: on phones it was the only way back into an existing account from the header. */}
              <Button variant="outline" size="sm" className="border-foreground/50 px-2.5 text-foreground hover:border-foreground sm:px-3" onClick={() => auth.open("signin")}>Log in</Button>
              <Button size="sm" className="px-2.5 sm:px-3" onClick={() => auth.open("signup")}>Sign up</Button>
            </>
          )}
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r px-3 py-5 lg:block">
          <SideNav />
        </aside>
        {/* Phone menu: full-screen sheet, large rows, account action pinned at the bottom. */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-full max-w-none gap-0 p-0 sm:w-[360px]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 shrink-0 items-center border-b px-4"><Link to="/" onClick={() => setMenuOpen(false)}><Logo size={28} /></Link></div>
            <div className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="border-b pb-3">
                {[{ to: "/browse", label: "Browse" }, { to: "/markets", label: "Predictions" }, ...(user ? [{ to: "/following", label: "Following" }, { to: "/notifications", label: "Notifications", note: unread ? `${unread} new` : "" }, { to: "/messages", label: "Messages" }, { to: "/wallet", label: "Wallet & predictions", note: `${fmtUSD2(balance)} USDC` }] : []), { to: "/how-it-works", label: "How payouts work" }].map((l) => (
                  <li key={l.to}><NavLink to={l.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => cn("flex min-h-[52px] items-center justify-between rounded-lg px-3 font-display text-lg font-semibold hover:bg-secondary", isActive ? "text-foreground" : "text-label")}>{l.label}{"note" in l && <span className="font-mono text-sm text-label">{l.note}</span>}</NavLink></li>
                ))}
              </ul>
              <div className="pt-4"><SideNav onNavigate={() => setMenuOpen(false)} categories={false} /></div>
            </div>
            {/* Signed in: sign out lives only in the avatar menu (top right). */}
            {!user && (
              <div className="shrink-0 border-t p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="lg" className="border-foreground/50" onClick={() => { setMenuOpen(false); auth.open("signin"); }}>Log in</Button>
                  <Button size="lg" onClick={() => { setMenuOpen(false); auth.open("signup"); }}>Sign up</Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        <main id="main" className="min-w-0 flex-1">
          <Outlet />
          <footer className="mt-16 border-t px-5 py-8 text-sm text-muted-foreground md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3"><Logo size={22} /><span>© 2026 xp.live</span></div>
              <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
                <Link to="/support" className="hover:text-foreground">Help centre</Link>
                <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
                <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
                <Link to="/legal/responsible-play" className="hover:text-foreground">Responsible play</Link>
                <Link to="/how-it-works" className="hover:text-foreground">How payouts work</Link>
              </nav>
            </div>
            <p className="mt-4 max-w-3xl text-xs leading-relaxed">Predictions use USDC on Polygon ({NETWORK.name}{NETWORK.testnet ? ", a test network: test USDC has no value" : ""}). Predictions and casino categories are for adults aged 18+ and are not available in every country. Need a break? Set limits in <Link to="/settings" className="underline hover:text-foreground">Settings</Link>.</p>
          </footer>
        </main>
      </div>
      <SignInDialog />
    </div>
  );
}
