import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  findUserByVerificationToken,
  updateUser,
  findUserById,
  checkEmailExists,
  findUserByEmailChangeToken,
  findUserByResetToken,
  findUserByIdWithPassword,
  findUserByIdWithIsDeleted,
  updateUserById,
} from "../repositories/userRepository.js";
import { generateRandomToken } from "../utils/generateRandomToken.js";
import { ApiError } from "../utils/errors.js";
import {
  generateRefreshTokenAndSetCookie,
  generateTokenAndSetCookie,
} from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/verificationCode.js";
import {
  sendEmailChangeConfirmationEmail,
  sendEmailChangeNotificationEmail,
  sendEmailChangeSuccessEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/emails.js";
import { generateUniqueDeletedEmail } from "../utils/generateUniqueDeletedEmail.js";

// Registre new users
export const signupService = async (userData, res) => {
  const { email, password, name } = userData;

  if (!email || !password || !name) {
    throw new ApiError("All fields are required", 400);
  }

  const userAlreadyExists = await findUserByEmail(email);

  if (userAlreadyExists) {
    throw new ApiError("User already exists", 400);
  }

  const verificationToken = generateVerificationCode();

  const newUser = {
    email,
    name,
    password,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const user = await createUser(newUser);

  generateTokenAndSetCookie(res, user._id);

  await sendVerificationEmail(user.email, verificationToken);

  return {
    ...user._doc,
    password: undefined,
  };
};

export const verifyEmailService = async (code) => {
  const user = await findUserByVerificationToken(code);

  if (!user) {
    throw new ApiError("Invalid or expired verification code", 400);
  }

  // Check if the user is soft-deleted
  if (user.isDeleted) {
    throw new ApiError("Account has been deleted", 403);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await updateUser(user);

  await sendWelcomeEmail(user.email, user.name);

  return {
    ...user._doc,
    password: undefined,
  };
};

// Login user with email and password
export const loginService = async (email, password, res) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError("Invalid credentials", 400);
  }

  // Check if the user is soft-deleted
  if (user.isDeleted) {
    throw new ApiError("Account has been deleted", 403);
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", 400);
  }

  if (!user.isVerified) {
    throw new ApiError(
      "You need to verify your account before logging in",
      403
    );
  }

  generateTokenAndSetCookie(res, user._id);

  generateRefreshTokenAndSetCookie(res, user._id);

  user.lastLogin = new Date();
  await updateUser(user);

  return {
    ...user._doc,
    password: undefined,
  };
};

export const logoutService = (res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
};

export const forgotPasswordService = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError("User not found", 400);
  }

  // Check if the user is soft-deleted
  if (user.isDeleted) {
    throw new ApiError("Account has been deleted", 403);
  }

  const resetToken = generateRandomToken();
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;

  await updateUser(user);

  await sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  );
};

export const resetPasswordService = async (token, newPassword) => {
  const user = await findUserByResetToken(token);

  if (!user) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;

  await updateUser(user);

  await sendResetSuccessEmail(user.email);
};

export const checkAuthService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError("User not found", 400);
  }
  return user;
};

export const resendVerificationEmailService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isVerified) {
    throw new ApiError("User is already verified", 400);
  }

  // Generate new verification token
  const verificationToken = generateVerificationCode();

  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await updateUser(user);

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);
};

// Change Password Service
export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await findUserByIdWithPassword(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordCorrect = await bcryptjs.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError("Incorrect current password", 400);
  }

  user.password = newPassword;
  await updateUser(user);
};

// Update Profile Service
export const updateProfileService = async (userId, updateData) => {
  const allowedFields = ["name"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (updateData[field]) {
      updates[field] = updateData[field];
    }
  });

  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  Object.assign(user, updates);
  await updateUser(user);

  return user;
};

// Delete Account Service
export const deleteAccountService = async (userId) => {
  const user = await findUserByIdWithIsDeleted(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isDeleted) {
    throw new ApiError("Account already deleted", 400);
  }

  // Prepare the updates (including setting password to undefined)
  const updates = {
    isDeleted: true,
    deletedAt: Date.now(),
    email: await generateUniqueDeletedEmail(user.email),
    password: undefined,
    resetPasswordToken: undefined,
    resetPasswordExpiresAt: undefined,
    verificationToken: undefined,
    verificationTokenExpiresAt: undefined,
    emailChangeToken: undefined,
    emailChangeTokenExpiresAt: undefined,
    pendingEmailChange: undefined,
    isVerified: false,
  };

  // Perform the update without validation
  await updateUserById(userId, updates);
};

// Refresh Auth Token Service
export const refreshAuthTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError("Refresh token not provided", 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const userId = decoded.userId;

    const user = await findUserById(userId);
    if (!user || user.isDeleted) {
      throw new ApiError("User not found or inactive", 401);
    }

    return userId;
  } catch (error) {
    console.error("Error validating refresh token:", error);
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Refresh token expired", 401);
    } else {
      throw new ApiError("Invalid refresh token", 401);
    }
  }
};

// Get User Profile Service
export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user;
};

// Check Email Availability Service
export const checkEmailAvailabilityService = async (email) => {
  const exists = await checkEmailExists(email);
  return !exists;
};

// Confirm Email Change Service
export const confirmEmailChangeService = async (token) => {
  const user = await findUserByEmailChangeToken(token);

  if (!user) {
    throw new ApiError("Invalid or expired email change token", 400);
  }

  user.email = user.pendingEmailChange;
  user.pendingEmailChange = undefined;
  user.emailChangeToken = undefined;
  user.emailChangeTokenExpiresAt = undefined;

  await updateUser(user);

  // Send success email notification
  await sendEmailChangeSuccessEmail(user.email);
};

// Request Email Change Service
export const requestEmailChangeService = async (userId, newEmail) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.email === newEmail) {
    throw new ApiError(
      "New email cannot be the same as the current email",
      400
    );
  }

  const emailExists = await checkEmailExists(newEmail);

  if (emailExists) {
    throw new ApiError("Email is already in use", 400);
  }

  // Generate email change token
  const emailChangeToken = generateRandomToken();
  user.emailChangeToken = emailChangeToken;
  user.emailChangeTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  user.pendingEmailChange = newEmail;
  await updateUser(user);

  // Send confirmation email to new email
  await sendEmailChangeConfirmationEmail(newEmail, emailChangeToken);

  // Optionally, notify old email
  await sendEmailChangeNotificationEmail(user.email, newEmail);
};

// todo : To test
export const restoreAccountService = async (userId) => {
  const user = await User.findById(userId).select("+isDeleted");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.isDeleted) {
    throw new ApiError("Account is not deleted", 400);
  }

  // Restore the user account
  user.isDeleted = false;
  user.deletedAt = undefined;

  // Restore the original email
  user.email = user.email.replace(/_deleted_\d+$/, "");

  await updateUser(user);
};
