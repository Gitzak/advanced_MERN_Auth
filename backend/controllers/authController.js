import {
  signupService,
  verifyEmailService,
  loginService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  checkAuthService,
  resendVerificationEmailService,
  changePasswordService,
  updateProfileService,
  deleteAccountService,
  refreshAuthTokenService,
  getUserProfileService,
  checkEmailAvailabilityService,
  confirmEmailChangeService,
  requestEmailChangeService,
} from "../services/authService.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const login = async (req, res, next) => {
  try {
    const response = await loginService(req.body.email, req.body.password, res);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: response.user,
      refreshTokenExpiryDate: response.refreshTokenExpiryDate
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    const user = await signupService(req.body, res);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await verifyEmailService(req.body.code);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    logoutService(res);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordService(req.body.email);
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService(req.params.token, req.body.password);
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    const user = await checkAuthService(req.userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Resend Verification Email
export const resendVerificationEmail = async (req, res, next) => {
  try {
    await resendVerificationEmailService(req.userId);
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changePasswordService(req.userId, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await updateProfileService(req.userId, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Account
export const deleteAccount = async (req, res, next) => {
  try {
    await deleteAccountService(req.userId);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Auth Token
export const refreshAuthToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const userId = await refreshAuthTokenService(refreshToken);

    // Generate a new access token and set it in the cookie
    generateTokenAndSetCookie(res, userId);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await getUserProfileService(req.userId);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Check Email Availability
export const checkEmailAvailability = async (req, res, next) => {
  try {
    const { email } = req.query;
    const isAvailable = await checkEmailAvailabilityService(email);
    res.status(200).json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm Email Change
export const confirmEmailChange = async (req, res, next) => {
  try {
    const { token } = req.body;
    await confirmEmailChangeService(token);
    res.status(200).json({
      success: true,
      message: "Email change confirmed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Request Email Change
export const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    await requestEmailChangeService(req.userId, newEmail);
    res.status(200).json({
      success: true,
      message:
        "Email change request sent. Please check your new email to confirm.",
    });
  } catch (error) {
    next(error);
  }
};
