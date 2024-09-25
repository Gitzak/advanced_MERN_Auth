import { User } from "../models/User.js";

export const generateUniqueDeletedEmail = async (originalEmail) => {
  // Generate a unique email by appending a timestamp or UUID
  const timestamp = Date.now();
  const deletedEmail = `${originalEmail}_deleted_${timestamp}`;

  // Ensure the new email is unique (in case of edge cases)
  const existingUser = await User.findOne({ email: deletedEmail });

  if (existingUser) {
    // If the generated email already exists (unlikely), append a random number
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${deletedEmail}_${randomNumber}`;
  }

  return deletedEmail;
};
