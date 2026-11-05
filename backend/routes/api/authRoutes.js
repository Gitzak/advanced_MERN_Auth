import { Router } from "express";
import * as auth from "../../controllers/authController.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { grantAccess } from "../../middleware/permission.js";
import { validate, schemas as s } from "../../middleware/validate.js";
import {
  authLimit,
  emailLimit,
  loginLimit,
} from "../../middleware/rateLimits.js";
const router = Router();
router.use(authLimit);
router.post("/signup", validate(s.signup), emailLimit, auth.signup);
router.post("/login", validate(s.login), loginLimit, auth.login);
router.post("/logout", auth.logout);
router.post("/refresh-token", auth.refreshAuthToken);
router.post("/verify-email", validate(s.verify), auth.verifyEmail);
router.post(
  "/resend-verification-email",
  validate(s.email),
  emailLimit,
  auth.resendVerificationEmail,
);
router.post(
  "/forgot-password",
  validate(s.email),
  emailLimit,
  auth.forgotPassword,
);
router.post(
  "/reset-password/:token",
  validate(s.resetParams, "params"),
  validate(s.reset),
  auth.resetPassword,
);
router.post(
  "/confirm-email-change",
  validate(s.confirmEmail),
  auth.confirmEmailChange,
);
// Deliberately public availability endpoint, rate-limited to reduce enumeration.
router.get(
  "/check-email",
  validate(s.email, "query"),
  auth.checkEmailAvailability,
);
router.use(verifyToken);
router.get("/check-auth", auth.checkAuth);
router.get("/me", grantAccess("readOwn", "profile"), auth.getUserProfile);
router.put(
  "/update-profile",
  validate(s.profile),
  grantAccess("updateOwn", "profile"),
  auth.updateProfile,
);
router.post(
  "/change-password",
  validate(s.changePassword),
  auth.changePassword,
);
router.post(
  "/request-email-change",
  validate(s.changeEmail),
  emailLimit,
  auth.requestEmailChange,
);
router.post("/delete-account", validate(s.delete), auth.deleteAccount);
export default router;
