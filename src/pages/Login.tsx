import { Link, Navigate } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { AuthForm } from "@/components/auth";
import { Logo } from "@/components/brand/Logo";

export default function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  usePageMeta(mode === "signin" ? "Log in" : "Sign up");
  const { user } = useStore();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : user.role === "creator" ? "/studio" : "/"} replace />;
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-block"><Logo size={40} /></Link>
        <h1 className="font-display text-3xl font-extrabold">{mode === "signin" ? "Log in to balz" : "Create your account"}</h1>
        <p className="mb-6 mt-1 text-muted-foreground">Watch live. Call what happens next.</p>
        <AuthForm initial={mode} />
      </div>
    </div>
  );
}
