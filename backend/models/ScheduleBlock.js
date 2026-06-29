import mongoose from "mongoose";

const scheduleBlockSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0 to 6 (Mon to Sun)
  start: { type: Number, required: true }, // hour index e.g. 9
  len: { type: Number, required: true }, // duration in hours e.g. 2
  t: { type: String, required: true }, // event title
  tone: { type: String, required: true }, // styling classes
  ai: { type: Boolean, default: false }, // AI-placed block flag
  userEmail: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const ScheduleBlock = mongoose.model("ScheduleBlock", scheduleBlockSchema);
