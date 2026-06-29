import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { useEffect, useState, useRef } from "react";
import { api, UserProfile, Course } from "@/lib/api";
import {
  Flame,
  Trophy,
  Target,
  Clock,
  Sparkles,
  ArrowUpRight,
  PlayCircle,
  CheckCircle2,
  Zap,
  X,
  Sliders,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Neuron LMS" },
      { name: "description", content: "Your adaptive learning dashboard with streaks, badges, AI recommendations and live progress." },
    ],
  }),
  component: Dashboard,
});

const recommendationPaths = [
  {
    id: "eigenvectors",
    title: "You learn visually 22% faster — switch to the AR module for Eigenvectors",
    description: "Based on the last 6 quizzes, diagram-based explanations boost your retention. Estimated 14 minutes to mastery.",
    category: "Neuron AI · adaptive suggestion",
    btnLabel: "Launch AR lab"
  },
  {
    id: "gradient_descent",
    title: "Strengthen calculus intuition — study the Gradient Descent step-size path",
    description: "Your quiz score on local minima could be improved. Revisit step-size changes in 3D to see optimization in real time. Estimated 8 minutes to mastery.",
    category: "Neuron AI · improvement track",
    btnLabel: "Launch step visualizer"
  },
  {
    id: "quantum_qubits",
    title: "Bloch Sphere spatial simulator for Superposition visualization",
    description: "Interact with quantum states to build physical intuition of superposition and phase rotation. Estimated 12 minutes to mastery.",
    category: "Neuron AI · quantum track",
    btnLabel: "Launch AR sphere"
  }
];

