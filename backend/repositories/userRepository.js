import { User } from "../models/User.js";

// Find user by email
export const findUserByEmail = async (email) => {
  return await User.findOne({ email, isDeleted: { $ne: true } }).select(
    "+password"
  );
};

// Create a new user
export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

// Find user by verification token
export const findUserByVerificationToken = async (token) => {
  return await User.findOne({
    verificationToken: token,
    verificationTokenExpiresAt: { $gt: Date.now() },
    isDeleted: { $ne: true },
  });
};

// Update a user
export const updateUser = async (user) => {
  return await user.save();
};

// Find user by ID
export const findUserById = async (id) => {
  return await User.findOne({ _id: id, isDeleted: { $ne: true } });
};

export const findUserByIdWithIsDeleted = async (userId) => {
  return await User.findById(userId).select("+isDeleted");
};

export const findUserByIdWithPassword = async (userId) => {
  return await User.findById(userId).select("+password");
};

// Delete user by ID
export const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

// Check if email exists
export const checkEmailExists = async (email) => {
  return await User.exists({ email, isDeleted: { $ne: true } });
};

// Find user by email change token
export const findUserByEmailChangeToken = async (token) => {
  return await User.findOne({
    emailChangeToken: token,
    emailChangeTokenExpiresAt: { $gt: Date.now() },
  });
};

export const findUserByResetToken = async (token) => {
  return await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
    isDeleted: { $ne: true },
  });
};

export const updateUserById = async (userId, updates) => {
  return await User.updateOne({ _id: userId }, updates);
};