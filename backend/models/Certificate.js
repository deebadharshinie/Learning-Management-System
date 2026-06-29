import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true }, // serves as courseName
  courseName: { type: String },
  recipientName: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  issuer: { type: String, default: "Neuron Academy" },
  date: { type: String, required: true },
  hash: { type: String, required: true },
  grade: { type: String, required: true },
  minted: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userEmail: { type: String }
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
