import { z } from "zod";
import { ApiError } from "../utils/errors.js";
const email = z.string().trim().toLowerCase().email().max(254);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes",
  );
const currentPassword = z.string().min(1).max(256);
const name = z.string().trim().min(1).max(100);
const token = z.string().regex(/^[a-f0-9]{64}$/, "Invalid token");
export const schemas = {
  signup: z.strictObject({ name, email, password }),
  login: z.strictObject({ email, password: currentPassword }),
  verify: z.strictObject({
    email,
    code: z.string().regex(/^\d{6}$/, "Enter a six-digit code"),
  }),
  email: z.strictObject({ email }),
  reset: z.strictObject({ password }),
  resetParams: z.strictObject({ token }),
  changePassword: z.strictObject({
    oldPassword: currentPassword,
    newPassword: password,
  }),
  profile: z.strictObject({ name }),
  changeEmail: z.strictObject({ newEmail: email, password: currentPassword }),
  confirmEmail: z.strictObject({ token }),
  delete: z.strictObject({ password: currentPassword }),
};
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success)
      return next(
        new ApiError(result.error.issues[0]?.message || "Invalid input", 400),
      );
    if (source === "query") req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
