import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Trophy,
  Headphones,
  Languages,
  ChevronDown,
  ShieldCheck,
  Boxes,
  ArrowRight,
  Cpu,
  Waves,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neuron LMS — Learn at the speed of thought" },
      {
        name: "description",
        content:
          "An AI-powered learning OS with adaptive paths, gamified streaks, AR/VR labs, and blockchain certificates.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [activeLang, setActiveLang] = useState(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match) {
        const code = match[1];
        if (code === "ta") return "Tamil";
        if (code === "hi") return "Hindi";
      }
    }
    return "English";
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  return (
    <div className="min-h-dvh">
      {/* nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold shadow-[var(--glow-lime)]">
              N
            </div>
            <div className="font-display font-bold tracking-tight text-lg">Neuron</div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#labs" className="hover:text-foreground transition-colors">AR/VR Labs</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
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

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition shadow-[var(--glow-lime)]"
            >
              Enter platform <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-mono text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                v4.2 · adaptive engine online
              </div>
              <h1 className="font-display font-bold tracking-[-0.04em] text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                Learn at the
                <br />
                <span className="text-aurora">speed of thought.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Neuron is the learning OS for the post-syllabus era. Adaptive paths rewrite
                themselves around you. AR labs replace textbooks. Blockchain certificates make
                your skills portable for life.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-[var(--glow-lime)] hover:scale-[1.02] transition"
                >
                  Open student dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-medium hover:bg-surface transition"
                >
                  Browse the catalog
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono text-muted-foreground uppercase tracking-[0.18em]">
                <span>FERPA · GDPR</span>
                <span>SOC 2 Type II</span>
                <span>WCAG 2.2 AA</span>
                <span>W3C VC certs</span>
              </div>
            </div>

            {/* hero visual */}
            <div className="lg:col-span-5">
              <HeroPanel />
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <section id="stats" className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            ["240k+", "active learners"],
            ["1,820", "adaptive courses"],
            ["94%", "completion rate"],
            ["38", "languages supported"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-4xl font-bold tracking-tight">{n}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ the stack</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-3 max-w-2xl">
              Ten systems, one learning surface.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm">
            Each module ships as an independent microservice — courses, analytics, chat, certs —
            but feels like one continuous tool.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* labs */}
      <section id="labs" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-background p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ ar · vr labs</div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-3">
                Walk through a beating heart. Rebuild a Roman aqueduct. Debug a quantum circuit.
              </h2>
              <p className="mt-5 text-muted-foreground max-w-lg">
                Immersive simulations replace static diagrams. Headset optional — every lab also
                runs as WebGL on your laptop or phone.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
                {["Biology", "Mech Eng", "Chemistry", "Architecture", "Quantum", "Surgery"].map((t) => (
                  <span key={t} className="rounded-full border border-border bg-background/50 px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <LabPanel />
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2026 Neuron Learning Systems</div>
          <div className="font-mono text-xs uppercase tracking-[0.18em]">
            built for curious humans
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "Adaptive paths",
    body: "Every lesson reorders itself based on how you actually learn — not how the syllabus assumes you will.",
  },
  {
    icon: Trophy,
    title: "Gamified mastery",
    body: "Streaks, badges, and class leaderboards turn the dopamine loop on study sessions, not Instagram.",
  },
  {
    icon: Cpu,
    title: "AI tutors, on call",
    body: "A GPT-class tutor that's read your textbook, knows your weak spots, and never gets tired of explaining.",
  },
  {
    icon: Languages,
    title: "Voice & translation",
    body: "Lecture audio transcribed in 38 languages. Speak your answer, write it back in any script.",
  },
  {
    icon: Headphones,
    title: "Accessibility-first",
    body: "Screen-reader tested, font scaling, dyslexic-friendly mode, full keyboard nav, dark + light themes.",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain certs",
    body: "Tamper-proof W3C verifiable credentials with a QR. Recruiters can verify in one scan.",
  },
  {
    icon: Boxes,
    title: "Cloud-native",
    body: "Drop files from Drive or OneDrive. Submit from anywhere. Materials follow you across devices.",
  },
  {
    icon: Waves,
    title: "Real-time everything",
    body: "WebSocket-powered notifications, live forums, in-class polls, and presence indicators.",
  },
  {
    icon: Trophy,
    title: "Dropout radar",
    body: "Faculty get early-warning signals — engagement decay, missed deadlines — before students slip away.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card/40 p-6 hover:border-primary/40 transition-all hover:-translate-y-0.5">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display font-semibold text-lg tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function HeroPanel() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-5 shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-4">
        <span>your-path.json</span>
        <span className="text-primary">● live</span>
      </div>
      <div className="space-y-3">
        {[
          { label: "Linear Algebra · eigenvectors", pct: 100, status: "done" },
          { label: "ML · gradient descent", pct: 78, status: "active" },
          { label: "Quantum Computing · qubits", pct: 42, status: "active" },
          { label: "Project — image classifier", pct: 18, status: "queued" },
        ].map((row) => (
          <div key={row.label} className="rounded-xl bg-background/40 border border-border/60 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate pr-3">{row.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{row.pct}%</span>
            </div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  row.status === "done"
                    ? "bg-sky"
                    : row.status === "active"
                    ? "bg-primary"
                    : "bg-violet"
                }`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-primary/10 border border-primary/30 p-3 text-xs">
        <div className="font-mono uppercase tracking-[0.18em] text-primary mb-1">AI suggestion</div>
        <div className="text-foreground/90">
          You're 22% faster on visual proofs. Try the AR linear-algebra lab next.
        </div>
      </div>
    </div>
  );
}

function LabPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-2 aspect-[4/3] relative overflow-hidden shadow-[var(--shadow-elevated)]">
      <div className="absolute inset-2 rounded-xl bg-[radial-gradient(circle_at_30%_30%,oklch(0.65_0.22_290/0.4),transparent_60%),radial-gradient(circle_at_70%_70%,oklch(0.88_0.21_130/0.3),transparent_60%)]">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.88 0.21 130)" />
              <stop offset="100%" stopColor="oklch(0.65 0.22 290)" />
            </linearGradient>
          </defs>
          {Array.from({ length: 14 }).map((_, i) => (
            <circle
              key={i}
              cx={50 + (i * 23) % 320}
              cy={40 + (i * 37) % 220}
              r={2 + (i % 4)}
              fill="url(#grad)"
              opacity={0.7}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1={50 + (i * 23) % 320}
              y1={40 + (i * 37) % 220}
              x2={50 + ((i + 3) * 23) % 320}
              y2={40 + ((i + 3) * 37) % 220}
              stroke="oklch(0.88 0.21 130)"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
        <span className="rounded-full bg-background/80 backdrop-blur px-3 py-1 border border-border">
          lab_neural_net.glb
        </span>
        <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 font-semibold">
          launch ▶
        </span>
      </div>
    </div>
  );
}
