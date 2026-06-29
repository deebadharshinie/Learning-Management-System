import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  icon: String,
  label: String,
  earned: Boolean
});

const userSchema = new mongoose.Schema({
  name: { type: String, default: "Aisha Khan" },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 3980 },
  xpToday: { type: Number, default: 340 },
  streak: { type: Number, default: 12 },
  bestStreak: { type: Number, default: 28 },
  classRank: { type: String, default: "#4" },
  totalClassRank: { type: Number, default: 184 },
  mastery: { type: Number, default: 71 },
  focusTime: { type: String, default: "8h 24m" },
  badges: [badgeSchema],
  age: { type: Number, default: 21 },
  dob: { type: String, default: "2005-06-15" },
  highestEducation: { type: String, default: "Undergraduate (CS)" },
  address: { type: String, default: "Chennai, India" },
  skills: { type: [String], default: ["JavaScript", "React", "TypeScript", "Node.js", "Python"] },
  projects: {
    type: [
      {
        title: String,
        description: String,
        link: String
      }
    ],
    default: [
      { title: "Neuron Learning OS", description: "An adaptive learning platform using React & Node.", link: "https://github.com" }
    ]
  },
  socialLinks: {
    type: {
      github: String,
      linkedin: String,
      twitter: String
    },
    default: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    }
  },
  avatarUrl: { type: String, default: "" }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
