import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { ShieldCheck, MessageSquare, ArrowUp, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api, ForumThread } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Forum · Neuron LMS" }] }),
  component: Forum,
});

const tagStyles: Record<string, string> = {
  question: "bg-primary/15 text-primary border-primary/30",
  discussion: "bg-violet/15 text-violet border-violet/30",
  meetup: "bg-sky/15 text-sky border-sky/30",
  resources: "bg-coral/15 text-coral border-coral/30",
};

function Forum() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New thread form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("ML Foundations");
  const [tag, setTag] = useState("question");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  function loadThreads() {
    api.getForumThreads()
      .then((data) => {
        setThreads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading forum threads:", err);
        setLoading(false);
      });
  }

  function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !course.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    api.createForumThread(title, tag, course)
      .then(({ thread, xpAdded }) => {
        // optimistic insert at the beginning
        setThreads((prev) => [thread, ...prev]);
        setShowForm(false);
        setTitle("");
        setSubmitting(false);
        
        if (xpAdded > 0) {
          toast.success(`Thread posted! +${xpAdded} XP gained for contributing to the community!`, {
            icon: "⚡",
          });
        } else {
          toast.success("Thread posted successfully!");
        }
      })
      .catch((err) => {
        console.error("Error creating thread:", err);
        toast.error("Failed to post thread. Try again.");
        setSubmitting(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-end sm:flex sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ peer forum</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              Think out loud, together.
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI-moderated to keep conversations focused and civil.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="shrink-0 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-[var(--glow-lime)] hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            {showForm ? <><X className="h-4 w-4" /> Cancel</> : "New thread"}
          </button>
        </div>

        {/* New Thread Form Card */}
        {showForm && (
          <div className="rounded-2xl border border-primary/30 bg-card/80 p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="font-display text-lg font-bold">Start a new discussion</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Thread Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is your question or topic?"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Course / Topic</label>
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  >
                    <option value="ML Foundations">ML Foundations</option>
                    <option value="Quantum 101">Quantum 101</option>
                    <option value="Linear Algebra">Linear Algebra</option>
                    <option value="Systems Design">Systems Design</option>
                    <option value="Behavioral Econ">Behavioral Econ</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tag" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Category Tag</label>
                  <select
                    id="tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm uppercase font-mono tracking-wider outline-none focus:border-primary transition"
                  >
                    <option value="question">Question</option>
                    <option value="discussion">Discussion</option>
                    <option value="meetup">Meetup</option>
                    <option value="resources">Resources</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-[var(--glow-lime)] hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submitting ? "Posting..." : "Post thread"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">AI moderation is on</div>
            <div className="text-muted-foreground text-xs mt-1">
              Toxicity, plagiarism and off-topic posts are auto-flagged. Top answers are
              fact-checked and tagged.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center h-48">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Syncing Peer Forums...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((t, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition animate-in fade-in duration-300"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button className="grid h-9 w-9 place-items-center rounded-lg bg-surface hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <div className="font-mono text-sm font-bold">{t.votes}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${tagStyles[t.tag] || tagStyles.question}`}
                      >
                        {t.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{t.course}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg leading-tight mt-2">
                      {t.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">by {t.author}</div>
                    {t.aiModeration && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        <Sparkles className="h-3 w-3" /> {t.aiModeration}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {t.replies} replies
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
export default Forum;
