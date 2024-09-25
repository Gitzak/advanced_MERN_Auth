import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("\x1b[92m🍃 MongoDB is already connected\x1b[0m");
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(
      "\x1b[92m🍃 MongoDB Connected: %s\x1b[0m",
      conn.connection.host
    );

    mongoose.connection.on("error", (err) => {
      console.error("\x1b[31m❌ MongoDB connection error: %s\x1b[0m", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("\x1b[93m⚠️ MongoDB disconnected\x1b[0m");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log(
        "\x1b[91m🔌 MongoDB connection closed due to app termination\x1b[0m"
      );
      process.exit(0);
    });
  } catch (error) {
    console.error(
      "\x1b[31m❌ Error connecting to MongoDB: %s\x1b[0m",
      error.message
    );
    process.exit(1);
  }
};
