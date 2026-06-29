import mongoose from "mongoose";

let isUsingInMemory = false;

// Mock database in-memory store
export const inMemoryDb = {
  users: [],
  courses: [],
  threads: [],
  messages: [],
  certificates: [],
  scheduleblocks: []
};

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/neuron_lms";
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // fail quickly (3s timeout) if mongodb is down
    });
    console.log("MongoDB connected successfully.");
    isUsingInMemory = false;
  } catch (error) {
    console.error("\n==================================================");
    console.error("WARNING: Could not connect to MongoDB!");
    console.error("Error details:", error.message);
    console.error("Running in FALLBACK MODE (using in-memory simulated database).");
    console.error("Your changes will not persist across server restarts.");
    console.error("Please ensure MongoDB is running or specify MONGO_URI in server/.env");
    console.error("==================================================\n");
    isUsingInMemory = true;
  }
}

export function getDbMode() {
  return {
    isInMemory: isUsingInMemory,
    inMemoryDb
  };
}
