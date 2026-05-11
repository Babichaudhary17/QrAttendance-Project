import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in the environment variables.");
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1000,
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn(
      `MongoDB connection failed (${error.message}). Starting in-memory MongoDB for local development.`
    );
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    const connection = await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB connected: ${connection.connection.host}`);
  }
};

export default connectDB;
