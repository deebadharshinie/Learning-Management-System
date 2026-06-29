import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  hours: { type: Number, default: 0 },
  rating: { type: Number, default: 0.0 },
  students: { type: Number, default: 0 },
  level: { type: String, default: "Beginner" },
  new: { type: Boolean, default: false },
  modules: { type: String, default: "10 modules" },
  progressPercent: { type: Number, default: 0 },
  nextLesson: { type: String, default: "" },
  status: { type: String, default: "new" }, // 'active', 'review', 'new'
  youtubeId: { type: String, default: "" },
  quiz: [{
    question: String,
    options: [String],
    answerIndex: Number
  }]
}, { timestamps: true });

export const Course = mongoose.model("Course", courseSchema);
