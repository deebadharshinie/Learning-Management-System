import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Access Neuron LMS" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Guard: if already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("neuron_token");
    if (token) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email.trim(), password);
        localStorage.setItem("neuron_token", data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        window.dispatchEvent(new Event("profile-updated"));
        navigate({ to: "/dashboard" });
      } else {
        const data = await api.register(name.trim(), email.trim(), password);
        localStorage.setItem("neuron_token", data.token);
        toast.success("Account created successfully!");
        window.dispatchEvent(new Event("profile-updated"));
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[radial-gradient(circle_at_50%_120%,rgba(163,230,53,0.12),transparent_50%)] px-4 py-12 relative overflow-hidden">
      {/* Background blobs for rich aesthetics */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-xl shadow-[var(--glow-lime)] mb-3">
            N
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">Neuron Learning OS</h1>
          <p className="text-sm text-muted-foreground mt-1">Adaptive paths, gamified streaks, and AI tutors.</p>
        </div>

        {/* Auth Glass Card */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-[var(--shadow-elevated)] relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-background/50 border border-border/60 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setName("");
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field for Sign Up */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aisha Khan"
                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@neuron.lms"
                  className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold shadow-[var(--glow-lime)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition duration-150"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Get Started"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
