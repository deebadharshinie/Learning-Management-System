import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { useEffect, useState } from "react";
import { api, UserProfile, Project, SocialLinks } from "@/lib/api";
import { toast } from "sonner";
import { User, Calendar, MapPin, GraduationCap, Plus, Trash2, Github, Linkedin, Twitter, Award, Flame, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · Neuron LMS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(21);
  const [dob, setDob] = useState("");
  const [education, setEducation] = useState("");
  const [address, setAddress] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socials, setSocials] = useState<SocialLinks>({ github: "", linkedin: "", twitter: "" });
  const [newSkill, setNewSkill] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // New project states
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjLink, setNewProjLink] = useState("");

  const loadProfile = () => {
    api.getUserProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setAge(data.age || 21);
        setDob(data.dob || "2005-06-15");
        setEducation(data.highestEducation || "Undergraduate (CS)");
        setAddress(data.address || "Chennai, India");
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setSocials(data.socialLinks || { github: "", linkedin: "", twitter: "" });
        setAvatarUrl(data.avatarUrl || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateUserProfile({
        name,
        age,
        dob,
        highestEducation: education,
        address,
        skills,
        projects,
        socialLinks: socials,
        avatarUrl
      });
      setProfile(updated);
      toast.success("Profile updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setShowAvatarModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      toast.error("Skill already exists");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (!newProjTitle.trim()) {
      toast.error("Project title is required");
      return;
    }
    const newProj: Project = {
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      link: newProjLink.trim()
    };
    setProjects([...projects, newProj]);
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjLink("");
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto h-[60vh] grid place-items-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Syncing Profile OS...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const initials = profile.name.split(" ").map((w) => w[0]).join("");

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Profile Header */}
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-violet/10 blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div 
              onClick={() => setShowAvatarModal(true)}
              className="h-24 w-24 rounded-full bg-gradient-to-br from-violet to-sky flex items-center justify-center font-display font-bold text-3xl text-white shadow-lg relative group cursor-pointer overflow-hidden select-none shrink-0"
            >
              {avatarUrl ? (
                avatarUrl.startsWith("http") || avatarUrl.startsWith("data:") ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">{avatarUrl}</span>
                )
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-semibold text-white">Change</span>
              </div>
            </div>
            
            <div className="text-center sm:text-left space-y-2 flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight">{profile.name}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {education}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {address}</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <div className="flex items-center gap-1.5 rounded-full bg-coral/15 text-coral px-3 py-1 text-xs font-semibold border border-coral/20">
                  <Flame className="h-4 w-4" />
                  <span>{profile.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
                  <Award className="h-4 w-4" />
                  <span>{profile.xp.toLocaleString()} Total XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-6 items-start">
          {/* Left panel: Info details */}
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Details
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">D.O.B</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition"
                    placeholder="Engineering Year 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Location Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition"
                    placeholder="Address details"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet" /> Social Connections
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Github className="h-3.5 w-3.5" /> GitHub Link</label>
                  <input
                    type="url"
                    value={socials.github}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary transition text-xs"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5" /> LinkedIn Link</label>
                  <input
                    type="url"
                    value={socials.linkedin}
                    onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary transition text-xs"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Twitter className="h-3.5 w-3.5" /> Twitter Link</label>
                  <input
                    type="url"
                    value={socials.twitter}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary transition text-xs"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold shadow-[var(--glow-lime)] hover:scale-[1.01] transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
            </button>
          </div>

          {/* Right panel: Skills and Projects */}
          <div className="space-y-6 md:col-span-2">
            {/* Skills */}
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border pb-2">Skills Inventory</h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="React, CSS, Calculus..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-xl bg-violet text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground font-mono">No skills added yet.</span>
                ) : (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-background border border-border rounded-full pl-3 pr-2 py-1 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="p-0.5 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Projects Manager */}
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border pb-2">Projects Portfolio</h2>
              
              <div className="bg-background/40 border border-border/60 rounded-xl p-4 space-y-3 text-sm">
                <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-primary">Add New Project</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition"
                    placeholder="Project Title"
                  />
                  <textarea
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition min-h-[60px]"
                    placeholder="Project Description"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newProjLink}
                      onChange={(e) => setNewProjLink(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition"
                      placeholder="Project Repository Link (https://...)"
                    />
                    <button
                      type="button"
                      onClick={addProject}
                      className="rounded-xl bg-violet text-white px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {projects.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">No projects listed yet.</p>
                ) : (
                  projects.map((proj, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 p-3 bg-background/50 border border-border rounded-xl">
                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        <h4 className="font-semibold text-sm">{proj.title}</h4>
                        {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-primary hover:underline block truncate">
                            {proj.link}
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
              Choose Avatar
            </h3>
            <p className="text-xs text-muted-foreground mb-6">Select a preset study emoji avatar or paste a custom image URL.</p>
            
            <div className="space-y-6">
              {/* Predefined Emojis Grid */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Preset Study Emojis
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {["👩‍🎓", "👨‍🎓", "🧑‍💻", "🚀", "🧠", "⚡", "🏆", "🦄", "🐯", "🐼", "🦊", "🧙"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(emoji);
                        setShowAvatarModal(false);
                      }}
                      className={`h-12 rounded-2xl border text-2xl flex items-center justify-center transition-all ${
                        avatarUrl === emoji
                          ? "bg-primary/20 border-primary text-primary-foreground"
                          : "border-border bg-background/40 hover:bg-accent hover:border-border-hover"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local File Upload */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Upload Local Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-file-upload"
                  />
                  <label
                    htmlFor="avatar-file-upload"
                    className="w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border border-dashed bg-background/30 px-4 py-4 text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition"
                  >
                    <span className="text-primary font-mono text-[10px] uppercase tracking-wider">Select file from device</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Supports JPEG, PNG, WEBP (Max 2MB)</span>
                  </label>
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Custom Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrl && avatarUrl.startsWith("http") ? avatarUrl : ""}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl("");
                  setShowAvatarModal(false);
                }}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground transition"
              >
                Reset to Initials
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-xs font-semibold shadow-[var(--glow-lime)] hover:opacity-90 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
