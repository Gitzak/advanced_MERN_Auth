import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    category: String,
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lockedUntil: Date,
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    // Mail content is removed immediately after delivery; failed jobs expire after one day.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 86400000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);
export const EmailJob = mongoose.model("EmailJob", schema);