function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [upcoming, setUpcoming] = useState<{ label: string; when: string; dot: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateTime, setDateTime] = useState<Date>(new Date());

  // Modal / Interaction states
  const [activeRec, setActiveRec] = useState(recommendationPaths[0]);
  const [showPathsModal, setShowPathsModal] = useState(false);
  const [showArModal, setShowArModal] = useState(false);

  // Digital Clock timer
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Live Notifications Simulation
  useEffect(() => {
    const students = ["Jia Wen", "Marcus Tate", "Priya Raman", "Diego Luna", "Sofia Mendez", "Ethan Brooks", "Lara Petrov", "Kenji Watanabe"];
    const actions = [
      "started the LKG English Phonics course!",
      "completed a watch of the States of Matter video!",
      "passed the Quadratic Equations quiz with 85%!",
      "earned the Welcome Badge 👋",
      "earned the Kick Start Badge 🚀",
      "scored 100% on the Data Structures & Algorithms quiz!",
      "increased their daily learning streak to 20 days! 🔥",
      "minted a new verifiable credential certificate!"
    ];

    const sim = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every 8s
        const student = students[Math.floor(Math.random() * students.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const msg = `${student} ${action}`;
        
        toast(msg, {
          icon: "⚡",
          description: "Live activity",
        });

        // Dispatch a custom event so AppShell's notification system catches it
        const customEvent = new CustomEvent("live-notification", {
          detail: { text: msg, when: "Just now" }
        });
        window.dispatchEvent(customEvent);
      }
    }, 8000);

    return () => clearInterval(sim);
  }, []);

  const loadProfile = () => {
    api.getUserProfile()
      .then(setUser)
      .catch((err) => console.error("Error loading user profile:", err));
  };

  useEffect(() => {
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  useEffect(() => {
    Promise.all([
      api.getUserProfile(),
      api.getCourses(),
      api.getLeaderboard(),
      api.getScheduleBlocks(),
      api.getCertificates(),
    ])
      .then(([userData, allCourses, leadData, scheduleData, certificatesData]) => {
        setUser(userData);
        // Find titles/courseNames of completed courses (for which user has a certificate)
        const completedCourseTitles = new Set(
          certificatesData.map(cert => (cert.courseName || cert.title).toLowerCase().trim())
        );

        const email = userData?.email || "default";
        const mappedCourses = allCourses.map(c => {
          const savedProgress = localStorage.getItem(`video_progress_${email}_${c.title}`);
          const progress = savedProgress ? parseInt(savedProgress, 10) : 0;
          return {
            ...c,
            progressPercent: progress
          };
        });

        // filter active and review courses, keeping only started (>= 1%) and unfinished (<= 99%) ones
        const activeOrReview = mappedCourses.filter(c => {
          const isCompleted = completedCourseTitles.has(c.title.toLowerCase().trim());
          return c.progressPercent >= 1 && c.progressPercent <= 99 && !isCompleted;
        });

        setActiveCourses(activeOrReview);
        setLeaderboard(leadData.slice(0, 5));

        // map first 3 schedule blocks to upcoming items
        const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const toneDots = (tone: string) => {
          if (tone.includes("coral")) return "bg-coral";
          if (tone.includes("primary")) return "bg-primary";
          if (tone.includes("violet")) return "bg-violet";
          return "bg-sky";
        };

        const mappedUpcoming = scheduleData.slice(0, 3).map(b => ({
          label: b.t,
          when: `${daysOfWeek[b.day]} · ${b.start}:00`,
          dot: toneDots(b.tone)
        }));
        setUpcoming(mappedUpcoming);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !user) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto h-[60vh] grid place-items-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Syncing learning OS...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const firstName = user.name.split(" ")[0];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* greeting */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0 text-left">
            <div className="text-xs font-mono uppercase tracking-[0.15em] text-primary flex items-center gap-2 flex-wrap">
              <span>{formatDate(dateTime)}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-violet font-semibold tracking-wider">{formatTime(dateTime)}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              Welcome back, {firstName}.
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              You're <span className="text-foreground font-medium">2 lessons</span> away from your weekly goal.
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">XP today</div>
              <div className="font-display font-bold">+{user.xpToday}</div>
            </div>
          </div>
        </div>

        {/* stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Flame} tone="coral" label="Streak" value={`${user.streak} days`} hint={`best: ${user.bestStreak}`} />
          <StatCard icon={Trophy} tone="lime" label="Class rank" value={user.classRank} hint={`of ${user.totalClassRank}`} />
          <StatCard icon={Target} tone="violet" label="Mastery" value={`${user.mastery}%`} hint="+6 this week" />
          <StatCard icon={Clock} tone="sky" label="Focus time" value={user.focusTime} hint="this week" />
        </div>

        {/* main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* continue learning */}
          <section className="lg:col-span-2 space-y-4">
            <SectionHeader title="Continue learning" right={`${activeCourses.length} active paths`} />
            <div className="space-y-3">
              {activeCourses.map((c) => (
                <CourseRow key={c.title} {...c} />
              ))}
            </div>

            {/* AI recommendation */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-violet/10 p-5 mt-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--glow-lime)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary">
                    {activeRec.category}
                  </div>
                  <h3 className="font-display font-semibold text-lg mt-1">
                    {activeRec.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeRec.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => setShowArModal(true)}
                      className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:opacity-90 shadow-[var(--glow-lime)] transition-colors"
                    >
                      {activeRec.btnLabel}
                    </button>
                    <button 
                      onClick={() => setShowPathsModal(true)}
                      className="rounded-full border border-border bg-background/40 px-4 py-1.5 text-xs font-medium hover:bg-background transition-colors"
                    >
                      Show me other paths
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* right column */}
          <section className="space-y-6">
            {/* badges */}
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <SectionHeader title="Badges" right={`${user.badges.filter(b => b.earned).length} / ${user.badges.length}`} small />
              <div className="grid grid-cols-4 gap-3 mt-4">
                {user.badges.map((b, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl grid place-items-center text-xl ${
                      b.earned
                        ? "bg-gradient-to-br from-primary to-sky text-primary-foreground shadow-[var(--glow-lime)]"
                        : "bg-muted/40 text-muted-foreground/40 border border-dashed border-border"
                    }`}
                    title={b.label}
                  >
                    {b.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* leaderboard */}
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <SectionHeader title="Class leaderboard" right="this week" small />
              <ul className="mt-4 space-y-2">
                {leaderboard.map((p, i) => (
                  <li
                    key={p.name}
                    className={`flex items-center gap-3 rounded-lg p-2 ${
                      p.name === user.name ? "bg-primary/10 border border-primary/30" : ""
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : i < 3
                          ? "bg-sky/30 text-sky"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.xp.toLocaleString()} XP</div>
                    </div>
                    {p.name === user.name && <span className="text-[10px] font-mono uppercase text-primary">you</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* upcoming */}
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <SectionHeader title="Up next" small />
              <ul className="mt-4 space-y-3">
                {upcoming.map((u) => (
                  <li key={u.label} className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${u.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{u.label}</div>
                      <div className="text-xs text-muted-foreground">{u.when}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      {/* Alternative Recommendations Modal */}
      {showPathsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card/90 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPathsModal(false)}
              className="absolute top-5 right-5 p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close recommendations"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Adaptive Learning Tracks
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Select a learning track suggested by Neuron AI based on your mastery profile.</p>
            
            <div className="space-y-3">
              {recommendationPaths.map((p) => {
                const isActive = p.id === activeRec.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveRec(p);
                      setShowPathsModal(false);
                      toast.success(`Track switched to: ${p.id.replace("_", " ")}`);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isActive
                        ? "border-primary/50 bg-primary/10 shadow-lg"
                        : "border-border bg-background/40 hover:border-border/80 hover:bg-background/80"
                    }`}
                  >
                    <div className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{p.category}</div>
                      <h4 className="font-display font-semibold text-sm mt-1">{p.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AR Lab / Simulator Modal */}
      {showArModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card/95 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowArModal(false)}
              className="absolute top-6 right-6 p-1.5 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close simulator"
            >
              <X className="h-5 w-5" />
            </button>
            
            {activeRec.id === "eigenvectors" && (
              <EigenvectorsLab onClose={() => setShowArModal(false)} />
            )}
            
            {activeRec.id === "gradient_descent" && (
              <GradientDescentLab onClose={() => setShowArModal(false)} />
            )}
            
            {activeRec.id === "quantum_qubits" && (
              <BlochSphereLab onClose={() => setShowArModal(false)} />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

// -----------------------------------------------------------------------------
// Component 1: Eigenvectors Lab Visualizer
// -----------------------------------------------------------------------------
function EigenvectorsLab({ onClose }: { onClose: () => void }) {
  const [angle, setAngle] = useState(45);
  const [submitting, setSubmitting] = useState(false);

  const rad = (angle * Math.PI) / 180;
  const vx = Math.cos(rad);
  const vy = Math.sin(rad);
  // Linear Transformation A = [2, 0; 0, 1]
  const ax = 2 * vx;
  const ay = 1 * vy;

  const isAligned = angle % 90 === 0;
  const eigenvalue = angle % 180 === 0 || angle % 360 === 0 ? "2.0" : "1.0";

  const handleSubmit = () => {
    setSubmitting(true);
    api.addXP(150)
      .then(() => {
        toast.success("Eigenvectors visual proof submitted! +150 XP awarded.", { icon: "⚡" });
        window.dispatchEvent(new Event("profile-updated"));
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to submit proof.");
        setSubmitting(false);
      });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ space lab simulator</div>
      <h2 className="font-display text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
        <Sliders className="h-6 w-6 text-primary" /> Visual Eigenvectors Lab
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        We apply matrix transformation <strong className="text-foreground">A = [2, 0; 0, 1]</strong> to stretch space along the X-axis. 
        Drag the angle slider. When vector <span className="text-yellow-400 font-semibold">v</span> and transformed vector <span className="text-purple-400 font-semibold">Av</span> point in the exact same direction, <span className="text-yellow-400 font-semibold">v</span> is an <strong className="text-foreground">Eigenvector</strong>!
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mt-6">
        <div className="aspect-square bg-background border border-border/80 rounded-2xl relative grid place-items-center overflow-hidden">
          <svg className="w-64 h-64 overflow-visible" viewBox="0 0 200 200">
            <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.04)" fill="none" strokeWidth="1" />
            <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.04)" fill="none" strokeWidth="1" />
            
            {isAligned && (
              <circle cx="100" cy="100" r="90" className="stroke-primary/20 fill-none stroke-[3] animate-ping" />
            )}

            {/* Transformed Av */}
            <line 
              x1="100" 
              y1="100" 
              x2={100 + ax * 40} 
              y2={100 - ay * 40} 
              stroke="rgb(168, 85, 247)" 
              strokeWidth="3.5" 
              strokeLinecap="round"
            />
            <circle cx={100 + ax * 40} cy={100 - ay * 40} r="4" fill="rgb(168, 85, 247)" />
            
            {/* Vector v */}
            <line 
              x1="100" 
              y1="100" 
              x2={100 + vx * 40} 
              y2={100 - vy * 40} 
              stroke="rgb(234, 179, 8)" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            <circle cx={100 + vx * 40} cy={100 - vy * 40} r="3" fill="rgb(234, 179, 8)" />
          </svg>

          <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-[10px] font-mono text-muted-foreground bg-background/80 backdrop-blur rounded-lg p-2 border border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-yellow-500" /> Vector v
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-purple-500" /> Transformed Av
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Vector Rotation Angle</span>
              <span className="text-primary font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0° (X)</span>
              <span>90° (Y)</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Computation Values</div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>v = ({vx.toFixed(2)}, {vy.toFixed(2)})</div>
              <div>Av = ({ax.toFixed(2)}, {ay.toFixed(2)})</div>
            </div>
            
            {isAligned ? (
              <div className="bg-primary/25 border border-primary/40 rounded-xl p-3 text-center">
                <div className="text-xs font-semibold text-primary">🎯 EIGENVECTOR ALIGNED!</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Eigenvalue (λ) = {eigenvalue}</div>
              </div>
            ) : (
              <div className="bg-muted/40 border border-dashed border-border/80 rounded-xl p-3 text-center text-xs text-muted-foreground">
                Rotate angle to 0°, 90°, 180°, 270°, or 360° to find the eigenvectors.
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!isAligned || submitting}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold shadow-[var(--glow-lime)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Submitting..." : isAligned ? "Submit Visual Proof (+150 XP)" : "Align Vector to Complete Lab"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component 2: Gradient Descent Lab Visualizer
// -----------------------------------------------------------------------------
function GradientDescentLab({ onClose }: { onClose: () => void }) {
  const [learningRate, setLearningRate] = useState(0.3);
  const [ballX, setBallX] = useState(-2.5);
  const [steps, setSteps] = useState<number[]>([-2.5]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "slow" | "optimal" | "diverged">("idle");
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setBallX(-2.5);
    setSteps([-2.5]);
    setStatus("idle");
  };

  const handleRun = () => {
    handleReset();
    setIsRunning(true);
    let currentX = -2.5;
    const history = [-2.5];
    let count = 0;

    intervalRef.current = setInterval(() => {
      count++;
      // Function J(w) = w^2. Gradient dJ/dw = 2w.
      // Descent step: w_new = w_old - learningRate * (2 * w_old) = w_old * (1 - 2 * learningRate)
      const nextX = currentX * (1 - 2 * learningRate);
      currentX = nextX;
      history.push(nextX);
      setBallX(nextX);
      setSteps([...history]);

      // Check convergence/divergence
      if (Math.abs(nextX) < 0.05) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        if (learningRate < 0.15) {
          setStatus("slow");
        } else {
          setStatus("optimal");
        }
      } else if (Math.abs(nextX) > 5.0 || count >= 15) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        if (Math.abs(nextX) > 5.0) {
          setStatus("diverged");
        } else {
          setStatus("slow");
        }
      }
    }, 250);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    api.addXP(150)
      .then(() => {
        toast.success("Gradient Descent proof submitted! +150 XP awarded.", { icon: "⚡" });
        window.dispatchEvent(new Event("profile-updated"));
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to submit proof.");
        setSubmitting(false);
      });
  };

  // Convert w coordinate [-3, 3] to SVG pixels
  const getSvgCoords = (w: number) => {
    const x = 100 + w * 28;
    const y = 160 - (w * w) * 14; // y pointing down, invert function height
    return { x, y };
  };

  // Build parabola path
  let parabolaPath = "M 16 34";
  for (let w = -3; w <= 3; w += 0.2) {
    const { x, y } = getSvgCoords(w);
    if (w === -3) {
      parabolaPath = `M ${x} ${y}`;
    } else {
      parabolaPath += ` L ${x} ${y}`;
    }
  }

  const ballCoords = getSvgCoords(ballX);

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ optimization lab</div>
      <h2 className="font-display text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
        <Sliders className="h-6 w-6 text-primary" /> Gradient Descent Optimizer
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Find the minimum of the loss function <strong className="text-foreground">J(w) = w²</strong>.
        Tweak the Learning Rate. If too small, it converges slowly. If too large (&gt;1.0), it overshoots and diverges. Find the **optimal rate (e.g. 0.3)** to slide safely to the bottom!
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mt-6">
        {/* Parabola Visualizer */}
        <div className="aspect-square bg-background border border-border/80 rounded-2xl relative grid place-items-center overflow-hidden">
          <svg className="w-64 h-64 overflow-visible animate-in fade-in" viewBox="0 0 200 200">
            {/* Grid */}
            <line x1="0" y1="160" x2="200" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            
            {/* Parabola */}
            <path d={parabolaPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            
            {/* Minimum target cross */}
            <circle cx="100" cy="160" r="5" stroke="rgba(132, 204, 22, 0.4)" strokeWidth="1" fill="none" />
            
            {/* Connection path points */}
            {steps.length > 1 && (
              <polyline
                points={steps.map(w => {
                  const { x, y } = getSvgCoords(w);
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke="rgba(168, 85, 247, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}
            
            {/* Ball */}
            {ballCoords.y <= 190 && ballCoords.y >= 0 && (
              <circle cx={ballCoords.x} cy={ballCoords.y} r="6" fill="rgb(234, 179, 8)" className="transition-all duration-200" />
            )}
          </svg>

          <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-[10px] font-mono text-muted-foreground bg-background/80 backdrop-blur rounded-lg p-2 border border-border/40">
            <div>Global Minimum w = 0</div>
            <div>Steps Count: {steps.length - 1}</div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Learning Rate (α)</span>
              <span className="text-primary font-bold">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.2"
              step="0.05"
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0.05 (Slow)</span>
              <span>0.30 (Opt)</span>
              <span>1.00+ (Diverges)</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex-1 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Play className="h-3.5 w-3.5" /> Run Descent
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold hover:bg-accent flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
          
          <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Status & Analytics</div>
            <div className="text-xs font-mono">
              Current w = <span className="font-bold text-foreground">{ballX.toFixed(3)}</span>
            </div>
            
            {status === "optimal" && (
              <div className="bg-primary/25 border border-primary/40 rounded-xl p-3 text-center">
                <div className="text-xs font-semibold text-primary">🎯 OPTIMAL CONVERGENCE!</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Found minimum in {steps.length - 1} steps.</div>
              </div>
            )}
            {status === "slow" && (
              <div className="bg-coral/15 border border-coral/30 rounded-xl p-3 text-center text-xs text-coral">
                ⚠️ Learning rate too small. Convergence is extremely slow. Try α = 0.3.
              </div>
            )}
            {status === "diverged" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center text-xs text-red-400">
                💥 DIVERGENCE! The step size is too large causing values to oscillate and grow infinitely. Reset and reduce rate.
              </div>
            )}
            {status === "idle" && (
              <div className="bg-muted/40 border border-dashed border-border/80 rounded-xl p-3 text-center text-xs text-muted-foreground">
                Select learning rate and run descent steps to begin optimization.
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={status !== "optimal" || submitting}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold shadow-[var(--glow-lime)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Submitting..." : status === "optimal" ? "Submit Visual Proof (+150 XP)" : "Achieve Optimal Convergence to Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component 3: Bloch Sphere Quantum Simulator
// -----------------------------------------------------------------------------
function BlochSphereLab({ onClose }: { onClose: () => void }) {
  const [theta, setTheta] = useState(45); // Polar angle 0-180
  const [phi, setPhi] = useState(45);     // Azimuthal angle 0-360
  const [submitting, setSubmitting] = useState(false);

  // Bloch vector coordinates:
  // x = sin(theta) * cos(phi)
  // y = sin(theta) * sin(phi)
  // z = cos(theta)
  const radTheta = (theta * Math.PI) / 180;
  const radPhi = (phi * Math.PI) / 180;
  
  const bx = Math.sin(radTheta) * Math.cos(radPhi);
  const by = Math.sin(radTheta) * Math.sin(radPhi);
  const bz = Math.cos(radTheta);

  // 3D Isometric projection coordinate map
  // Center is (100, 100). Radius R = 60.
  const projX = 100 + bx * 60 - by * 25;
  const projY = 100 - bz * 60 + by * 15;

  const isSuperposition = theta === 90 && phi === 0;

  const handleSubmit = () => {
    setSubmitting(true);
    api.addXP(150)
      .then(() => {
        toast.success("Superposition visual proof submitted! +150 XP awarded.", { icon: "⚡" });
        window.dispatchEvent(new Event("profile-updated"));
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to submit proof.");
        setSubmitting(false);
      });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ quantum physics lab</div>
      <h2 className="font-display text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
        <Sliders className="h-6 w-6 text-primary" /> Bloch Sphere Simulator
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Rotate the qubit vector into the equal superposition state <strong className="text-foreground">|+⟩</strong>. 
        Adjust the angles until the polar angle is <span className="text-yellow-400 font-semibold">θ = 90°</span> and the phase is <span className="text-yellow-400 font-semibold">φ = 0°</span> (pointing directly forward along the positive X-axis).
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mt-6">
        {/* Bloch Sphere SVG */}
        <div className="aspect-square bg-background border border-border/80 rounded-2xl relative grid place-items-center overflow-hidden">
          <svg className="w-64 h-64 overflow-visible" viewBox="0 0 200 200">
            {/* Sphere Sphere outline */}
            <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.18)" fill="none" strokeWidth="1" />
            
            {/* Equator Ellipse */}
            <ellipse cx="100" cy="100" rx="60" ry="18" stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Prime Meridian Ellipse */}
            <ellipse cx="100" cy="100" rx="25" fill="none" ry="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Axes */}
            {/* Z axis (|0> - |1>) */}
            <line x1="100" y1="32" x2="100" y2="168" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="96" y="26" fill="rgba(255,255,255,0.8)" className="font-mono text-[10px]">|0⟩</text>
            <text x="96" y="180" fill="rgba(255,255,255,0.8)" className="font-mono text-[10px]">|1⟩</text>

            {/* X axis (Superposition |+>) */}
            <line x1="100" y1="100" x2="160" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="165" y="75" fill="rgba(255,255,255,0.4)" className="font-mono text-[8px]">Y</text>
            
            {/* Y axis */}
            <line x1="100" y1="100" x2="40" y2="125" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="30" y="132" fill="rgba(255,255,255,0.8)" className="font-mono text-[9px]">|+⟩ (X)</text>
            
            {/* Target highlight ring */}
            <circle cx="160" cy="100" r="6" stroke="rgba(132, 204, 22, 0.4)" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />

            {/* Qubit Vector Arrow */}
            <line 
              x1="100" 
              y1="100" 
              x2={projX} 
              y2={projY} 
              stroke="rgb(168, 85, 247)" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            <circle cx={projX} cy={projY} r="4" fill="rgb(168, 85, 247)" />
          </svg>

          <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-[10px] font-mono text-muted-foreground bg-background/80 backdrop-blur rounded-lg p-2 border border-border/40">
            <div>State Equation:</div>
            <div>|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩</div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Polar Angle (θ)</span>
                <span className="text-primary font-bold">{theta}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={theta}
                onChange={(e) => setTheta(Number(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Azimuthal Phase (φ)</span>
                <span className="text-primary font-bold">{phi}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={phi}
                onChange={(e) => setPhi(Number(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          
          <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Qubit Vector Coordinates</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
              <div>x: {bx.toFixed(2)}</div>
              <div>y: {by.toFixed(2)}</div>
              <div>z: {bz.toFixed(2)}</div>
            </div>
            
            {isSuperposition ? (
              <div className="bg-primary/25 border border-primary/40 rounded-xl p-3 text-center">
                <div className="text-xs font-semibold text-primary">🎯 SUPERPOSITION ALIGNED!</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">State: (|0⟩ + |1⟩) / √2</div>
              </div>
            ) : (
              <div className="bg-muted/40 border border-dashed border-border/80 rounded-xl p-3 text-center text-xs text-muted-foreground">
                Adjust sliders to θ = 90° and φ = 0° to align with superposition state.
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!isSuperposition || submitting}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold shadow-[var(--glow-lime)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Submitting..." : isSuperposition ? "Submit Visual Proof (+150 XP)" : "Align Qubit to Superposition to Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: typeof Flame;
  tone: "coral" | "lime" | "violet" | "sky";
  label: string;
  value: string;
  hint: string;
}) {
  const tones: Record<string, string> = {
    coral: "bg-coral/15 text-coral",
    lime: "bg-primary/15 text-primary",
    violet: "bg-violet/15 text-violet",
    sky: "bg-sky/15 text-sky",
  };
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-4">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[10px] font-mono text-muted-foreground/70">{hint}</div>
      </div>
    </div>
  );
}

function CourseRow({ title, modules, progressPercent, nextLesson, status }: Course) {
  return (
    <div className="group rounded-2xl border border-border bg-card/60 p-4 sm:p-5 hover:border-primary/40 transition-colors">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start sm:flex sm:items-center sm:gap-4">
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label={`Resume ${title}`}
        >
          {status === "review" ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1 col-start-1 row-start-2 sm:row-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold truncate">{title}</h3>
            {status === "review" && (
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] bg-sky/20 text-sky px-2 py-0.5 rounded-full">
                cert ready
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{modules}</div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sky"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground truncate">
            <span className="font-mono text-primary">▸ </span>
            {nextLesson}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-sm font-bold">{progressPercent}%</div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">complete</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, right, small }: { title: string; right?: string; small?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-2">
      <h2
        className={`font-display font-semibold tracking-tight ${
          small ? "text-base" : "text-xl"
        }`}
      >
        {title}
      </h2>
      {right && <span className="text-xs font-mono text-muted-foreground uppercase tracking-[0.15em]">{right}</span>}
    </div>
  );
}
