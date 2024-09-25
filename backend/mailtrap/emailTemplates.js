// emailTemplates.js

export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
  <!-- Styles can be added here -->
</head>
<body>
  <h1>Verify Your Email</h1>
  <p>Your verification code is:</p>
  <h2>{verificationCode}</h2>
  <p>Please enter this code to verify your email address.</p>
  <p>Thank you!</p>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Auth Company</title>
</head>
<body>
  <h1>Welcome, {name}!</h1>
  <p>Thank you for joining Auth Company. We're excited to have you on board.</p>
  <p>Best regards,<br>The Auth Company Team</p>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body>
  <h1>Password Reset Request</h1>
  <p>We received a request to reset your password.</p>
  <p>Click the link below to reset your password:</p>
  <a href="{resetURL}">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
  <p>If you did not request a password reset, please ignore this email.</p>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset Successful</title>
</head>
<body>
  <h1>Password Reset Successful</h1>
  <p>Your password has been successfully reset.</p>
  <p>If you did not perform this action, please contact support immediately.</p>
</body>
</html>
`;

export const EMAIL_CHANGE_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirm Your New Email Address</title>
</head>
<body>
  <h1>Confirm Your New Email Address</h1>
  <p>Click the link below to confirm your new email address:</p>
  <a href="{confirmationLink}">Confirm Email Address</a>
  <p>If you did not request this change, please contact support immediately.</p>
</body>
</html>
`;

export const EMAIL_CHANGE_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Change Notification</title>
</head>
<body>
  <h1>Email Change Request</h1>
  <p>We received a request to change your email to {newEmail}.</p>
  <p>If you did not make this request, please contact support immediately.</p>
</body>
</html>
`;

export const ACCOUNT_DELETION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Account Deletion Confirmation</title>
</head>
<body>
  <h1>Account Deletion</h1>
  <p>Your account has been successfully deleted.</p>
  <p>If you did not request this action, please contact support immediately.</p>
</body>
</html>
`;
