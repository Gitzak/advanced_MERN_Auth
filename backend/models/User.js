import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { publicUser } from "../utils/publicUser.js";
const hidden = { type: String, select: false };
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: validator.isEmail,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["Admin", "Employer", "Client"],
      default: "Client",
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
    lastLogin: Date,
    sessionVersion: { type: Number, default: 0, select: false },
    verificationToken: hidden,
    verificationTokenExpiresAt: { type: Date, select: false },
    verificationAttempts: { type: Number, default: 0, select: false },
    resetPasswordToken: hidden,
    resetPasswordExpiresAt: { type: Date, select: false },
    emailChangeToken: hidden,
    emailChangeTokenExpiresAt: { type: Date, select: false },
    pendingEmailChange: {
      type: String,
      lowercase: true,
      trim: true,
      validate: validator.isEmail,
    },
  },
  { timestamps: true },
);
schema.pre("save", async function () {
  if (this.isModified("password") && this.password)
    this.password = await bcrypt.hash(this.password, 12);
});
// Allowlist also protects documents immediately after creation and modification.
schema.methods.toJSON = function () {
  return publicUser(this);
};
export const User = mongoose.model("User", schema);
