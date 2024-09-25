import { transporter, sender } from '../config/nodemailer.js';
import { ApiError } from "./errors.js";

export const sendEmail = async ({ to, subject, html, category }) => {
  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to,
      subject,
      html,
      headers: {
        "X-Category": category,
      },
      sandbox: true, // Use sandbox mode for test emails
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new ApiError(`Error sending email: ${error.message}`, 500);
  }
};
