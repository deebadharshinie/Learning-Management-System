import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { Search, Star, Clock, Users, X, Play, ShieldCheck, Flame, Trophy, Award, RotateCcw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api, Course, UserProfile } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses · Neuron LMS" }] }),
  component: Courses,
});

const cats = ["All", "Pre-School", "School", "Engineering", "AI", "Math", "Physics", "CS"];

// Recommendations paths definitions for default state
const recommendationPaths = [
  { name: "Visual Math & Physics Track", desc: "For LKG/UKG to Class 12 foundations" },
];

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  // Interaction Modal States
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [videoProgress, setVideoProgress] = useState(0); // 0 to 100
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const playerRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<"video" | "notes">("video");

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [passedQuiz, setPassedQuiz] = useState(false);
  const [mintedCert, setMintedCert] = useState<any>(null);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getUserProfile()])
      .then(([allCourses, u]) => {
        setCourses(allCourses);
        setUser(u);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses page data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let progressInterval: any;

    const initPlayer = () => {
      if (!isMounted || !document.getElementById("youtube-player-container")) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }

      try {
        playerRef.current = new (window as any).YT.Player("youtube-player-container", {
          height: "100%",
          width: "100%",
          videoId: selectedCourse.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            ecver: 2
          },
          events: {
            onStateChange: (event: any) => {
              const state = event.data;
              if (state === (window as any).YT.PlayerState.ENDED) {
                setVideoProgress(100);
                setIsVideoCompleted(true);
                localStorage.setItem(`video_progress_${user?.email || "default"}_${selectedCourse.title}`, "100");
                toast.success("Video watched completely! Quiz is now unlocked.", { icon: "🧠" });
                if (progressInterval) clearInterval(progressInterval);
              } else if (state === (window as any).YT.PlayerState.PLAYING) {
                setIsWatching(true);
                if (progressInterval) clearInterval(progressInterval);
                progressInterval = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === "function" && typeof playerRef.current.getDuration === "function") {
                    try {
                      const current = playerRef.current.getCurrentTime();
                      const duration = playerRef.current.getDuration();
                      if (duration > 0) {
                        const prog = Math.min(99, Math.floor((current / duration) * 100));
                        setVideoProgress((prev) => {
                          const nextProg = Math.max(prev, prog);
                          localStorage.setItem(`video_progress_${user?.email || "default"}_${selectedCourse.title}`, nextProg.toString());
                          return nextProg;
                        });
                      }
                    } catch (e) {}
                  }
                }, 1000);
              } else {
                if (progressInterval) {
                  clearInterval(progressInterval);
                  progressInterval = null;
                }
              }
            }
          }
        });
      } catch (err) {
        console.error("Failed to construct YT player:", err);
      }
    };

    if (!(window as any).YT || !(window as any).YT.Player) {
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        initPlayer();
      };
    } else {
      setTimeout(initPlayer, 150);
    }

    return () => {
      isMounted = false;
      if (progressInterval) clearInterval(progressInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [selectedCourse, activeTab]);

  const handleOpenCourse = (c: Course) => {
    setSelectedCourse(c);
    const saved = localStorage.getItem(`video_progress_${user?.email || "default"}_${c.title}`);
    const initialProgress = saved ? parseInt(saved, 10) : 0;
    setVideoProgress(initialProgress);
    setIsVideoCompleted(initialProgress === 100);
    setIsWatching(false);
    setShowQuiz(false);
    setAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
    setPassedQuiz(false);
    setMintedCert(null);
    setActiveTab("video");
  };



  const selectAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const submitQuiz = async () => {
    if (!selectedCourse || !selectedCourse.quiz) return;
    const questions = selectedCourse.quiz;
    
    // Validate all answered
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answerIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);

    if (percent >= 80) {
      setPassedQuiz(true);
      toast.success(`Outstanding! You passed with ${percent}%!`, { icon: "🏆" });
      
      // Auto-mint certificate
      setMinting(true);
      try {
        const start = "Jun 01, 2026";
        const end = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
        const res = await api.createCertificate(selectedCourse.title, selectedCourse.title, "A+", start, end);
        setMintedCert(res.certificate);
        
        // Add +100 XP to user
        await api.addXP(100);
        window.dispatchEvent(new Event("profile-updated"));
        
        toast.success("+100 XP gained & Certificate minted on-chain!", { icon: "⚡" });
      } catch (err) {
        console.error("Error minting certificate:", err);
        toast.error("Failed to mint certificate. Please try again.");
      } finally {
        setMinting(false);
      }
    } else {
      setPassedQuiz(false);
      toast.error(`Score: ${percent}%. You need at least 80% to pass and earn a certificate.`, { icon: "❌" });
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
    setPassedQuiz(false);
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase());
    
    let matchesCat = activeCat === "All";
    if (activeCat === "Pre-School") {
      matchesCat = c.category === "Pre-School";
    } else if (activeCat === "School") {
      matchesCat = c.category === "School";
    } else if (activeCat === "Engineering") {
      matchesCat = c.category === "Engineering";
    } else if (!matchesCat) {
      matchesCat = c.category.toLowerCase() === activeCat.toLowerCase();
    }
    return matchesSearch && matchesCat;
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="text-left">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ catalog</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            {courses.length > 0 ? `${courses.length.toLocaleString()} adaptive courses.` : "Adaptive courses."}
          </h1>
          <p className="text-muted-foreground mt-1">Every course rewrites itself around how you learn. Spanning LKG to Engineering.</p>
        </div>

        {/* Search */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex">
          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface px-4 py-2.5 border border-border flex-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by category, level, or name (e.g. LKG, Class 10)..."
              className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                activeCat === c
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--glow-lime)]"
                  : "border-border bg-surface hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid place-items-center h-48">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Syncing Course Database...</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <article
                key={c.title}
                onClick={() => handleOpenCourse(c)}
                className="group rounded-2xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div
                  className="aspect-[16/9] relative w-full"
                  style={{
                    background: [
                      "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.78 0.14 220))",
                      "linear-gradient(135deg, oklch(0.88 0.21 130), oklch(0.78 0.14 220))",
                      "linear-gradient(135deg, oklch(0.72 0.2 25), oklch(0.65 0.22 290))",
                    ][i % 3],
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,oklch(1_0_0/0.15),transparent_60%)]" />
                  <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-[0.18em] bg-background/70 backdrop-blur rounded-full px-2.5 py-1 text-foreground">
                    {c.category}
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono bg-violet text-white rounded-full px-2.5 py-0.5">
                    {c.level}
                  </div>
                  {c.new && (
                    <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-[0.18em] bg-primary text-primary-foreground rounded-full px-2.5 py-1 font-semibold">
                      new
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors text-left">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {c.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {c.hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {c.students.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md px-4 overflow-y-auto py-8">
          <div className="w-full max-w-4xl rounded-3xl border border-border bg-card/95 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-auto text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-5 right-5 p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* Left 2 cols: Video player & Quiz details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">{selectedCourse.level} · {selectedCourse.category}</span>
                  <h2 className="font-display text-2xl font-bold mt-1 leading-tight">{selectedCourse.title}</h2>
                </div>

                {/* Tab buttons */}
                <div className="flex border-b border-border/60 pb-px gap-6">
                  <button
                    onClick={() => setActiveTab("video")}
                    className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      activeTab === "video"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Video Lecture
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      activeTab === "notes"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Study Notes
                  </button>
                </div>

                {activeTab === "video" ? (
                  <>
                    {/* Youtube player */}
                    <div className="aspect-[16/9] rounded-2xl bg-black overflow-hidden relative border border-border">
                      {selectedCourse.youtubeId ? (
                        <div id="youtube-player-container" className="absolute inset-0 w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono">
                          No video available
                        </div>
                      )}
                    </div>

                    {/* Video watching controls & Progress */}
                    <div className="p-4 bg-background/50 border border-border rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Video Progress</span>
                        <span className="font-bold text-xs">{videoProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-border bg-card/45 p-6 max-h-[350px] overflow-y-auto text-left relative scrollbar-thin">
                    <MarkdownText text={COURSE_NOTES[selectedCourse.title] || `### 📚 Study Notes\n\nNotes are not configured for this course yet.`} />
                  </div>
                )}

                {/* Quiz section */}
                {isVideoCompleted ? (
                  <div className="border border-border/80 rounded-2xl bg-background/30 p-5 space-y-6">
                    <div className="border-b border-border pb-3 flex justify-between items-center">
                      <h3 className="font-display font-bold text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Practice Quiz Assessment
                      </h3>
                      {quizSubmitted && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${passedQuiz ? "bg-primary/20 text-primary border-primary/35" : "bg-coral/20 text-coral border-coral/35"}`}>
                          Score: {quizScore}%
                        </div>
                      )}
                    </div>

                    {selectedCourse.quiz ? (
                      <div className="space-y-6">
                        {selectedCourse.quiz.map((q, idx) => (
                          <div key={idx} className="space-y-2">
                            <p className="text-sm font-semibold">Q{idx + 1}: {q.question}</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => selectAnswer(idx, oIdx)}
                                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                                    answers[idx] === oIdx
                                      ? "bg-violet/20 border-violet text-foreground font-semibold shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                                      : "border-border/60 hover:bg-accent"
                                  } ${
                                    quizSubmitted && q.answerIndex === oIdx
                                      ? "bg-primary/25 border-primary text-foreground font-bold"
                                      : ""
                                  } ${
                                    quizSubmitted && answers[idx] === oIdx && q.answerIndex !== oIdx
                                      ? "bg-coral/20 border-coral text-foreground"
                                      : ""
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Submit Actions */}
                        {!quizSubmitted ? (
                          <button
                            type="button"
                            onClick={submitQuiz}
                            className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 shadow-[var(--glow-lime)] hover:scale-[1.01] transition"
                          >
                            Submit Quiz Assessment
                          </button>
                        ) : (
                          <div className="space-y-4">
                            {passedQuiz ? (
                              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
                                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                                  <ShieldCheck className="h-4 w-4" /> Verifiable Certificate Awarded!
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  You successfully passed this course assessment with 80% or higher. Your tamper-proof, W3C verifiable credential has been minted on the block registry.
                                </p>
                                {mintedCert && (
                                  <div className="pt-2">
                                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Hash signature</div>
                                    <code className="text-xs font-mono break-all text-primary bg-background/60 p-1.5 rounded border border-border block">
                                      {mintedCert.hash}
                                    </code>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-coral/10 border border-coral/30 rounded-xl space-y-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  You did not reach the 80% passing score threshold. Don't worry — review the material and try again.
                                </p>
                                <button
                                  type="button"
                                  onClick={resetQuiz}
                                  className="inline-flex items-center gap-1.5 bg-coral text-white rounded-lg px-4 py-2 text-xs font-bold hover:opacity-90 transition"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" /> Re-attend Quiz
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-mono">No quiz questions configured.</p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-border rounded-2xl bg-muted/20 text-center space-y-2">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                    <h4 className="font-semibold text-sm">Quiz Locked</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Complete watching the lecture video above in order to unlock the quiz and earn your verifiable certificate.
                    </p>
                  </div>
                )}
              </div>

              {/* Right column: Course leaderboard and details */}
              <div className="space-y-6 md:col-span-1 border-l border-border/60 md:pl-6">
                <div>
                  <h3 className="font-display font-semibold text-sm text-muted-foreground tracking-wider uppercase">Course Stats</h3>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground">Hours</span>
                      <span className="font-semibold">{selectedCourse.hours}h</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-semibold flex items-center gap-0.5"><Star className="h-3 w-3 fill-primary text-primary" /> {selectedCourse.rating}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <span className="text-muted-foreground">Enrolled Students</span>
                      <span className="font-semibold">{selectedCourse.students.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Animated course leaderboard */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-sm text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" /> Live Course Leaders
                  </h3>
                  
                  <ul className="space-y-2 pt-1">
                    {[
                      { name: "Jia Wen", streak: 42, score: "96%", xp: 480 },
                      { name: "Marcus Tate", streak: 31, score: "92%", xp: 320 },
                      { name: "Aisha Khan", streak: 12, score: "90%", xp: 240 },
                    ].map((lead, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-background/50 border border-border/40 animate-in slide-in-from-bottom duration-300 animate-duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span className={`grid h-5 w-5 rounded-full place-items-center font-mono text-[10px] font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate text-left">{lead.name}</div>
                          <div className="text-[10px] text-muted-foreground text-left">{lead.score} quiz grade</div>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-coral font-medium font-mono">
                          <Flame className="h-3 w-3" />
                          <span>{lead.streak}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

const COURSE_NOTES: Record<string, string> = {
  "LKG English Phonics & Rhymes": `### 📚 Phonics & Rhymes Study Guide

Welcome to your first English class! Phonics is the foundation of reading. Let's learn the sounds of the letters together:

#### 🎵 Core Letter Sounds
* **Letter A**: Makes the sound **/æ/**, like in *Apple*.
* **Letter B**: Makes the sound **/b/**, like in *Ball*.
* **Letter C**: Makes the sound **/k/**, like in *Cat*.
* **Letter D**: Makes the sound **/d/**, like in *Dog*.

#### 💡 Learning Practice
1. Point to objects in your room.
2. Ask: "What letter does this start with?"
3. Pronounce the letter sound out loud.`,

  "UKG Basic Number Counting & Addition": `### 🔢 Basic Number Counting & Addition Guide

Mathematics is fun! Today, we learn how to count and do basic addition.

#### 🎯 Counting Numbers
Count from 1 to 10 using objects around you:
* 🍎 1 apple
* 🍎🍎 2 apples
* 🍎🍎🍎 3 apples

#### ➕ Simple Addition Examples
* **1 + 1 = 2**: If you have 1 pencil and your teacher gives you 1 more, you have **2** pencils.
* **2 + 3 = 5**: Count two fingers on one hand, then three fingers on the other hand. Together they make **5**!`,

  "Class 5 General Science: States of Matter": `### 🔬 States of Matter Lecture Notes

Matter is everything around us. Anything that has mass and takes up space is called matter. Matter exists in three main states on Earth:

#### 🪨 1. Solids
* **Properties**: Have a fixed shape and a fixed volume.
* **Explanation**: Particles are packed tightly together and cannot move freely.
* **Examples**: Ice, wood, rocks, iron.

#### 💧 2. Liquids
* **Properties**: Have a fixed volume but take the shape of their container.
* **Explanation**: Particles are close but can flow past each other.
* **Examples**: Water, milk, oil.

#### ☁️ 3. Gases
* **Properties**: Have no fixed shape or volume; they expand to fill any container.
* **Explanation**: Particles are far apart and move very quickly.
* **Examples**: Air, steam, oxygen.`,

  "Class 10 Algebra: Quadratic Equations": `# Algebra: Quadratic Equations – Detailed Explanation

## 1. Introduction

A **quadratic equation** is a polynomial equation of degree **2**. It is one of the most important topics in algebra because it appears in mathematics, physics, engineering, economics, and computer science.

The general form of a quadratic equation is:

\[
ax^2 + bx + c = 0
\]

where:

- \(a\), \(b\), and \(c\) are real numbers.
- \(a \neq 0\) (otherwise the equation becomes linear).
- \(x\) is the unknown variable.

### Example

\[
2x^2 + 5x - 3 = 0
\]

Here,

- \(a = 2\)
- \(b = 5\)
- \(c = -3\)

---

## 2. Standard Form

The standard form is:

\[
ax^2 + bx + c = 0
\]

### Components

| Term | Description |
|------|-------------|
| \(ax^2\) | Quadratic term |
| \(bx\) | Linear term |
| \(c\) | Constant term |

---

## 3. Examples of Quadratic Equations

### Example 1

\[
x^2-9=0
\]

Here,

- \(a=1\)
- \(b=0\)
- \(c=-9\)

---

### Example 2

\[
3x^2+7x+2=0
\]

- \(a=3\)
- \(b=7\)
- \(c=2\)

---

### Example 3

\[
5x^2=20
\]

Rewrite into standard form:

\[
5x^2-20=0
\]

---

# 4. Methods of Solving Quadratic Equations

There are four major methods:

1. Factoring
2. Completing the Square
3. Quadratic Formula
4. Graphical Method

---

# Method 1: Factoring

The equation is expressed as the product of two linear factors.

### Steps

Suppose

\[
x^2+5x+6=0
\]

Find two numbers whose:

- Product = 6
- Sum = 5

The numbers are:

2 and 3

Therefore,

\[
(x+2)(x+3)=0
\]

Now,

\[
x+2=0
\]

or

\[
x+3=0
\]

Hence,

\[
x=-2,\quad x=-3
\]

### Final Answer

\[
x=-2,\,-3
\]

---

## Example

Solve

\[
x^2-7x+12=0
\]

Factor:

\[
(x-3)(x-4)=0
\]

Therefore,

\[
x=3,\quad x=4
\]

---

# Method 2: Completing the Square

Used when factoring is difficult.

### Example

Solve

\[
x^2+6x+5=0
\]

Move constant:

\[
x^2+6x=-5
\]

Take half of 6:

\[
\frac{6}{2}=3
\]

Square it:

\[
3^2=9
\]

Add 9 to both sides:

\[
x^2+6x+9=4
\]

This becomes

\[
(x+3)^2=4
\]

Take square root:

\[
x+3=\pm2
\]

Therefore,

\[
x=-1,\,-5
\]

---

# Method 3: Quadratic Formula

This method works for **every quadratic equation**.

The formula is

\[
x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
\]

### Example

Solve

\[
2x^2+3x-2=0
\]

Here,

- \(a=2\)
- \(b=3\)
- \(c=-2\)

Substitute:

\[
x=\frac{-3\pm\sqrt{3^2-4(2)(-2)}}{2(2)}
\]

\[
=\frac{-3\pm\sqrt{9+16}}{4}
\]

\[
=\frac{-3\pm5}{4}
\]

Two solutions:

First,

\[
x=\frac{2}{4}=\frac12
\]

Second,

\[
x=\frac{-8}{4}=-2
\]

Answer:

\[
x=\frac12,\,-2
\]

---

# Method 4: Graphical Method

A quadratic equation can also be solved by drawing the graph

\[
y=ax^2+bx+c
\]

The solutions are the **x-intercepts** of the graph.

Example:

\[
y=x^2-5x+6
\]

The graph crosses the x-axis at

\[
x=2,\quad x=3
\]

These are the roots.

---

# 5. Nature of Roots

The expression

\[
D=b^2-4ac
\]

is called the **Discriminant**.

It tells us about the roots.

| Discriminant | Nature of Roots |
|--------------|----------------|
| \(D>0\) | Two distinct real roots |
| \(D=0\) | Two equal real roots |
| \(D<0\) | Two complex roots |

---

## Example 1

\[
x^2-5x+6=0
\]

\[
D=25-24=1
\]

Since

\[
D>0
\]

there are two different real roots.

---

## Example 2

\[
x^2-6x+9=0
\]

\[
D=36-36=0
\]

Equal roots.

---

## Example 3

\[
x^2+4x+5=0
\]

\[
D=16-20=-4
\]

Complex roots.

---

# 6. Sum and Product of Roots

If the roots are

\[
\alpha,\beta
\]

then

### Sum

\[
\alpha+\beta=-\frac{b}{a}
\]

### Product

\[
\alpha\beta=\frac{c}{a}
\]

---

## Example

\[
2x^2-5x+3=0
\]

Sum

\[
=\frac{5}{2}
\]

Product

\[
=\frac32
\]

---

# 7. Vertex Form

A quadratic function can be written as

\[
y=a(x-h)^2+k
\]

where

- \((h,k)\) is the vertex.

Example

\[
y=(x-2)^2+3
\]

Vertex:

\[
(2,3)
\]

---

# 8. Graph of Quadratic Function

A quadratic graph is called a **parabola**.

### Opens Upward

If

\[
a>0
\]

Example

\[
y=x^2
\]

Minimum point exists.

---

### Opens Downward

If

\[
a<0
\]

Example

\[
y=-x^2
\]

Maximum point exists.

---

# 9. Axis of Symmetry

Formula

\[
x=-\frac{b}{2a}
\]

Example

\[
y=x^2-6x+5
\]

Axis

\[
x=\frac{6}{2}=3
\]

---

# 10. Real-Life Applications

Quadratic equations are used in:

- Projectile motion
- Bridge construction
- Architecture
- Satellite dishes
- Business profit optimization
- Computer graphics
- Economics
- Engineering design
- Physics
- Robotics

---

# 11. Common Mistakes

### Forgetting Standard Form

Incorrect:

\[
5x^2=20
\]

Correct:

\[
5x^2-20=0
\]

---

### Wrong Sign

Example:

\[
-b
\]

is often written incorrectly.

Always substitute carefully.

---

### Arithmetic Errors

Most mistakes occur while calculating

\[
b^2-4ac
\]

Double-check calculations.

---

# 12. Practice Problems

### Easy

1.

\[
x^2-9=0
\]

2.

\[
x^2+7x+12=0
\]

3.

\[
x^2-10x+25=0
\]

---

### Medium

4.

\[
2x^2+5x-3=0
\]

5.

\[
3x^2-8x+4=0
\]

6.

\[
5x^2+6x+1=0
\]

---

### Challenging

7.

\[
4x^2+4x+7=0
\]

8.

\[
7x^2-2x-3=0
\]

9.

\[
9x^2-12x+4=0
\]

10.

\[
6x^2+11x-35=0
\]

---

# 13. Summary

- A quadratic equation has degree **2**.
- General form:

\[
ax^2+bx+c=0
\]

where \(a \neq 0\).

- Main solving methods:
  - Factoring
  - Completing the Square
  - Quadratic Formula
  - Graphical Method

- The discriminant determines the nature of the roots:

\[
D=b^2-4ac
\]

- Sum of roots:

\[
-\frac{b}{a}
\]

- Product of roots:

\[
\frac{c}{a}
\]

- The graph of a quadratic function is a **parabola**.
- Quadratic equations have wide applications in science, engineering, finance, and technology.

---

# 14. Key Formulas

| Formula | Description |
|----------|-------------|
| \(ax^2+bx+c=0\) | Standard form |
| \(x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}\) | Quadratic formula |
| \(D=b^2-4ac\) | Discriminant |
| \(\alpha+\beta=-\frac{b}{a}\) | Sum of roots |
| \(\alpha\beta=\frac{c}{a}\) | Product of roots |
| \(x=-\frac{b}{2a}\) | Axis of symmetry |
| \(y=a(x-h)^2+k\) | Vertex form |
`,

  "Class 12 Physics: Electromagnetism & Fields": `# Electromagnetism & Fields – Detailed Explanation

## 1. Introduction

**Electromagnetism** is one of the four fundamental forces of nature. It studies the relationship between **electric charges**, **electric fields**, **magnetic fields**, and their interactions.

Electromagnetism explains many everyday phenomena, including:

- Electric current in circuits
- Magnets attracting iron
- Electric motors and generators
- Radio, television, and mobile communication
- Transformers and power transmission

The theory of electromagnetism is primarily described by **Maxwell's Equations**, which unify electricity and magnetism into a single force.

---

# 2. Electric Charge

An **electric charge** is a fundamental property of matter responsible for electric forces.

There are two types of charges:

- Positive (+)
- Negative (−)

### Properties

- Like charges repel.
- Unlike charges attract.
- Charge is conserved.
- Charge is quantized.

The SI unit of charge is

\[
\text{Coulomb (C)}
\]

The charge of one electron is

\[
-1.602 \times 10^{-19}\;C
\]

The charge of one proton is

\[
+1.602 \times 10^{-19}\;C
\]

---

# 3. Coulomb's Law

Coulomb's Law describes the electrostatic force between two point charges.

\[
F=\frac{kq_1q_2}{r^2}
\]

where

- \(F\) = electrostatic force (N)
- \(q_1,q_2\) = charges (C)
- \(r\) = distance between charges (m)
- \(k=8.99\times10^9\,N\,m^2/C^2\)

### Characteristics

- Force increases with larger charges.
- Force decreases with the square of distance.
- Acts along the line joining the charges.

---

## Example

Two charges

\[
2C,\;3C
\]

are separated by

\[
2m
\]

Force

\[
F=\frac{(9\times10^9)(2)(3)}{2^2}
\]

\[
F=13.5\times10^9N
\]

---

# 4. Electric Field

An **electric field** is the region around a charged object where another charge experiences an electric force.

Electric field intensity is

\[
E=\frac{F}{q}
\]

or

\[
E=\frac{kQ}{r^2}
\]

where

- \(E\)=Electric field (N/C)
- \(Q\)=Source charge
- \(r\)=Distance

---

## Electric Field Direction

- Away from positive charge.
- Toward negative charge.

---

# 5. Electric Field Lines

Electric field lines represent the direction and strength of the electric field.

### Rules

- Begin on positive charges.
- End on negative charges.
- Never intersect.
- Closer lines indicate stronger fields.
- Tangent to a field line gives the field direction.

---

# 6. Electric Potential

Electric potential is the work done per unit charge to move a charge from infinity to a point.

\[
V=\frac{W}{q}
\]

or

\[
V=\frac{kQ}{r}
\]

Unit

\[
Volt (V)
\]

---

## Potential Difference

Potential difference between two points is

\[
\Delta V=\frac{W}{q}
\]

It drives electric current through a circuit.

---

# 7. Electric Potential Energy

The potential energy between two charges is

\[
U=\frac{kq_1q_2}{r}
\]

Positive energy indicates repulsion, while negative energy indicates attraction.

---

# 8. Capacitance

A capacitor stores electrical energy.

Capacitance is defined as

\[
C=\frac{Q}{V}
\]

where

- \(C\)=Capacitance (Farad)
- \(Q\)=Charge
- \(V\)=Voltage

---

## Parallel Plate Capacitor

\[
C=\frac{\varepsilon A}{d}
\]

where

- \(A\)=Area
- \(d\)=Distance between plates
- \(\varepsilon\)=Permittivity

---

## Energy Stored

\[
U=\frac12CV^2
\]

---

# 9. Electric Current

Electric current is the rate of flow of electric charge.

\[
I=\frac{Q}{t}
\]

Unit

\[
Ampere (A)
\]

---

## Conventional Current

Flows from

Positive → Negative

Electron flow is

Negative → Positive

---

# 10. Ohm's Law

Ohm's Law relates voltage, current, and resistance.

\[
V=IR
\]

where

- \(V\)=Voltage
- \(I\)=Current
- \(R\)=Resistance

---

## Example

If

\[
V=12V,\quad R=4\Omega
\]

Current

\[
I=\frac{12}{4}=3A
\]

---

# 11. Electrical Resistance

Resistance opposes current flow.

Formula

\[
R=\rho\frac{L}{A}
\]

where

- \(\rho\)=Resistivity
- \(L\)=Length
- \(A\)=Cross-sectional area

Unit

\[
\Omega
\]

---

# 12. Electrical Power

Power is the rate at which electrical energy is consumed.

\[
P=VI
\]

Also,

\[
P=I^2R
\]

and

\[
P=\frac{V^2}{R}
\]

Unit

\[
Watt (W)
\]

---

# 13. Magnetic Field

A magnetic field is the region around a magnet or current-carrying conductor where magnetic forces act.

Unit

\[
Tesla (T)
\]

Symbol

\[
B
\]

---

# 14. Magnetic Field Around a Wire

For a long straight conductor,

\[
B=\frac{\mu_0I}{2\pi r}
\]

where

- \(I\)=Current
- \(r\)=Distance

Magnetic field lines are concentric circles.

Use the **Right-Hand Thumb Rule**:

- Thumb → Current
- Fingers → Magnetic field

---

# 15. Magnetic Force

### On a Moving Charge

\[
F=qvB\sin\theta
\]

where

- \(q\)=Charge
- \(v\)=Velocity
- \(B\)=Magnetic field
- \(\theta\)=Angle

---

### On a Current-Carrying Wire

\[
F=BIL\sin\theta
\]

---

# 16. Lorentz Force

When both electric and magnetic fields exist,

\[
F=q(E+v\times B)
\]

This is called the **Lorentz Force**.

---

# 17. Electromagnetic Induction

Changing magnetic flux induces an emf.

This phenomenon was discovered by **Michael Faraday**.

Faraday's Law

\[
\varepsilon=-\frac{d\Phi}{dt}
\]

where

- \(\varepsilon\)=Induced emf
- \(\Phi\)=Magnetic flux

---

# 18. Magnetic Flux

Magnetic flux measures the number of magnetic field lines passing through a surface.

\[
\Phi=BA\cos\theta
\]

Unit

\[
Weber (Wb)
\]

---

# 19. Lenz's Law

The induced current always opposes the change that produces it.

The negative sign in Faraday's Law represents Lenz's Law.

---

# 20. Self Induction

When a changing current induces emf in the same coil,

\[
\varepsilon=-L\frac{dI}{dt}
\]

where

- \(L\)=Inductance

Unit

\[
Henry (H)
\]

---

# 21. Mutual Induction

A changing current in one coil induces emf in another nearby coil.

This principle is used in transformers.

---

# 22. Electromagnets

An electromagnet is produced when electric current flows through a coil.

Strength increases with

- More turns
- Larger current
- Soft iron core

Applications

- Electric bells
- Cranes
- Relays
- MRI machines

---

# 23. Transformers

Transformers transfer electrical energy using electromagnetic induction.

### Step-Up Transformer

- Voltage increases
- Current decreases

### Step-Down Transformer

- Voltage decreases
- Current increases

Transformer equation

\[
\frac{V_s}{V_p}=\frac{N_s}{N_p}
\]

---

# 24. Electric Motor

An electric motor converts

Electrical Energy → Mechanical Energy

Principle

A current-carrying conductor experiences force in a magnetic field.

Uses

- Fans
- Mixers
- Washing machines
- Electric vehicles

---

# 25. Electric Generator

A generator converts

Mechanical Energy → Electrical Energy

Principle

Faraday's Law of Electromagnetic Induction

Applications

- Hydroelectric plants
- Wind turbines
- Thermal power stations

---

# 26. Maxwell's Equations

Maxwell unified electricity and magnetism into four equations.

They explain

- Electric fields
- Magnetic fields
- Electromagnetic waves
- Light

These equations form the foundation of classical electromagnetism.

---

# 27. Electromagnetic Waves

Changing electric fields produce magnetic fields.

Changing magnetic fields produce electric fields.

This creates electromagnetic waves.

Examples

- Radio waves
- Microwaves
- Infrared
- Visible light
- Ultraviolet
- X-rays
- Gamma rays

All travel at

\[
c=3\times10^8m/s
\]

in vacuum.

---

# 28. Applications of Electromagnetism

Electromagnetism is used in

- Electric motors
- Generators
- Transformers
- Wireless communication
- MRI scanners
- Speakers
- Microphones
- Mobile phones
- Computers
- Electric vehicles
- Particle accelerators
- Satellite communication

---

# 29. Common Mistakes

### Confusing Electric and Magnetic Fields

- Electric fields act on stationary and moving charges.
- Magnetic fields act only on moving charges.

---

### Wrong Direction

Always use

- Right-Hand Rule
- Fleming's Left-Hand Rule
- Fleming's Right-Hand Rule

correctly.

---

### Ignoring Units

Always use SI units.

- Coulomb
- Volt
- Ampere
- Tesla
- Weber
- Henry
- Ohm

---

# 30. Practice Problems

### Easy

1.

Calculate the electric force between two charges using Coulomb's Law.

2.

Find the electric field at a point due to a point charge.

3.

Calculate the current when

\[
Q=20C,\quad t=5s
\]

---

### Medium

4.

Find resistance of a wire using

\[
R=\rho\frac{L}{A}
\]

5.

A capacitor stores

\[
Q=10C,\quad V=5V
\]

Find capacitance.

6.

Find magnetic field around a wire carrying current.

---

### Challenging

7.

Calculate induced emf using Faraday's Law.

8.

Determine force on a moving charge in magnetic field.

9.

A transformer has

\[
N_p=200,\quad N_s=1000
\]

Calculate output voltage if input voltage is

\[
220V
\]

10.

A charged particle enters perpendicular to a magnetic field. Calculate magnetic force.

---

# 31. Summary

- Electromagnetism combines electricity and magnetism into a unified theory.
- Electric charges produce electric fields.
- Moving charges produce magnetic fields.
- Coulomb's Law explains electrostatic force.
- Ohm's Law relates voltage, current, and resistance.
- Faraday's Law explains electromagnetic induction.
- Lenz's Law determines the direction of induced current.
- Transformers, motors, and generators operate using electromagnetic principles.
- Maxwell's Equations describe the behavior of electric and magnetic fields.
- Electromagnetic waves include radio waves, light, X-rays, and gamma rays.

---

# 32. Key Formulas

| Formula | Description |
|----------|-------------|
| \(F=\frac{kq_1q_2}{r^2}\) | Coulomb's Law |
| \(E=\frac{F}{q}=\frac{kQ}{r^2}\) | Electric Field |
| \(V=\frac{W}{q}=\frac{kQ}{r}\) | Electric Potential |
| \(U=\frac{kq_1q_2}{r}\) | Electric Potential Energy |
| \(C=\frac{Q}{V}\) | Capacitance |
| \(C=\frac{\varepsilon A}{d}\) | Parallel Plate Capacitor |
| \(U=\frac12CV^2\) | Energy Stored in Capacitor |
| \(I=\frac{Q}{t}\) | Electric Current |
| \(V=IR\) | Ohm's Law |
| \(R=\rho\frac{L}{A}\) | Resistance |
| \(P=VI=I^2R=\frac{V^2}{R}\) | Electrical Power |
| \(B=\frac{\mu_0I}{2\pi r}\) | Magnetic Field Around Wire |
| \(F=qvB\sin\theta\) | Magnetic Force on Moving Charge |
| \(F=BIL\sin\theta\) | Force on Current-Carrying Wire |
| \(F=q(E+v\times B)\) | Lorentz Force |
| \(\Phi=BA\cos\theta\) | Magnetic Flux |
| \(\varepsilon=-\frac{d\Phi}{dt}\) | Faraday's Law |
| \(\varepsilon=-L\frac{dI}{dt}\) | Self Induction |
| \(\frac{V_s}{V_p}=\frac{N_s}{N_p}\) | Transformer Equation |
`,

  "Engineering CS: Data Structures & Algorithms": `# Data Structures & Algorithms in Java

## Introduction

Data Structures and Algorithms (DSA) are the backbone of computer science and software development. They provide efficient ways to organize, manage, and process data while solving computational problems. Every software application, from mobile apps to enterprise systems, relies on well-designed data structures and algorithms to achieve high performance and scalability.

Java is one of the most popular programming languages for learning and implementing DSA because of its object-oriented features, platform independence, automatic memory management, and extensive Collections Framework. Understanding DSA in Java enables developers to write optimized programs, improve problem-solving skills, and perform well in coding interviews and competitive programming.

---

## What is a Data Structure?

A data structure is a method of organizing and storing data so that it can be accessed and modified efficiently. Different data structures are designed for different purposes, and selecting the appropriate one can significantly improve the performance of an application.

Some commonly used data structures include:

- Arrays
- ArrayList
- LinkedList
- Stack
- Queue
- HashMap
- HashSet
- Trees
- Graphs

...`,

  "Linear Algebra · Visual": `### 📊 Visual Linear Algebra Study Guide

Linear algebra is the study of vectors, vector spaces, and linear transformations.

#### 🎯 Vector Interpretations
* **Computer Science**: An ordered list of numbers.
* **Physics**: An arrow pointing in space, defined by a length (magnitude) and direction.
* **Mathematics**: An object that can be added or scaled.

#### 🔲 Identity Matrix ($I$)
The identity matrix is a square matrix with ones on the main diagonal and zeros elsewhere:
$$I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$$
Multiplying any matrix by $I$ yields the original matrix: $AI = A$.
* **Determinant**: The determinant of the identity matrix is always **1**.`,

  "Intro to Statistics": `### 📈 Intro to Statistics Lecture Notes

Statistics is the discipline that concerns the collection, organization, analysis, and presentation of data.

#### 📊 Measures of Central Tendency
* **Mean**: The sum of all values divided by the total count:
  $$\\mu = \\frac{1}{n} \\sum_{i=1}^n x_i$$
* **Median**: The middle value of a sorted dataset.
* **Mode**: The most frequently occurring value.

#### 📉 Measure of Dispersion
* **Standard Deviation ($\\sigma$)**: Measures the amount of variation or dispersion of a set of values relative to the mean. A low standard deviation indicates that the data points tend to be close to the mean.`,

  "Python for Science": `### 🐍 Python for Scientific Computing

Python is the leading language for data science, modeling, and scientific calculations.

#### 📦 Essential Libraries
* **NumPy**: The core library for scientific computing. It provides high-performance multidimensional array objects.
* **Pandas**: Used for data manipulation and analysis, primarily dealing with structured dataframes.
* **Matplotlib**: Used for plotting graphs and data visualizations.

#### 📝 Function Definition Syntax
Functions are defined using the \`def\` keyword:
\`\`\`python
def calculate_force(mass, acceleration):
    # F = m * a
    return mass * acceleration
\`\`\`
`
};

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const flushList = (key: string | number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (currentTable) {
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 border border-border rounded-xl">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground uppercase font-mono text-[9px] tracking-wider border-b border-border">
              <tr>
                {currentTable.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold text-left">{parseInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {currentTable.rows.map((row, rIndex) => (
                <tr key={rIndex} className="hover:bg-accent/40">
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className="px-4 py-2.5 font-medium text-left">{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  const parseInline = (line: string): React.ReactNode[] => {
    const parts = line.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
      }
      const subparts = part.split("`");
      return subparts.map((subpart, j) => {
        if (j % 2 === 1) {
          return <code key={j} className="bg-muted/70 text-violet px-1.5 py-0.5 rounded font-mono text-[11px] border border-border/40">{subpart}</code>;
        }
        return subpart;
      });
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      flushList(index);
      const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      
      const isSeparator = cells.every(c => c.startsWith(":") || c.startsWith("-") || c.endsWith("-"));
      if (isSeparator) return;

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      return;
    } else {
      flushTable(index);
    }

    if (trimmed.startsWith("###")) {
      flushList(index);
      elements.push(
        <h3 key={index} className="font-display font-bold text-sm tracking-tight text-primary mt-4 mb-2">
          {parseInline(trimmed.substring(3).trim())}
        </h3>
      );
    } else if (trimmed.startsWith("##")) {
      flushList(index);
      elements.push(
        <h2 key={index} className="font-display font-bold text-base tracking-tight text-primary mt-5 mb-2">
          {parseInline(trimmed.substring(2).trim())}
        </h2>
      );
    } else if (trimmed.startsWith("#")) {
      flushList(index);
      elements.push(
        <h1 key={index} className="font-display font-bold text-lg tracking-tight text-primary mt-6 mb-3">
          {parseInline(trimmed.substring(1).trim())}
        </h1>
      );
    } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
      currentList.push(
        <li key={currentList.length} className="text-sm leading-relaxed text-muted-foreground my-0.5">
          {parseInline(trimmed.substring(1).trim())}
        </li>
      );
    } else {
      flushList(index);
      if (trimmed === "") {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-sm leading-relaxed text-muted-foreground mb-2">
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1 text-left w-full overflow-hidden">{elements}</div>;
}
