import mongoose from "mongoose";
import { isProduction } from "./env.js";

let memoryReplSet;

const shouldUseMemoryFallback = () =>
  !isProduction && process.env.DISABLE_MEMORY_DB_FALLBACK !== "true";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (!shouldUseMemoryFallback()) {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    }

    console.warn(`Database connection failed: ${error.message}`);
    console.warn("Starting temporary in-memory MongoDB for development.");

    try {
      const { MongoMemoryReplSet } = await import("mongodb-memory-server");

      memoryReplSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: "wiredTiger" },
      });

      const conn = await mongoose.connect(memoryReplSet.getUri(), {
        serverSelectionTimeoutMS: 8000,
      });

      console.log(`MongoDB Memory Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error("In-memory database startup failed:", fallbackError.message);
      process.exit(1);
    }
  }
};

export default connectDB;
