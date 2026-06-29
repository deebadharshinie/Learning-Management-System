export interface Badge {
  icon: string;
  label: string;
  earned: boolean;
}

export interface Project {
  title: string;
  description: string;
  link: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
}

export interface UserProfile {
  name: string;
  email: string;
  xp: number;
  xpToday: number;
  streak: number;
  bestStreak: number;
  classRank: string;
  totalClassRank: number;
  mastery: number;
  focusTime: string;
  badges: Badge[];
  age: number;
  dob: string;
  highestEducation: string;
  address: string;
  skills: string[];
  projects: Project[];
  socialLinks: SocialLinks;
  avatarUrl: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Course {
  title: string;
  category: string;
  hours: number;
  rating: number;
  students: number;
  level: string;
  new: boolean;
  modules: string;
  progressPercent: number;
  nextLesson: string;
  status: "active" | "review" | "new";
  youtubeId?: string;
  quiz?: QuizQuestion[];
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  createdAt?: string;
}

export interface ForumThread {
  title: string;
  author: string;
  course: string;
  replies: number;
  votes: number;
  tag: string;
  aiModeration?: string;
}

export interface Certificate {
  title: string;
  courseName?: string;
  recipientName?: string;
  startDate?: string;
  endDate?: string;
  issuer: string;
  date: string;
  hash: string;
  grade: string;
  minted: boolean;
}

export interface ScheduleBlock {
  day: number;
  start: number;
  len: number;
  t: string;
  tone: string;
  ai?: boolean;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("neuron_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/" && !window.location.pathname.startsWith("/auth")) {
        localStorage.removeItem("neuron_token");
        window.location.href = "/auth";
      }
    }
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  // User profile
  getUserProfile: () => request<UserProfile>("/api/user/profile"),
  updateUserProfile: (updates: Partial<UserProfile>) =>
    request<UserProfile>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  addXP: (xpToAdd: number) =>
    request<UserProfile>("/api/user/xp", {
      method: "POST",
      body: JSON.stringify({ xpToAdd }),
    }),

  // Courses
  getCourses: () => request<Course[]>("/api/courses"),

  // AI Tutor
  getChatHistory: () => request<ChatMessage[]>("/api/ai-tutor/chat"),
  sendChatMessage: (text: string) =>
    request<{ messages: ChatMessage[]; xpAdded: number }>("/api/ai-tutor/chat", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Leaderboard
  getLeaderboard: () => request<UserProfile[]>("/api/leaderboard"),

  // Certificates
  getCertificates: () => request<Certificate[]>("/api/certificates"),
  createCertificate: (title: string, courseName: string, grade: string, startDate?: string, endDate?: string) =>
    request<{ certificate: Certificate; earnedKickStart: boolean }>("/api/certificates", {
      method: "POST",
      body: JSON.stringify({ title, courseName, grade, startDate, endDate }),
    }),

  // Peer Forum
  getForumThreads: () => request<ForumThread[]>("/api/forum"),
  createForumThread: (title: string, tag: string, course: string) =>
    request<{ thread: ForumThread; xpAdded: number }>("/api/forum", {
      method: "POST",
      body: JSON.stringify({ title, tag, course }),
    }),

  // Schedule
  getScheduleBlocks: () => request<ScheduleBlock[]>("/api/schedule"),
  createScheduleBlock: (day: number, start: number, len: number, t: string, tone: string, ai?: boolean) =>
    request<ScheduleBlock>("/api/schedule", {
      method: "POST",
      body: JSON.stringify({ day, start, len, t, tone, ai }),
    }),
};
