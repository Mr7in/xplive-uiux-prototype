import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "xplive.theme";
const Ctx = React.createContext<{ mode: ThemeMode; resolved: "light" | "dark"; setMode: (m: ThemeMode) => void } | null>(null);

const systemDark = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
function read(): ThemeMode {
  try { const v = window.localStorage.getItem(KEY); if (v === "light" || v === "dark" || v === "system") return v; } catch { /* storage blocked */ }
  return "dark"; // dark-first brand default
}

/** Light / dark / system. Applies the `dark` class on <html>; the inline script in index.html does the same before first paint. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>(read);
  const [sys, setSys] = React.useState<boolean>(() => !!systemDark());
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const on = () => setSys(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const resolved: "light" | "dark" = mode === "system" ? (sys ? "dark" : "light") : mode;
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#000000" : "#ffffff");
  }, [resolved]);
  const setMode = React.useCallback((m: ThemeMode) => {
    setModeState(m);
    try { window.localStorage.setItem(KEY, m); } catch { /* storage blocked */ }
  }, []);
  return <Ctx.Provider value={{ mode, resolved, setMode }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useTheme outside ThemeProvider");
  return c;
}

export function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();
  const items: { m: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { m: "light", label: "Light", Icon: Sun },
    { m: "dark", label: "Dark", Icon: Moon },
    { m: "system", label: "Match my device", Icon: Monitor },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Theme: ${mode}`}>{resolved === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map(({ m, label, Icon }) => (
          <DropdownMenuItem key={m} onSelect={() => setMode(m)} className={mode === m ? "font-semibold" : ""}>
            <Icon /> {label} {mode === m && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
