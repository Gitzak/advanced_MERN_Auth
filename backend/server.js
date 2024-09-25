import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connectDB.js";

dotenv.config();

// Connect to the database
connectDB();

// Start the server
const PORT = process.env.PORT || 7500;

app.listen(PORT, () => {
  console.log('\x1b[33m🔥 Server is running on port:', PORT, '\x1b[0m');
});
