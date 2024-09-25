import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  changePassword,
  updateProfile,
  deleteAccount,
  getUserProfile,
  checkEmailAvailability,
  confirmEmailChange,
  requestEmailChange,
  refreshAuthToken,
} from "../../controllers/authController.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const router = express.Router();

// Refresh authentication token
router.post("/refresh-token", refreshAuthToken);

// Public Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", verifyToken, resendVerificationEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/check-email", checkEmailAvailability);
router.post("/confirm-email-change", confirmEmailChange);

// Protected Routes (Require Authentication)
router.get("/check-auth", verifyToken, checkAuth);
router.get("/me", verifyToken, getUserProfile);

router.post("/change-password", verifyToken, changePassword);
router.put("/update-profile", verifyToken, updateProfile);

router.post("/request-email-change", verifyToken, requestEmailChange);

router.delete("/delete-account", verifyToken, deleteAccount);

export default router;
