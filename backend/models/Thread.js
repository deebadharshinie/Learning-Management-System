import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  course: { type: String, required: true },
  replies: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  tag: { type: String, default: "question" }, // 'question', 'discussion', 'meetup', 'resources'
  aiModeration: { type: String, default: "" }
}, { timestamps: true });

export const Thread = mongoose.model("Thread", threadSchema);
