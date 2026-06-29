import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  MessagesSquare,
  Sparkles,
  Calendar,
  Award,
  Settings,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, UserProfile } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("neuron_token");
    toast.success("Logged out successfully.");
    navigate({ to: "/auth" });
  };

  const loadProfile = () => {
    api.getUserProfile()
      .then((data) => {
        setUser(data);
        setNameInput(data.name);
      })
      .catch((err) => console.error("Error fetching user profile in sidebar:", err));
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setUpdating(true);
    api.updateUserProfile({ name: nameInput })
      .then(() => {
        setUpdating(false);
        setShowSettings(false);
        toast.success("Profile name updated successfully!");
        window.dispatchEvent(new Event("profile-updated"));
      })
      .catch((err) => {
        console.error("Error saving settings:", err);
        toast.error("Failed to update profile settings.");
        setUpdating(false);
      });
  };

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("")
    : "AK";

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-border bg-surface/95 lg:bg-surface/40 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex ${mobileOpen ? "translate-x-0 flex" : "-translate-x-full flex lg:-translate-x-0"}`}>
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold shadow-[var(--glow-lime)]">
            N
          </div>
          <div>
            <div className="font-display font-bold tracking-tight">Neuron</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Learning OS
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-[var(--glow-lime)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors cursor-pointer group">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet to-sky font-display font-semibold text-sm overflow-hidden select-none">
                  {user && user.avatarUrl ? (
                    user.avatarUrl.startsWith("http") || user.avatarUrl.startsWith("data:") ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{user.avatarUrl}</span>
                    )
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-medium truncate">{user ? user.name : "Loading..."}</div>
                  <div className="text-xs text-muted-foreground">CS · Year 3</div>
                </div>
                <button
                  type="button"
                  className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="User menu"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 border-border backdrop-blur-xl">
              <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Account
              </div>
              <DropdownMenuItem
                onClick={() => {
                  if (user) {
                    setNameInput(user.name);
                    setShowSettings(true);
                  }
                }}
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Profile Settings
            </h2>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label htmlFor="settings-name" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="settings-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Department & Class
                </label>
                <input
                  type="text"
                  value="Computer Science · Year 3"
                  className="w-full bg-background/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
                  disabled
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">Department is locked to student registration.</span>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-[var(--glow-lime)] hover:opacity-90 disabled:opacity-50 transition"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
