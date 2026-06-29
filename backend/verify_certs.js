import mongoose from "mongoose";
import dotenv from "dotenv";
import { ScheduleBlock } from "./models/ScheduleBlock.js";
import { User } from "./models/User.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/neuron_lms";

async function verify() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email: "aisha@neuron.lms" });
    if (!user) {
      console.error("User not found!");
      process.exit(1);
    }
    console.log(`Found user: ${user.name} (${user._id})`);

    const blocks = await ScheduleBlock.find({ userId: user._id });
    console.log(`Found ${blocks.length} schedule blocks for this user:`);
    blocks.forEach(b => {
      console.log(`- Title: ${b.t}, Day: ${b.day}, start: ${b.start}, userId: ${b.userId}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
