import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { createHash } from "node:crypto";
const message = {
  success: false,
  message: "Too many attempts. Please try again later",
};
const base = { standardHeaders: "draft-8", legacyHeaders: false, message };
export const authLimit = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
export const emailLimit = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 3,
  keyGenerator: (req) =>
    createHash("sha256")
      .update(req.body.email || req.userId || ipKeyGenerator(req.ip))
      .digest("hex"),
});
export const loginLimit = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    createHash("sha256").update(req.body.email).digest("hex"),
});
