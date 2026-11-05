import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";
dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});
const result = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(7500),
    CLIENT_URL: z.url().default("http://localhost:3000"),
    MONGO_URI: z.string().regex(/^mongodb(\+srv)?:\/\//),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    ACCESS_TOKEN_SECONDS: z.coerce.number().int().min(1).max(3600).default(900),
    REFRESH_TOKEN_SECONDS: z.coerce.number().int().min(60).default(604800),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().default(2525),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    EMAIL_FROM: z.string().default("MERN Auth <from@example.com>"),
  })
  .safeParse(process.env);
if (!result.success)
  throw new Error(
    "Invalid environment variables: " +
      result.error.issues.map((i) => i.path.join(".")).join(", "),
  );
export const env = result.data;
if (env.JWT_SECRET === env.JWT_REFRESH_SECRET)
  throw new Error("JWT secrets must be different");
