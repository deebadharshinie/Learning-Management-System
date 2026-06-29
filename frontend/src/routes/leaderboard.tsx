import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { Trophy, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { api, UserProfile } from "@/lib/api";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard · Neuron LMS" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const [data, setData] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((users) => {
        setData(users);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto h-[50vh] grid place-items-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Loading Leaderboard rankings...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // Helper to determine department and direction matches the mockup values
  const getDept = (name: string) => {
    if (name === "Priya Raman") return "Math";
    if (name === "Diego Luna") return "Physics";
    if (name === "Hana Sato") return "Bio";
    if (name === "Sofia Mendez") return "Econ";
    if (name === "Kenji Watanabe") return "Math";
    if (name === "Jia Wen" || name === "Ethan Brooks") return "AI";
    return "CS";
  };

  const getDir = (name: string) => {
    if (name === "Priya Raman" || name === "Hana Sato" || name === "Kenji Watanabe") {
      return "down";
    }
    return "up";
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ leaderboard</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            This week's top minds.
          </h1>
        </div>

        {/* podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end">
            {[top3[1] || top3[0], top3[0], top3[2] || top3[0]].map((p, idx) => {
              if (!p) return null;
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const heights = ["h-32 sm:h-40", "h-44 sm:h-56", "h-24 sm:h-32"];
              return (
                <div key={p.name} className="flex flex-col items-center text-center">
                  <div
                    className={`grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full font-display font-bold text-lg mb-3 ${
                      rank === 1
                        ? "bg-gradient-to-br from-primary to-sky text-primary-foreground shadow-[var(--glow-lime)]"
                        : rank === 2
                        ? "bg-gradient-to-br from-sky to-violet text-foreground"
                        : "bg-gradient-to-br from-coral to-violet text-foreground"
                    }`}
                  >
                    {p.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div className="font-display font-semibold text-sm sm:text-base truncate w-full">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.xp.toLocaleString()} XP</div>
                  <div
                    className={`mt-3 w-full ${heights[idx]} rounded-t-2xl border border-border border-b-0 ${
                      rank === 1
                        ? "bg-gradient-to-b from-primary/30 to-transparent"
                        : "bg-gradient-to-b from-surface to-transparent"
                    } grid place-items-start pt-3`}
                  >
                    <div className="font-display text-3xl sm:text-5xl font-bold mx-auto">{rank}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* table */}
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_80px_60px] sm:grid-cols-[60px_1fr_120px_120px_80px] gap-3 px-4 sm:px-6 py-3 border-b border-border text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
            <span>rank</span>
            <span>learner</span>
            <span className="text-right">streak</span>
            <span className="text-right">xp</span>
            <span className="text-right">trend</span>
          </div>
          {rest.map((p, i) => {
            const dir = getDir(p.name);
            return (
              <div
                key={p.name}
                className={`grid grid-cols-[40px_1fr_80px_80px_60px] sm:grid-cols-[60px_1fr_120px_120px_80px] gap-3 px-4 sm:px-6 py-3 items-center border-b border-border/40 last:border-0 ${
                  p.name === "Aisha Khan" ? "bg-primary/10" : "hover:bg-accent/30"
                }`}
              >
                <span className="font-mono font-bold text-muted-foreground">#{i + 4}</span>
                <div className="min-w-0 flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet to-sky text-xs font-display font-bold">
                    {p.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {p.name} {p.name === "Aisha Khan" && <span className="text-[10px] font-mono uppercase text-primary ml-1">you</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{getDept(p.name)}</div>
                  </div>
                </div>
                <div className="text-right text-sm font-mono inline-flex items-center justify-end gap-1">
                  <Flame className="h-3 w-3 text-coral" /> {p.streak}
                </div>
                <div className="text-right text-sm font-mono font-semibold">{p.xp.toLocaleString()}</div>
                <div className={`text-right ${dir === "up" ? "text-primary" : "text-coral"}`}>
                  {dir === "up" ? (
                    <TrendingUp className="h-4 w-4 inline" />
                  ) : (
                    <TrendingDown className="h-4 w-4 inline" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs font-mono text-muted-foreground text-center">
          <Trophy className="h-3 w-3 inline mr-1 text-primary" />
          weekly reset · sunday 23:59 UTC
        </div>
      </div>
    </AppShell>
  );
}
export default Leaderboard;
