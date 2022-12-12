import mongoose from "mongoose";

import { env } from "@config/env";

const DATABASE_URL = env.mongoServer as string;

export const connectToDatabase = async (): Promise<void> => {
  // Connect to mongo
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("🚀 MongoDB Connected");
  } catch (error: any) {
    console.log("🛑 Error connecting to MongoDB: ", error.message);
  }
};
