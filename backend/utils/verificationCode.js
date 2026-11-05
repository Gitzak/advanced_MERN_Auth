import { randomInt, createHmac } from "node:crypto";
import { env } from "../config/env.js";
export const generateVerificationCode = () =>
  String(randomInt(100000, 1000000));
// Keyed hashes protect short codes from offline enumeration after a database leak.
export const hashToken = (value) =>
  createHmac("sha256", env.JWT_SECRET).update(value).digest("hex");
