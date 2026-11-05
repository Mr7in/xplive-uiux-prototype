import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogoMark } from "@/components/brand/Logo";
import { useStore } from "@/lib/store";

type Mode = "signin" | "signup";
interface Ctx { mode: Mode | null; open: (m: Mode) => void; close: () => void }
const AuthCtx = React.createContext<Ctx | null>(null);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode | null>(null);
  const value = React.useMemo(() => ({ mode, open: (m: Mode) => setMode(m), close: () => setMode(null) }), [mode]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuthDialog() {
  const c = React.useContext(AuthCtx);
  if (!c) throw new Error("useAuthDialog outside provider");
  return c;
}

/** Returns a guard: run the action when signed in, otherwise open the sign-in dialog. */
export function useRequireAuth() {
  const { user } = useStore();
  const auth = useAuthDialog();
  return React.useCallback((fn: () => void) => (user ? fn() : auth.open("signin")), [user, auth]);
}

export function AuthForm({ initial = "signin", onDone }: { initial?: Mode; onDone?: () => void }) {
  const { signIn } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = React.useState<Mode>(initial);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { setMode(initial); }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter the email address you signed up with.");
    if (password.length < 6) return setError("Passwords are at least 6 characters.");
    if (mode === "signup") return setError("New sign-ups open soon. Log in with an existing account for now.");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const acc = signIn(email);
      if (!acc) return setError("That email and password don’t match an account. Check for typos, or reset your password.");
      onDone?.();
      if (acc.role === "admin") nav("/admin");
    }, 350);
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
      </div>
      {mode === "signup" && (
        <div className="grid gap-2">
          <Label htmlFor="auth-handle">Username</Label>
          <Input id="auth-handle" autoComplete="username" placeholder="3–25 letters, numbers or underscores" />
        </div>
      )}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auth-password">Password</Label>
          {mode === "signin" && <button type="button" className="text-xs text-label hover:text-foreground">Forgot password?</button>}
        </div>
        <div className="relative">
          <Input id="auth-password" type={show ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {mode === "signup" && (
        <label className="flex items-start gap-3 text-sm text-label">
          <Checkbox className="mt-0.5" /> I’m 18 or older (required to predict or watch casino categories). I accept the Terms and Privacy Policy.
        </label>
      )}
      {error && <p role="alert" className="rounded-lg border px-3 py-2 text-sm text-foreground">{error}</p>}
      <Button type="submit" size="lg" disabled={busy}>{busy ? "Checking…" : mode === "signin" ? "Log in" : "Create account"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to balz? " : "Already have an account? "}
        <button type="button" className="font-semibold text-foreground underline underline-offset-2" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
          {mode === "signin" ? "Create an account" : "Log in"}
        </button>
      </p>
    </form>
  );
}

export function SignInDialog() {
  const { mode, close } = useAuthDialog();
  return (
    <Dialog open={mode !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-start">
          <LogoMark size={40} className="mb-2" />
          <DialogTitle>{mode === "signup" ? "Join balz" : "Welcome back"}</DialogTitle>
          <DialogDescription>{mode === "signup" ? "Follow creators, chat and call what happens next." : "Log in to chat, follow creators and predict."}</DialogDescription>
        </DialogHeader>
        <AuthForm initial={mode ?? "signin"} onDone={close} />
      </DialogContent>
    </Dialog>
  );
}
