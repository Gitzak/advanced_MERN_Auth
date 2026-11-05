import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.disable("x-powered-by");
app.use(helmet({ strictTransportSecurity: false }));
app.use(cors({ origin: new URL(env.CLIENT_URL).origin, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (
      req.get("origin") &&
      req.get("origin") !== new URL(env.CLIENT_URL).origin
    )
      return res
        .status(403)
        .json({ success: false, message: "Request origin is not allowed" });
    if (Number(req.get("content-length")) > 0 && !req.is("application/json"))
      return res
        .status(415)
        .json({ success: false, message: "Use application/json" });
  }
  next();
});
app.get("/api/health", (_req, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({ success: mongoose.connection.readyState === 1 }),
);
app.use(
  "/api",
  (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  routes,
);
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use(errorHandler);
export default app;
