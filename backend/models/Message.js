import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
