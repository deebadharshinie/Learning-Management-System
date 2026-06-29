import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { connectDB, getDbMode } from "./config/db.js";
import { User } from "./models/User.js";
import { Course } from "./models/Course.js";
import { Thread } from "./models/Thread.js";
import { Message } from "./models/Message.js";
import { Certificate } from "./models/Certificate.js";
import { ScheduleBlock } from "./models/ScheduleBlock.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "neuron-secret-key-123456789";
const PASSWORD_SALT = "neuron-salt-key-987654321";

export function hashPassword(password) {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, data, signature] = token.split(".");
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch (e) {
    return null;
  }
}

const defaultUsers = [
  {
    name: "Aisha Khan",
    email: "aisha@neuron.lms",
    password: hashPassword("password123"),
    xp: 3980,
    xpToday: 340,
    streak: 12,
    bestStreak: 28,
    classRank: "#4",
    totalClassRank: 184,
    mastery: 71,
    focusTime: "8h 24m",
    age: 21,
    dob: "2005-06-15",
    highestEducation: "Undergraduate (CS)",
    address: "Chennai, India",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "Python"],
    projects: [
      { title: "Neuron Learning OS", description: "An adaptive learning platform using React & Node.", link: "https://github.com" }
    ],
    socialLinks: {
      github: "https://github.com/aisha",
      linkedin: "https://linkedin.com/in/aisha",
      twitter: "https://twitter.com/aisha"
    },
    avatarUrl: "",
    badges: [
      { icon: "👋", label: "Welcome badge", earned: true },
      { icon: "🚀", label: "Kick Start", earned: true },
      { icon: "🔥", label: "Streak 7", earned: true },
      { icon: "🧠", label: "Mind", earned: true },
      { icon: "⚡", label: "Speed", earned: true },
      { icon: "🏆", label: "Top 10", earned: true },
      { icon: "⚡", label: "Streak 75", earned: false },
      { icon: "💯", label: "Century", earned: false },
      { icon: "👑", label: "Elite", earned: false },
    ]
  },
  {
    name: "Jia Wen",
    email: "jia@neuron.lms",
    password: hashPassword("password123"),
    xp: 4820,
    xpToday: 0,
    streak: 42,
    bestStreak: 45,
    classRank: "#1",
    totalClassRank: 184,
    mastery: 85,
    focusTime: "12h 15m",
    age: 22,
    dob: "2004-03-12",
    highestEducation: "Postgraduate (Physics)",
    address: "Singapore",
    skills: ["Quantum Computing", "Python", "Physics"],
    projects: [],
    socialLinks: { github: "", linkedin: "", twitter: "" },
    avatarUrl: "",
    badges: [{ icon: "👋", label: "Welcome badge", earned: true }]
  },
  {
    name: "Marcus Tate",
    email: "marcus@neuron.lms",
    password: hashPassword("password123"),
    xp: 4640,
    xpToday: 0,
    streak: 31,
    bestStreak: 35,
    classRank: "#2",
    totalClassRank: 184,
    mastery: 82,
    focusTime: "10h 30m",
    age: 23,
    dob: "2003-08-25",
    highestEducation: "Undergraduate (Math)",
    address: "London, UK",
    skills: ["Calculus", "Linear Algebra", "Machine Learning"],
    projects: [],
    socialLinks: { github: "", linkedin: "", twitter: "" },
    avatarUrl: "",
    badges: [{ icon: "👋", label: "Welcome badge", earned: true }]
  },
  { name: "Priya Raman", email: "priya@neuron.lms", password: hashPassword("password123"), xp: 4210, streak: 28, focusTime: "9h 45m", mastery: 79, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 21, dob: "2005-01-19", highestEducation: "Undergraduate (Bio)", address: "Mumbai, India", skills: ["Biology"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Diego Luna", email: "diego@neuron.lms", password: hashPassword("password123"), xp: 3720, streak: 19, focusTime: "7h 15m", mastery: 68, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 22, dob: "2004-11-05", highestEducation: "Undergraduate (CS)", address: "Madrid, Spain", skills: ["Algorithms"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Hana Sato", email: "hana@neuron.lms", password: hashPassword("password123"), xp: 3590, streak: 8, focusTime: "6h 50m", mastery: 65, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 20, dob: "2006-05-14", highestEducation: "Undergraduate (Arts)", address: "Tokyo, Japan", skills: ["Graphic Design"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Ethan Brooks", email: "ethan@neuron.lms", password: hashPassword("password123"), xp: 3410, streak: 22, focusTime: "8h 10m", mastery: 63, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 21, dob: "2005-09-02", highestEducation: "Undergraduate (CS)", address: "New York, USA", skills: ["Web Dev"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Sofia Mendez", email: "sofia@neuron.lms", password: hashPassword("password123"), xp: 3220, streak: 15, focusTime: "5h 40m", mastery: 60, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 22, dob: "2004-07-22", highestEducation: "Undergraduate (Economics)", address: "Buenos Aires, Argentina", skills: ["Economics"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Kenji Watanabe", email: "kenji@neuron.lms", password: hashPassword("password123"), xp: 3050, streak: 9, focusTime: "4h 30m", mastery: 55, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 23, dob: "2003-10-10", highestEducation: "Undergraduate (CS)", address: "Kyoto, Japan", skills: ["Security"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" },
  { name: "Lara Petrov", email: "lara@neuron.lms", password: hashPassword("password123"), xp: 2890, streak: 14, focusTime: "5h 15m", mastery: 52, badges: [{ icon: "👋", label: "Welcome badge", earned: true }], age: 21, dob: "2005-12-01", highestEducation: "Undergraduate (CS)", address: "Sofia, Bulgaria", skills: ["Database Systems"], projects: [], socialLinks: { github: "", linkedin: "", twitter: "" }, avatarUrl: "" }
];

const defaultCourses = [
  {
    title: "LKG English Phonics & Rhymes",
    category: "Pre-School",
    hours: 2,
    rating: 4.8,
    students: 1200,
    level: "LKG",
    new: true,
    modules: "3 modules",
    progressPercent: 0,
    nextLesson: "Letter Sounds & Phonics Song",
    status: "new",
    youtubeId: "hq3yfQnllfQ",
    quiz: [
      {
        question: "What sound does the letter 'A' make?",
        options: ["/æ/ as in Apple", "/b/ as in Ball", "/k/ as in Cat", "/d/ as in Dog"],
        answerIndex: 0
      },
      {
        question: "Which word starts with the letter 'B'?",
        options: ["Apple", "Banana", "Cat", "Dog"],
        answerIndex: 1
      },
      {
        question: "What is the sound of letter 'C'?",
        options: ["/æ/", "/b/", "/k/", "/d/"],
        answerIndex: 2
      }
    ]
  },
  {
    title: "UKG Basic Number Counting & Addition",
    category: "Pre-School",
    hours: 3,
    rating: 4.7,
    students: 1500,
    level: "UKG",
    new: true,
    modules: "4 modules",
    progressPercent: 0,
    nextLesson: "Counting Objects from 1 to 10",
    status: "new",
    youtubeId: "vR4pVGNisZA",
    quiz: [
      {
        question: "What is 2 + 3?",
        options: ["4", "5", "6", "7"],
        answerIndex: 1
      },
      {
        question: "How many fingers do you have on one hand?",
        options: ["2", "4", "5", "10"],
        answerIndex: 2
      },
      {
        question: "If you have 1 apple and get 1 more, how many do you have?",
        options: ["1", "2", "3", "4"],
        answerIndex: 1
      }
    ]
  },
  {
    title: "Class 5 General Science: States of Matter",
    category: "School",
    hours: 5,
    rating: 4.9,
    students: 3100,
    level: "Class 5",
    new: false,
    modules: "5 modules",
    progressPercent: 0,
    nextLesson: "Solids, Liquids, and Gases basics",
    status: "new",
    youtubeId: "wclY8F-UoTE",
    quiz: [
      {
        question: "Which state of matter has a fixed shape and volume?",
        options: ["Liquid", "Gas", "Solid", "Plasma"],
        answerIndex: 2
      },
      {
        question: "What happens to ice when it melts?",
        options: ["It turns into gas", "It turns into liquid water", "It becomes harder", "It disappears"],
        answerIndex: 1
      },
      {
        question: "Air is an example of which state of matter?",
        options: ["Solid", "Liquid", "Gas", "Vapor"],
        answerIndex: 2
      }
    ]
  },
  {
    title: "Class 10 Algebra: Quadratic Equations",
    category: "School",
    hours: 8,
    rating: 4.8,
    students: 8400,
    level: "Class 10",
    new: false,
    modules: "8 modules",
    progressPercent: 0,
    nextLesson: "The Quadratic Formula derivation",
    status: "new",
    youtubeId: "EfT4qUeF7xM",
    quiz: [
      {
        question: "What is the standard form of a quadratic equation?",
        options: ["ax + b = 0", "ax² + bx + c = 0", "y = mx + c", "ax³ + bx² + cx + d = 0"],
        answerIndex: 1
      },
      {
        question: "What is the quadratic formula used to find the roots of ax² + bx + c = 0?",
        options: [
          "x = [-b ± √(b² - 4ac)] / (2a)",
          "x = [b ± √(b² - 4ac)] / 2",
          "x = [-b ± √(b² + 4ac)] / 2a",
          "x = [-d ± √(b² - 4ac)] / 2a"
        ],
        answerIndex: 0
      },
      {
        question: "What is the discriminant of a quadratic equation ax² + bx + c = 0?",
        options: ["b² - 4ac", "b² + 4ac", "√(b² - 4ac)", "-b / 2a"],
        answerIndex: 0
      }
    ]
  },
  {
    title: "Class 12 Physics: Electromagnetism & Fields",
    category: "School",
    hours: 12,
    rating: 4.9,
    students: 9200,
    level: "Class 12",
    new: true,
    modules: "10 modules",
    progressPercent: 0,
    nextLesson: "Coulomb's Law and electric field lines",
    status: "new",
    youtubeId: "XoVW7CRR5JY",
    quiz: [
      {
        question: "Which law defines the electrostatic force between two point charges?",
        options: ["Gauss's Law", "Ohm's Law", "Coulomb's Law", "Ampere's Law"],
        answerIndex: 2
      },
      {
        question: "What is the unit of electric charge?",
        options: ["Volt", "Ampere", "Coulomb", "Ohm"],
        answerIndex: 2
      },
      {
        question: "What does Gauss's Law relate?",
        options: [
          "Electric flux to enclosed charge",
          "Magnetic force to current",
          "Voltage to resistance",
          "Current to magnetic flux"
        ],
        answerIndex: 0
      }
    ]
  },
  {
    title: "Engineering CS: Data Structures & Algorithms",
    category: "Engineering",
    hours: 24,
    rating: 4.9,
    students: 15400,
    level: "Undergraduate",
    new: false,
    modules: "12 modules",
    progressPercent: 0,
    nextLesson: "Time Complexity & Big O notation",
    status: "active",
    youtubeId: "4_HOnhB64Dg",
    quiz: [
      {
        question: "What is the average time complexity of searching in a Balanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIndex: 1
      },
      {
        question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
        options: ["Queue", "Linked List", "Stack", "Heap"],
        answerIndex: 2
      },
      {
        question: "Which sorting algorithm has a worst-case time complexity of O(n²)?",
        options: ["Merge Sort", "Quick Sort", "Heap Sort", "Radix Sort"],
        answerIndex: 1
      }
    ]
  },
  {
    title: "Linear Algebra · Visual",
    category: "Math",
    hours: 12,
    rating: 4.9,
    students: 22100,
    level: "Undergraduate",
    new: false,
    modules: "10 modules",
    progressPercent: 0,
    nextLesson: "Vectors, span, and linear combinations",
    status: "new",
    youtubeId: "5oZ84mlt7tM",
    quiz: [
      {
        question: "What is a vector in linear algebra?",
        options: ["A magnitude and direction", "A scalar value only", "A matrix of zeros", "An equation with no solutions"],
        answerIndex: 0
      },
      {
        question: "What is the identity matrix?",
        options: ["A matrix with ones on the main diagonal and zeros elsewhere", "A matrix with all ones", "A matrix with all zeros", "A matrix that cannot be inverted"],
        answerIndex: 0
      },
      {
        question: "What is the determinant of an identity matrix?",
        options: ["0", "1", "-1", "Undefined"],
        answerIndex: 1
      }
    ]
  },
  {
    title: "Intro to Statistics",
    category: "Math",
    hours: 15,
    rating: 4.8,
    students: 14300,
    level: "High School",
    new: true,
    modules: "6 modules",
    progressPercent: 0,
    nextLesson: "Mean, median, and mode definitions",
    status: "new",
    youtubeId: "XZo4xyJXCak",
    quiz: [
      {
        question: "What is the mean of a data set?",
        options: ["The middle value", "The most frequent value", "The average of all values", "The difference between highest and lowest values"],
        answerIndex: 2
      },
      {
        question: "What is the median of a data set?",
        options: ["The middle value when sorted", "The average value", "The most common value", "The standard deviation"],
        answerIndex: 0
      },
      {
        question: "Which statistic measures the spread of data relative to the mean?",
        options: ["Mean", "Median", "Mode", "Standard Deviation"],
        answerIndex: 3
      }
    ]
  },
  {
    title: "Python for Science",
    category: "Engineering",
    hours: 18,
    rating: 4.9,
    students: 19800,
    level: "Beginner",
    new: true,
    modules: "8 modules",
    progressPercent: 0,
    nextLesson: "Setting up Anaconda and NumPy arrays",
    status: "new",
    youtubeId: "PCZS9wqBUuE",
    quiz: [
      {
        question: "Which library is most commonly used for scientific calculations in Python?",
        options: ["Django", "NumPy", "Flask", "Pygame"],
        answerIndex: 1
      },
      {
        question: "What does Pandas library in Python primarily deal with?",
        options: ["Game development", "Data analysis and manipulation", "Web scraping", "Image rendering"],
        answerIndex: 1
      },
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        answerIndex: 1
      }
    ]
  }
];

const defaultThreads = [
  {
    title: "Intuition behind backpropagation chain rule",
    author: "Marcus Tate",
    course: "ML Foundations",
    replies: 24,
    votes: 87,
    tag: "question",
    aiModeration: "Top answer verified by AI moderator · 3 references cited"
  },
  {
    title: "Why does superposition collapse on measurement?",
    author: "Lara Petrov",
    course: "Quantum 101",
    replies: 41,
    votes: 132,
    tag: "discussion",
    aiModeration: "Active AI tutor in thread"
  },
  {
    title: "Study group for Systems Design — Thursdays?",
    author: "Diego Luna",
    course: "Systems Design",
    replies: 12,
    votes: 38,
    tag: "meetup"
  },
  {
    title: "Stuck on eigenvector derivation — visual proof?",
    author: "Aisha Khan",
    course: "Linear Algebra",
    replies: 8,
    votes: 22,
    tag: "question",
    aiModeration: "AI suggested AR module · 14 min"
  },
  {
    title: "Resources for behavioral economics field studies?",
    author: "Sofia Mendez",
    course: "Behavioral Econ",
    replies: 6,
    votes: 17,
    tag: "resources"
  }
];

const defaultMessages = [
  {
    role: "ai",
    text: "Hey Aisha — I've read your last 6 quizzes. Want to revisit gradient descent, or jump into eigenvectors with a visual proof?"
  },
  {
    role: "user",
    text: "Eigenvectors please — visual."
  },
  {
    role: "ai",
    text: "Perfect. Imagine stretching a rubber sheet: most arrows you draw on it will rotate AND scale when you stretch. But a few special arrows — the eigenvectors — only scale, never rotating. The scale factor is the eigenvalue. Want me to launch the AR lab where you can grab and stretch one yourself?"
  }
];

const defaultCertificates = [
  {
    title: "Linear Algebra · Visual",
    issuer: "Neuron Academy",
    date: "Mar 14, 2026",
    hash: "0x8f3a…b21c",
    grade: "A+",
    minted: true,
    userEmail: "aisha@neuron.lms"
  },
  {
    title: "Intro to Statistics",
    issuer: "Neuron Academy",
    date: "Jan 02, 2026",
    hash: "0x4d9e…a002",
    grade: "A",
    minted: true,
    userEmail: "aisha@neuron.lms"
  },
  {
    title: "Python for Science",
    issuer: "Neuron Academy",
    date: "Nov 18, 2025",
    hash: "0x1c2b…f74e",
    grade: "A",
    minted: true,
    userEmail: "aisha@neuron.lms"
  }
];

const defaultBlocks = [
  { day: 0, start: 9, len: 2, t: "ML lecture", tone: "bg-primary/80 text-primary-foreground" },
  { day: 0, start: 14, len: 1, t: "Deep focus: gradient descent", tone: "bg-violet/70 text-foreground", ai: true },
  { day: 1, start: 10, len: 1, t: "Quiz prep", tone: "bg-coral/70 text-foreground" },
  { day: 1, start: 15, len: 2, t: "AR lab — eigenvectors", tone: "bg-sky/70 text-foreground", ai: true },
  { day: 2, start: 11, len: 2, t: "Group project", tone: "bg-violet/70 text-foreground" },
  { day: 3, start: 9, len: 1, t: "Quantum lecture", tone: "bg-primary/80 text-primary-foreground" },
  { day: 3, start: 17, len: 2, t: "Forum mentor hour", tone: "bg-coral/70 text-foreground" },
  { day: 4, start: 10, len: 3, t: "Deep work block", tone: "bg-violet/70 text-foreground", ai: true },
  { day: 5, start: 11, len: 2, t: "Optional: AR cellular biology", tone: "bg-sky/70 text-foreground" }
];

// Initialize in-memory DB arrays
let memUsers = [...defaultUsers];
let memCourses = [...defaultCourses];
let memThreads = [...defaultThreads];
let memMessages = [...defaultMessages];
let memCertificates = [...defaultCertificates];
let memBlocks = [...defaultBlocks];

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token." });
  }

  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      const user = memUsers.find(u => u.email === decoded.email);
      if (!user) return res.status(401).json({ error: "User not found." });
      req.user = user;
    } else {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ error: "User not found." });
      req.user = user;
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Register Route
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const dbMode = getDbMode();
  try {
    const initialBadges = [
      { icon: "👋", label: "Welcome badge", earned: true },
      { icon: "🚀", label: "Kick Start", earned: false },
      { icon: "⚡", label: "Streak 75", earned: false },
      { icon: "💯", label: "Century", earned: false },
      { icon: "👑", label: "Elite", earned: false },
    ];

    if (dbMode.isInMemory) {
      const exists = memUsers.some(u => u.email === email);
      if (exists) return res.status(400).json({ error: "Email already registered" });

      const newUser = {
        name,
        email,
        password: hashPassword(password),
        xp: 50,
        xpToday: 50,
        streak: 1,
        bestStreak: 1,
        classRank: "#100",
        totalClassRank: memUsers.length + 1,
        mastery: 0,
        focusTime: "0h 0m",
        badges: initialBadges,
        age: 21,
        dob: "2005-06-15",
        highestEducation: "Undergraduate (CS)",
        address: "Chennai, India",
        skills: ["JavaScript", "React", "TypeScript"],
        projects: [
          { title: "Neuron Learning OS", description: "An adaptive learning platform using React & Node.", link: "https://github.com" }
        ],
        socialLinks: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com"
        },
        avatarUrl: ""
      };
      memUsers.push(newUser);
      const token = generateToken({ email: newUser.email });
      return res.json({ token, user: newUser });
    } else {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "Email already registered" });

      const newUser = await User.create({
        name,
        email,
        password: hashPassword(password),
        xp: 50,
        xpToday: 50,
        streak: 1,
        bestStreak: 1,
        classRank: "#100",
        totalClassRank: (await User.countDocuments({})) + 1,
        mastery: 0,
        focusTime: "0h 0m",
        badges: initialBadges,
        age: 21,
        dob: "2005-06-15",
        highestEducation: "Undergraduate (CS)",
        address: "Chennai, India",
        skills: ["JavaScript", "React", "TypeScript"],
        projects: [
          { title: "Neuron Learning OS", description: "An adaptive learning platform using React & Node.", link: "https://github.com" }
        ],
        socialLinks: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com"
        },
        avatarUrl: ""
      });
      const token = generateToken({ userId: newUser._id, email: newUser.email });
      return res.json({ token, user: newUser });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      const user = memUsers.find(u => u.email === email);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = generateToken({ email: user.email });
      return res.json({ token, user });
    } else {
      const user = await User.findOne({ email });
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = generateToken({ userId: user._id, email: user.email });
      return res.json({ token, user });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API Endpoints

// 1. GET User profile
app.get("/api/user/profile", requireAuth, async (req, res) => {
  return res.json(req.user);
});

// 1b. PUT User profile
app.put("/api/user/profile", requireAuth, async (req, res) => {
  const { name, age, dob, highestEducation, address, skills, projects, socialLinks, avatarUrl } = req.body;
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      if (name !== undefined) req.user.name = name;
      if (age !== undefined) req.user.age = Number(age);
      if (dob !== undefined) req.user.dob = dob;
      if (highestEducation !== undefined) req.user.highestEducation = highestEducation;
      if (address !== undefined) req.user.address = address;
      if (skills !== undefined) req.user.skills = skills;
      if (projects !== undefined) req.user.projects = projects;
      if (socialLinks !== undefined) req.user.socialLinks = socialLinks;
      if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
      return res.json(req.user);
    } else {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (age !== undefined) updateData.age = Number(age);
      if (dob !== undefined) updateData.dob = dob;
      if (highestEducation !== undefined) updateData.highestEducation = highestEducation;
      if (address !== undefined) updateData.address = address;
      if (skills !== undefined) updateData.skills = skills;
      if (projects !== undefined) updateData.projects = projects;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      const u = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      );
      return res.json(u);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. POST increment XP
app.post("/api/user/xp", requireAuth, async (req, res) => {
  const { xpToAdd } = req.body;
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      req.user.xp += (xpToAdd || 0);
      req.user.xpToday += (xpToAdd || 0);
      return res.json(req.user);
    } else {
      const u = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { xp: xpToAdd || 0, xpToday: xpToAdd || 0 } },
        { new: true }
      );
      return res.json(u);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET Courses catalog
app.get("/api/courses", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      return res.json(memCourses);
    } else {
      const cList = await Course.find({});
      return res.json(cList);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. GET AI Tutor chat history
app.get("/api/ai-tutor/chat", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      return res.json(memMessages);
    } else {
      const mList = await Message.find({}).sort({ createdAt: 1 });
      return res.json(mList);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. POST AI Tutor chat message
app.post("/api/ai-tutor/chat", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  const dbMode = getDbMode();
  try {
    // Generate AI response (live via Gemini API if key is present, otherwise fallback to local simulator)
    let aiResponse = "";
    const systemPrompt = `You are "Neuron AI", an elite, interactive 24/7 AI tutor on the Neuron LMS platform.
Your purpose is to tutor students in their courses which range from LKG to Engineering:
1. LKG English Phonics & Rhymes
2. UKG Basic Number Counting & Addition
3. Class 5 General Science: States of Matter
4. Class 10 Algebra: Quadratic Equations
5. Class 12 Physics: Electromagnetism & Fields
6. Engineering CS: Data Structures & Algorithms

Guidelines:
- Act as a supportive, encouraging, and highly knowledgeable tutor.
- Keep your answers concise, clear, and easy to read.
- Use formatting (bullet points, simple code block formatting) where appropriate.
- Never write overly verbose essays; structure your help so students can learn and digest step-by-step.
- Reference Neuron LMS features like interactive AR labs or practice quizzes when relevant.`;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: systemPrompt + "\n\nStudent question:\n" + text }]
                }
              ]
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            aiResponse = data.candidates[0].content.parts[0].text;
          }
        } else {
          console.error("Gemini API error status:", response.status);
        }
      } catch (err) {
        console.error("Failed to connect to Gemini API:", err);
      }
    }

    // Fallback dictionary if Gemini API key not set or failed
    if (!aiResponse) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes("gradient descent")) {
        aiResponse = "Gradient descent is an optimization algorithm used to minimize a loss function by iteratively moving in the direction of steepest descent. Let's look at the mathematical formula: θ = θ - α * ∇J(θ). Want me to load a visual graph showing how step size impacts convergence?";
      } else if (lowerText.includes("eigenvalue") || lowerText.includes("eigenvector")) {
        aiResponse = "Excellent question! An eigenvector of a square matrix A is a non-zero vector v such that Av = λv. The scalar λ is the eigenvalue. Visually, it means the vector's direction remains unchanged after transformation, only its magnitude scales. Would you like a practice quiz on this?";
      } else if (lowerText.includes("lkg") || lowerText.includes("phonics")) {
        aiResponse = "Phonics instruction is vital for early reading! For LKG students, we focus on letter-sound correspondences, like how 'A' sounds like '/æ/' as in apple, 'B' sounds like '/b/' as in ball, and 'C' sounds like '/k/' as in cat. Sing-along phonics songs make it super engaging! Would you like to review letter sounds?";
      } else if (lowerText.includes("ukg") || lowerText.includes("addition") || lowerText.includes("counting")) {
        aiResponse = "For UKG addition, we focus on combining small numbers using concrete objects (like apples, stars, or fingers) to find the sum. For example, if you have 2 stars and get 3 more, you count them all up to get 5 stars! Let know if you'd like to practice some basic addition.";
      } else if (lowerText.includes("class 5") || lowerText.includes("science") || lowerText.includes("matter")) {
        aiResponse = "For Class 5 General Science, a key topic is States of Matter. Matter exists in three main states: Solids (fixed shape and volume, like a rock), Liquids (takes shape of container but fixed volume, like water), and Gases (no fixed shape or volume, like air). Let me know which state you'd like to learn about!";
      } else if (lowerText.includes("class 10") || lowerText.includes("quadratic") || lowerText.includes("equation")) {
        aiResponse = "For Class 10 Quadratic Equations, the standard form is ax² + bx + c = 0. We can solve it using factorization, completing the square, or the quadratic formula: x = [-b ± √(b² - 4ac)] / (2a). Let me know if you want to walk through how to solve one step-by-step!";
      } else if (lowerText.includes("class 12") || lowerText.includes("physics") || lowerText.includes("electromagnetism")) {
        aiResponse = "Class 12 Electromagnetism covers Electric Charges and Fields, Gauss's Law, Ampere's Law, Electromagnetic Induction, and Maxwell's Equations. The key idea is that electric charges create electric fields, and moving charges (currents) create magnetic fields! What specific topic can I clarify?";
      } else if (lowerText.includes("engineering") || lowerText.includes("data structures") || lowerText.includes("algorithms") || lowerText.includes("dsa")) {
        aiResponse = "Data Structures & Algorithms (DSA) is the core of CS Engineering. Key topics include Time Complexity (Big O notation), Linear Structures (Arrays, Linked Lists, Stacks, Queues), Hierarchical Structures (Trees, Graphs), and search/sort algorithms. Let's discuss Binary Search, Tree Traversals, or Dynamic Programming!";
      } else {
        aiResponse = `That's a fascinating learning path! Regarding "${text}", I've analyzed your current progress and recommend connecting it with visual examples. I'll load relevant materials to your course view now. What specific area should we zoom into?`;
      }
    }

    if (dbMode.isInMemory) {
      const userMsg = { role: "user", text, createdAt: new Date() };
      const aiMsg = { role: "ai", text: aiResponse, createdAt: new Date() };
      memMessages.push(userMsg);
      memMessages.push(aiMsg);

      // Give 50 XP to user for asking a question!
      req.user.xp += 50;
      req.user.xpToday += 50;

      return res.json({ messages: memMessages, xpAdded: 50 });
    } else {
      const userMsg = await Message.create({ role: "user", text });
      const aiMsg = await Message.create({ role: "ai", text: aiResponse });

      // Give 50 XP
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { xp: 50, xpToday: 50 } }
      );

      const mList = await Message.find({}).sort({ createdAt: 1 });
      return res.json({ messages: mList, xpAdded: 50 });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. GET Leaderboard
