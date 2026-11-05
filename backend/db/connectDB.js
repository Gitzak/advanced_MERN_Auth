import mongoose from "mongoose";
import { env } from "../config/env.js";
export async function connectDB() {
  if (mongoose.connection.readyState !== 1)
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}
