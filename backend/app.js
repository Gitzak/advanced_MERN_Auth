import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Create Express app
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your front-end port
    credentials: true, // Allow credentials (cookies, headers, etc.)
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api", routes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