app.get("/api/leaderboard", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      // sort memUsers by XP descending
      const sorted = [...memUsers].sort((a, b) => b.xp - a.xp);
      return res.json(sorted);
    } else {
      const list = await User.find({}).sort({ xp: -1 });
      return res.json(list);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. GET Certificates
app.get("/api/certificates", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      const userCerts = memCertificates.filter(c => c.userEmail === req.user.email);
      return res.json(userCerts);
    } else {
      const list = await Certificate.find({ userId: req.user._id });
      return res.json(list);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 7b. POST Create Certificate
app.post("/api/certificates", requireAuth, async (req, res) => {
  const { title, courseName, grade, startDate, endDate } = req.body;
  if (!title || !grade) {
    return res.status(400).json({ error: "Title and grade are required" });
  }
  const dbMode = getDbMode();
  try {
    const hash = "0x" + crypto.randomBytes(4).toString("hex") + "..." + crypto.randomBytes(4).toString("hex");
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    const newCertObj = {
      title,
      courseName: courseName || title,
      recipientName: req.user.name,
      startDate: startDate || "Jun 01, 2026",
      endDate: endDate || date,
      issuer: "Neuron Academy",
      date,
      hash,
      grade,
      minted: true,
      userEmail: req.user.email
    };

    // Award Kick Start badge if not already earned
    let earnedKickStart = false;
    const kickStartBadge = req.user.badges.find(b => b.label === "Kick Start");
    if (kickStartBadge && !kickStartBadge.earned) {
      kickStartBadge.earned = true;
      earnedKickStart = true;
    }

    if (dbMode.isInMemory) {
      memCertificates.push(newCertObj);
      return res.json({ certificate: newCertObj, earnedKickStart });
    } else {
      const dbCert = await Certificate.create({
        ...newCertObj,
        userId: req.user._id
      });
      if (earnedKickStart) {
        await User.findByIdAndUpdate(
          req.user._id,
          { badges: req.user.badges }
        );
      }
      return res.json({ certificate: dbCert, earnedKickStart });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. GET Forum threads
app.get("/api/forum", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      return res.json(memThreads);
    } else {
      const list = await Thread.find({}).sort({ createdAt: -1 });
      return res.json(list);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. POST Create Forum thread
app.post("/api/forum", requireAuth, async (req, res) => {
  const { title, tag, course } = req.body;
  if (!title || !tag || !course) {
    return res.status(400).json({ error: "Title, tag, and course are required" });
  }

  const dbMode = getDbMode();
  try {
    const newThreadObj = {
      title,
      author: req.user.name,
      course,
      replies: 0,
      votes: 1,
      tag: tag.toLowerCase(),
      aiModeration: "AI reviewing post content for compliance...",
      createdAt: new Date()
    };

    if (dbMode.isInMemory) {
      memThreads.unshift(newThreadObj); // put at top

      // 100 XP for posting a thread!
      req.user.xp += 100;
      req.user.xpToday += 100;

      return res.json({ thread: newThreadObj, xpAdded: 100 });
    } else {
      const dbThread = await Thread.create(newThreadObj);
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { xp: 100, xpToday: 100 } }
      );
      return res.json({ thread: dbThread, xpAdded: 100 });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 10. GET Schedule blocks
app.get("/api/schedule", requireAuth, async (req, res) => {
  const dbMode = getDbMode();
  try {
    if (dbMode.isInMemory) {
      const userBlocks = memBlocks.filter(b => b.userEmail === req.user.email);
      if (userBlocks.length === 0) {
        const seeded = defaultBlocks.map(b => ({ ...b, userEmail: req.user.email }));
        memBlocks.push(...seeded);
        return res.json(seeded);
      }
      return res.json(userBlocks);
    } else {
      let list = await ScheduleBlock.find({ userId: req.user._id });
      if (list.length === 0) {
        const seeded = defaultBlocks.map(b => ({ ...b, userId: req.user._id, userEmail: req.user.email }));
        list = await ScheduleBlock.insertMany(seeded);
      }
      return res.json(list);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 10b. POST Add Schedule block
app.post("/api/schedule", requireAuth, async (req, res) => {
  const { day, start, len, t, tone, ai } = req.body;
  if (day === undefined || start === undefined || len === undefined || !t || !tone) {
    return res.status(400).json({ error: "Missing required fields for schedule block" });
  }
  const dbMode = getDbMode();
  try {
    const newBlockObj = {
      day: Number(day),
      start: Number(start),
      len: Number(len),
      t,
      tone,
      ai: Boolean(ai),
      userEmail: req.user.email
    };

    if (dbMode.isInMemory) {
      memBlocks.push(newBlockObj);
      return res.json(newBlockObj);
    } else {
      const dbBlock = await ScheduleBlock.create({
        ...newBlockObj,
        userId: req.user._id
      });
      return res.json(dbBlock);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to DB, then start Express Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Express Backend running on port ${PORT}`);
  });
});
