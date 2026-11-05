import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import {
  activeUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  checkEmailExists,
} from "../repositories/userRepository.js";
import { generateRandomToken } from "../utils/generateRandomToken.js";
import {
  generateVerificationCode,
  hashToken,
} from "../utils/verificationCode.js";
import { ApiError } from "../utils/errors.js";
import { publicUser } from "../utils/publicUser.js";
import {
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyJwt,
} from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendEmailChangeConfirmationEmail,
  sendEmailChangeNotificationEmail,
  sendEmailChangeSuccessEmail,
} from "../utils/emails.js";

const dummyPasswordHash = await bcrypt.hash(randomUUID(), 12);
const invalid = () => new ApiError("Invalid or expired token", 400);
async function startSession(user, res) {
  const session = new Session({
    userId: user._id,
    version: user.sessionVersion || 0,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_SECONDS * 1000),
  });
  const token = signRefreshToken(user, session, randomUUID());
  session.refreshHash = hashToken(token);
  await session.save();
  setAuthCookies(res, user, session, token);
  return { user: publicUser(user), refreshTokenExpiryDate: session.expiresAt };
}
async function requirePassword(userId, password) {
  const user = await findUserByIdWithPassword(userId);
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new ApiError("Incorrect current password", 400);
  return user;
}
async function revokeUserSessions(userId) {
  await Session.deleteMany({ userId });
}

