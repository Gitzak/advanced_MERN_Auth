import { EmailJob } from "../models/EmailJob.js";
import { transporter, sender } from "../config/nodemailer.js";
// Persist delivery separately: an SMTP failure must not undo or misreport a completed account change.
export const sendEmail = async (message) => {
  await EmailJob.create(message);
};
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let running = false;
export async function processEmailQueue() {
  if (running) return;
  running = true;
  try {
    for (let count = 0; count < 10; count++) {
      const now = new Date();
      const job = await EmailJob.findOneAndUpdate(
        {
          status: "pending",
          nextAttemptAt: { $lte: now },
          expiresAt: { $gt: now },
          $or: [
            { lockedUntil: { $exists: false } },
            { lockedUntil: { $lte: now } },
          ],
        },
        {
          $set: { lockedUntil: new Date(Date.now() + 60000) },
          $inc: { attempts: 1 },
        },
        { returnDocument: "after", sort: { createdAt: 1 } },
      );
      if (!job) break;
      try {
        await transporter.sendMail({
          from: sender,
          to: job.to,
          subject: job.subject,
          html: job.html,
          headers: { "X-Category": job.category || "Account" },
        });
        await EmailJob.updateOne(
          { _id: job._id },
          {
            $set: { status: "sent" },
            $unset: { html: 1, to: 1, lockedUntil: 1 },
          },
        );
      } catch {
        console.warn("Email delivery will be retried; job:", String(job._id));
        await EmailJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: job.attempts >= 5 ? "failed" : "pending",
              nextAttemptAt: new Date(
                Date.now() + Math.min(300000, 1000 * 2 ** job.attempts),
              ),
            },
            $unset: { lockedUntil: 1 },
          },
        );
      }
    }
  } finally {
    running = false;
  }
}
export function startEmailWorker() {
  const timer = setInterval(
    () =>
      processEmailQueue().catch(() => console.error("Email queue unavailable")),
    5000,
  );
  timer.unref();
  void processEmailQueue().catch(() =>
    console.error("Email queue unavailable"),
  );
  return () => clearInterval(timer);
}
