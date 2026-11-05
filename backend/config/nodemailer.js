import nodemailer from "nodemailer";
import { env } from "./env.js";
export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  disableFileAccess: true,
  disableUrlAccess: true,
});
export const sender = env.EMAIL_FROM;