export async function signupService({ email, name, password }) {
  if (await checkEmailExists(email))
    throw new ApiError(
      "Email is already in use. Sign in or resend the verification code",
      409,
    );
  const code = generateVerificationCode();
  const user = await User.create({
    email,
    name,
    password,
    verificationToken: hashToken(code),
    verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  await sendVerificationEmail(email, code);
  return publicUser(user);
}
export async function verifyEmailService(email, code, res) {
  // Consume the matching code atomically and bind it to one email, with a five-attempt budget.
  const filter = {
    email,
    ...activeUser,
    isVerified: false,
    verificationAttempts: { $lt: 5 },
    verificationTokenExpiresAt: { $gt: new Date() },
  };
  const user = await User.findOneAndUpdate(
    { ...filter, verificationToken: hashToken(code) },
    {
      $set: { isVerified: true },
      $unset: {
        verificationToken: 1,
        verificationTokenExpiresAt: 1,
        verificationAttempts: 1,
      },
    },
    { returnDocument: "after" },
  ).select("+sessionVersion");
  if (!user) {
    await User.updateOne(filter, { $inc: { verificationAttempts: 1 } });
    throw new ApiError(
      "Invalid or expired code. Request a new code if needed",
      400,
    );
  }
  await sendWelcomeEmail(user.email, user.name);
  return startSession(user, res);
}
export async function loginService(email, password, res) {
  const user = await findUserByEmail(email);
  const matches = await bcrypt.compare(
    password,
    user?.password || dummyPasswordHash,
  );
  if (!user || !matches) throw new ApiError("Invalid email or password", 401);
  if (!user.isVerified) {
    const error = new ApiError("Verify your email before signing in", 403);
    error.code = "VERIFICATION_REQUIRED";
    throw error;
  }
  user.lastLogin = new Date();
  await user.save();
  return startSession(user, res);
}
export async function logoutService(req, res) {
  for (const [token, isRefresh] of [
    [req.cookies.refreshToken, true],
    [req.cookies.token, false],
  ]) {
    try {
      const claims = verifyJwt(token, isRefresh);
      if (mongoose.isObjectIdOrHexString(claims.sid))
        await Session.deleteOne({ _id: claims.sid, userId: claims.sub });
    } catch (error) {
      if (
        !["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
          error.name,
        )
      )
        throw error;
    }
  }
  clearAuthCookies(res);
}
export async function forgotPasswordService(email) {
  const user = await findUserByEmail(email);
  if (!user) return;
  const token = generateRandomToken();
  await User.updateOne(
    { _id: user._id, ...activeUser },
    {
      $set: {
        resetPasswordToken: hashToken(token),
        resetPasswordExpiresAt: new Date(Date.now() + 3600000),
      },
    },
  );
  await sendPasswordResetEmail(
    email,
    env.CLIENT_URL + "/reset-password/" + token,
  );
}
export async function resetPasswordService(token, password, res) {
  const hash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    {
      resetPasswordToken: hashToken(token),
      resetPasswordExpiresAt: { $gt: new Date() },
      ...activeUser,
    },
    {
      $set: { password: hash },
      $inc: { sessionVersion: 1 },
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpiresAt: 1,
        emailChangeToken: 1,
        emailChangeTokenExpiresAt: 1,
        pendingEmailChange: 1,
      },
    },
    { returnDocument: "after" },
  );
  if (!user) throw invalid();
  await revokeUserSessions(user._id);
  clearAuthCookies(res);
  await sendResetSuccessEmail(user.email);
}
export async function checkAuthService(userId) {
  return publicUser(await findUserById(userId));
}
export async function resendVerificationEmailService(email) {
  const code = generateVerificationCode();
  const user = await User.findOneAndUpdate(
    { email, ...activeUser, isVerified: false },
    {
      $set: {
        verificationToken: hashToken(code),
        verificationTokenExpiresAt: new Date(Date.now() + 600000),
        verificationAttempts: 0,
      },
    },
    { returnDocument: "after" },
  );
  if (user) await sendVerificationEmail(email, code);
}
export async function changePasswordService(
  userId,
  oldPassword,
  newPassword,
  res,
) {
  const user = await requirePassword(userId, oldPassword);
  const updated = await User.findOneAndUpdate(
    { _id: userId, password: user.password, ...activeUser },
    {
      $set: { password: await bcrypt.hash(newPassword, 12) },
      $inc: { sessionVersion: 1 },
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpiresAt: 1,
        emailChangeToken: 1,
        emailChangeTokenExpiresAt: 1,
        pendingEmailChange: 1,
      },
    },
    { returnDocument: "after" },
  );
  if (!updated)
    throw new ApiError("Account changed. Please sign in again", 409);
  await revokeUserSessions(userId);
  clearAuthCookies(res);
  await sendResetSuccessEmail(user.email);
}
export async function updateProfileService(userId, { name }) {
  const user = await User.findOneAndUpdate(
    { _id: userId, ...activeUser },
    { $set: { name } },
    { returnDocument: "after", runValidators: true },
  );
  if (!user) throw new ApiError("Account not found", 404);
  return publicUser(user);
}
export async function deleteAccountService(userId, password, res) {
  const user = await requirePassword(userId, password);
  // Explicit $unset removes stored secrets; undefined updates do not.
  const result = await User.updateOne(
    { _id: userId, password: user.password, ...activeUser },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        isVerified: false,
        email: "deleted-" + randomUUID() + "@deleted.invalid",
        name: "Deleted account",
      },
      $inc: { sessionVersion: 1 },
      $unset: {
        password: 1,
        verificationToken: 1,
        verificationTokenExpiresAt: 1,
        verificationAttempts: 1,
        resetPasswordToken: 1,
        resetPasswordExpiresAt: 1,
        emailChangeToken: 1,
        emailChangeTokenExpiresAt: 1,
        pendingEmailChange: 1,
      },
    },
  );
  if (result.modifiedCount !== 1)
    throw new ApiError("Account changed. Please sign in again", 409);
  await revokeUserSessions(userId);
  clearAuthCookies(res);
}
export async function refreshAuthTokenService(refreshToken, res) {
  let claims;
  try {
    claims = verifyJwt(refreshToken, true);
  } catch {
    throw new ApiError("Session expired. Please sign in again", 401);
  }
  if (
    !mongoose.isObjectIdOrHexString(claims.sub) ||
    !mongoose.isObjectIdOrHexString(claims.sid)
  )
    throw new ApiError("Invalid session", 401);
  const user = await findUserById(claims.sub);
  const session = await Session.findOne({
    _id: claims.sid,
    userId: claims.sub,
    expiresAt: { $gt: new Date() },
  }).select("+refreshHash");
  if (
    !user?.isVerified ||
    !session ||
    claims.version !== user.sessionVersion ||
    session.version !== user.sessionVersion
  )
    throw new ApiError("Invalid session", 401);
  const nextToken = signRefreshToken(user, session, randomUUID());
  const rotated = await Session.findOneAndUpdate(
    { _id: session._id, refreshHash: hashToken(refreshToken) },
    { $set: { refreshHash: hashToken(nextToken) } },
    { returnDocument: "after" },
  );
  if (!rotated) {
    // Reuse of an already rotated refresh token invalidates the session.
    await Session.deleteOne({ _id: session._id });
    clearAuthCookies(res);
    throw new ApiError("Session revoked. Please sign in again", 401);
  }
  setAuthCookies(res, user, rotated, nextToken);
  return { user: publicUser(user), refreshTokenExpiryDate: rotated.expiresAt };
}
export const getUserProfileService = checkAuthService;
export async function checkEmailAvailabilityService(email) {
  return !(await checkEmailExists(email));
}
export async function requestEmailChangeService(userId, newEmail, password) {
  const user = await requirePassword(userId, password);
  if (user.email === newEmail)
    throw new ApiError("Choose a different email address", 400);
  if (await checkEmailExists(newEmail))
    throw new ApiError("Email is already in use", 409);
  const token = generateRandomToken();
  await User.updateOne(
    { _id: userId, ...activeUser },
    {
      $set: {
        pendingEmailChange: newEmail,
        emailChangeToken: hashToken(token),
        emailChangeTokenExpiresAt: new Date(Date.now() + 3600000),
      },
    },
  );
  await sendEmailChangeConfirmationEmail(newEmail, token);
  await sendEmailChangeNotificationEmail(user.email, newEmail);
  return publicUser(await findUserById(userId));
}
export async function confirmEmailChangeService(token, res) {
  const filter = {
    emailChangeToken: hashToken(token),
    emailChangeTokenExpiresAt: { $gt: new Date() },
    ...activeUser,
  };
  const pending = await User.findOne(filter);
  if (!pending?.pendingEmailChange) throw invalid();
  if (await checkEmailExists(pending.pendingEmailChange))
    throw new ApiError("Email is already in use. Request another change", 409);
  const user = await User.findOneAndUpdate(
    { ...filter, pendingEmailChange: pending.pendingEmailChange },
    {
      $set: { email: pending.pendingEmailChange },
      $inc: { sessionVersion: 1 },
      $unset: {
        pendingEmailChange: 1,
        emailChangeToken: 1,
        emailChangeTokenExpiresAt: 1,
        resetPasswordToken: 1,
        resetPasswordExpiresAt: 1,
      },
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!user) throw invalid();
  await revokeUserSessions(user._id);
  clearAuthCookies(res);
  await sendEmailChangeSuccessEmail(user.email);
}
