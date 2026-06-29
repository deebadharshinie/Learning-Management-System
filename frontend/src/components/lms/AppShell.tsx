import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Flame, Languages, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { api, UserProfile } from "@/lib/api";
import { toast } from "sonner";

export function AppShell({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeLang, setActiveLang] = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const loadProfile = () => {
    api.getUserProfile()
      .then(setUser)
      .catch((err) => console.error("Error fetching user profile:", err));
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "✨ AI recommendation: eigenvectors AR lab is ready.", when: "10m ago" },
    { id: 2, text: "💬 Marcus Tate replied to your thread 'Intuition behind backpropagation'.", when: "1h ago" },
    { id: 3, text: "🏆 Mastery score increased to 71% after your last quiz.", when: "1d ago" }
  ]);

  useEffect(() => {
    const handleLive = (e: Event) => {
      const customEv = e as CustomEvent;
      setNotifications((prev) => [
        { id: Date.now(), text: customEv.detail.text, when: customEv.detail.when },
        ...prev
      ]);
      setUnreadCount((c) => c + 1);
    };
    window.addEventListener("live-notification", handleLive);
    return () => window.removeEventListener("live-notification", handleLive);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <Sidebar mobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 py-3 sm:flex sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                aria-label="Toggle Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 border border-border/60 w-full max-w-sm">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  placeholder="Search courses, peers, concepts…"
                  className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
                />
                <kbd className="hidden md:inline text-[10px] font-mono text-muted-foreground border border-border rounded px-1">
                  ⌘K
                </kbd>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 rounded-full bg-coral/15 text-coral px-2.5 py-1 text-xs font-medium border border-coral/20">
                <Flame className="h-3.5 w-3.5" />
                <span>{user ? `${user.streak} day streak` : "Loading streak..."}</span>
              </div>

              {/* Hidden Google Translate Widget */}
              <div id="google_translate_element" className="hidden"></div>

              {/* Custom Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold hover:bg-accent transition cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Languages className="h-3.5 w-3.5 text-primary" />
                  <span>{activeLang}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border bg-card/95 p-1.5 shadow-xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                    {[
                      { code: "en", name: "English" },
                      { code: "ta", name: "Tamil" },
                      { code: "hi", name: "Hindi" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setActiveLang(lang.name);
                          setShowLangDropdown(false);
                          toast.success(`Translating to ${lang.name}...`);
                          
                          // Control the hidden Google Translate widget
                          const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                          if (combo) {
                            combo.value = lang.code;
                            combo.dispatchEvent(new Event('change'));
                          } else {
                            // Fallback if widget hasn't loaded yet
                            document.cookie = `googtrans=/en/${lang.code}; path=/`;
                            document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
                            window.location.reload();
                          }
                        }}
                        className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer block ${
                          activeLang === lang.name
                            ? "bg-primary/20 text-primary font-bold"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card/95 p-4 shadow-xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-display font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => setUnreadCount(0)}
                          className="text-[10px] font-mono uppercase text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <ul className="space-y-2.5 max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id} className="text-xs space-y-0.5 text-left">
                          <p className="text-foreground leading-normal">{n.text}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">{n.when}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
