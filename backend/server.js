import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/connectDB.js";
import { startEmailWorker } from "./utils/emailService.js";
try {
  await connectDB();
  const stopWorker = startEmailWorker();
  const server = app.listen(env.PORT, () =>
    console.log("API ready at http://localhost:" + env.PORT),
  );
  async function shutdown() {
    stopWorker();
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch (error) {
  console.error(
    "Startup failed:",
    error.name,
    "Check database access and backend/.env",
  );
  process.exitCode = 1;
}
