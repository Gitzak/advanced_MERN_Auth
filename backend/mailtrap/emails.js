import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  EMAIL_CHANGE_CONFIRMATION_TEMPLATE,
  EMAIL_CHANGE_NOTIFICATION_TEMPLATE,
  ACCOUNT_DELETION_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";
import { ApiError } from "../utils/errors.js";

// Generic email sending function
const sendEmail = async ({ to, subject, html, category }) => {
  const recipient = [{ email: to }];

  try {
    const response = await mailtrapClient.testing.send({
      from: sender,
      to: recipient,
      subject,
      html,
      category,
    });

    console.log(`Email sent successfully to ${to}:`, response);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new ApiError(`Error sending email: ${error.message}`, 500);
  }
};

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken
  );

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlContent,
    category: "Email Verification",
  });
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);

  await sendEmail({
    to: email,
    subject: "Welcome to Auth Company",
    html: htmlContent,
    category: "Welcome Email",
  });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetURL) => {
  const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    "{resetURL}",
    resetURL
  );

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: htmlContent,
    category: "Password Reset",
  });
};

// Send Password Reset Success Email
export const sendResetSuccessEmail = async (email) => {
  const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE;

  await sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: htmlContent,
    category: "Password Reset",
  });
};

// Send Email Change Confirmation Email (to new email)
export const sendEmailChangeConfirmationEmail = async (email, token) => {
  const htmlContent = EMAIL_CHANGE_CONFIRMATION_TEMPLATE.replace(
    "{confirmationLink}",
    `${process.env.CLIENT_URL}/confirm-email-change/${token}`
  );

  await sendEmail({
    to: email,
    subject: "Confirm your new email address",
    html: htmlContent,
    category: "Email Change Confirmation",
  });
};

// Send Email Change Notification Email (to old email)
export const sendEmailChangeNotificationEmail = async (oldEmail, newEmail) => {
  const htmlContent = EMAIL_CHANGE_NOTIFICATION_TEMPLATE.replace(
    "{newEmail}",
    newEmail
  );

  await sendEmail({
    to: oldEmail,
    subject: "Email Change Request",
    html: htmlContent,
    category: "Email Change Notification",
  });
};

// Send Account Deletion Confirmation Email
export const sendAccountDeletionEmail = async (email) => {
  const htmlContent = ACCOUNT_DELETION_TEMPLATE;

  await sendEmail({
    to: email,
    subject: "Account Deletion Confirmation",
    html: htmlContent,
    category: "Account Deletion",
  });
};
