import { sendEmail, escapeHtml } from "./emailService.js";
import {
  EMAIL_CHANGE_CONFIRMATION_TEMPLATE,
  EMAIL_CHANGE_NOTIFICATION_TEMPLATE,
  EMAIL_CHANGE_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE(verificationToken);

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlContent,
    category: "Email Verification",
  });
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = WELCOME_EMAIL_TEMPLATE(escapeHtml(name));

  await sendEmail({
    to: email,
    subject: "Welcome to DevAgency",
    html: htmlContent,
    category: "Welcome Email",
  });
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    "{resetURL}",
    resetURL,
  );

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: htmlContent,
    category: "Password Reset",
  });
};

export const sendResetSuccessEmail = async (email) => {
  const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE;

  await sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: htmlContent,
    category: "Password Reset",
  });
};

export const sendEmailChangeConfirmationEmail = async (email, token) => {
  const confirmationLink = `${process.env.CLIENT_URL}/confirm-email-change/${token}`;

  const htmlContent = EMAIL_CHANGE_CONFIRMATION_TEMPLATE.replace(
    "{confirmationLink}",
    confirmationLink,
  );

  await sendEmail({
    to: email,
    subject: "Confirm your new email address",
    html: htmlContent,
    category: "Email Change Confirmation",
  });
};

export const sendEmailChangeNotificationEmail = async (oldEmail, newEmail) => {
  const htmlContent = EMAIL_CHANGE_NOTIFICATION_TEMPLATE.replace(
    "{newEmail}",
    newEmail,
  );

  await sendEmail({
    to: oldEmail,
    subject: "Email Change Request",
    html: htmlContent,
    category: "Email Change Notification",
  });
};

export const sendEmailChangeSuccessEmail = async (email) => {
  const htmlContent = EMAIL_CHANGE_SUCCESS_TEMPLATE;

  await sendEmail({
    to: email,
    subject: "Your email has been changed successfully",
    html: htmlContent,
    category: "Email Change Success",
  });
};
