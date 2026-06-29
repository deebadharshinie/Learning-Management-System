import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { User } from "./models/User.js";
import { Course } from "./models/Course.js";
import { Thread } from "./models/Thread.js";
import { Message } from "./models/Message.js";
import { Certificate } from "./models/Certificate.js";
import { ScheduleBlock } from "./models/ScheduleBlock.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/neuron_lms";
const PASSWORD_SALT = "neuron-salt-key-987654321";

function hashPassword(password) {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

const usersData = [
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
    badges: [
      { icon: "🔥", label: "Streak 7", earned: true },
      { icon: "🧠", label: "Mind", earned: true },
      { icon: "⚡", label: "Speed", earned: true },
      { icon: "🎯", label: "Sharp", earned: true },
      { icon: "🏆", label: "Top 10", earned: true },
      { icon: "📚", label: "Reader", earned: true },
      { icon: "🌐", label: "Polyglot", earned: false },
      { icon: "🚀", label: "Launch", earned: false },
    ]
  },
  { name: "Jia Wen", email: "jia@neuron.lms", password: hashPassword("password123"), xp: 4820, streak: 42, focusTime: "12h 15m", mastery: 85, badges: [] },
  { name: "Marcus Tate", email: "marcus@neuron.lms", password: hashPassword("password123"), xp: 4640, streak: 31, focusTime: "10h 30m", mastery: 82, badges: [] },
  { name: "Priya Raman", email: "priya@neuron.lms", password: hashPassword("password123"), xp: 4210, streak: 28, focusTime: "9h 45m", mastery: 79, badges: [] },
  { name: "Diego Luna", email: "diego@neuron.lms", password: hashPassword("password123"), xp: 3720, streak: 19, focusTime: "7h 15m", mastery: 68, badges: [] },
  { name: "Hana Sato", email: "hana@neuron.lms", password: hashPassword("password123"), xp: 3590, streak: 8, focusTime: "6h 50m", mastery: 65, badges: [] },
  { name: "Ethan Brooks", email: "ethan@neuron.lms", password: hashPassword("password123"), xp: 3410, streak: 22, focusTime: "8h 10m", mastery: 63, badges: [] },
  { name: "Sofia Mendez", email: "sofia@neuron.lms", password: hashPassword("password123"), xp: 3220, streak: 15, focusTime: "5h 40m", mastery: 60, badges: [] },
  { name: "Kenji Watanabe", email: "kenji@neuron.lms", password: hashPassword("password123"), xp: 3050, streak: 9, focusTime: "4h 30m", mastery: 55, badges: [] },
  { name: "Lara Petrov", email: "lara@neuron.lms", password: hashPassword("password123"), xp: 2890, streak: 14, focusTime: "5h 15m", mastery: 52, badges: [] }
];

const coursesData = [
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
    youtubeId: "HAPfOXr_WhA",
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

const threadsData = [
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

const messagesData = [
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

const certificatesData = [
  {
    title: "Linear Algebra · Visual",
    issuer: "Neuron Academy",
    date: "Mar 14, 2026",
    hash: "0x8f3a…b21c",
    grade: "A+",
    minted: true
  },
  {
    title: "Intro to Statistics",
    issuer: "Neuron Academy",
    date: "Jan 02, 2026",
    hash: "0x4d9e…a002",
    grade: "A",
    minted: true
  },
  {
    title: "Python for Science",
    issuer: "Neuron Academy",
    date: "Nov 18, 2025",
    hash: "0x1c2b…f74e",
    grade: "A",
    minted: true
  }
];

const blocksData = [
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

async function seed() {
  try {
    console.log("Seeding process started. Connecting to MongoDB at " + mongoUri + "...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("Connected to MongoDB for seeding.");

    // Clear old data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Thread.deleteMany({});
    await Message.deleteMany({});
    await Certificate.deleteMany({});
    await ScheduleBlock.deleteMany({});
    console.log("Cleared existing data.");

    // Seed User
    const seededUsers = await User.insertMany(usersData);
    console.log("Seeded " + usersData.length + " users.");

    // Seed Courses
    await Course.insertMany(coursesData);
    console.log("Seeded " + coursesData.length + " courses.");

    // Seed Threads
    await Thread.insertMany(threadsData);
    console.log("Seeded " + threadsData.length + " threads.");

    // Seed Messages
    await Message.insertMany(messagesData);
    console.log("Seeded " + messagesData.length + " messages.");

    // Seed Certificates
    const aisha = seededUsers.find(u => u.email === "aisha@neuron.lms");
    const certificatesWithUser = certificatesData.map(c => ({
      ...c,
      userId: aisha ? aisha._id : null,
      userEmail: "aisha@neuron.lms",
      recipientName: aisha ? aisha.name : "Aisha Sharma"
    }));
    await Certificate.insertMany(certificatesWithUser);
    console.log("Seeded " + certificatesData.length + " certificates.");

    // Seed Schedule blocks
    const blocksWithUser = blocksData.map(b => ({
      ...b,
      userId: aisha ? aisha._id : null,
      userEmail: "aisha@neuron.lms"
    }));
    await ScheduleBlock.insertMany(blocksWithUser);
    console.log("Seeded " + blocksData.length + " schedule blocks.");

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
}

seed();
