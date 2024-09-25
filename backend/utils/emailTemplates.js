export const VERIFICATION_EMAIL_TEMPLATE = (verificationCode) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      padding: 20px;
    }
    .code {
      background-color: #e0f7fa;
      padding: 10px;
      font-size: 20px;
      text-align: center;
      border-radius: 5px;
    }
    .footer {
      font-size: 12px;
      color: #888;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up! Please verify your email address using the code below:</p>
      <div class="code">${verificationCode}</div>
      <p>This code is valid for 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DevAgency</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DevAgency, ${name}!</h1>
    </div>
    <div class="content">
      <p>We're excited to have you on board. Thank you for joining DevAgency!</p>
      <p>Feel free to explore and get started.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="{resetURL}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Successful</h1>
    </div>
    <div class="content">
      <p>Your password has been successfully reset. You can now log in using your new password.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const EMAIL_CHANGE_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your New Email Address</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirm Your New Email Address</h1>
    </div>
    <div class="content">
      <p>Please confirm your new email address by clicking the button below:</p>
      <a href="{confirmationLink}" class="button">Confirm Email Address</a>
      <p>If you did not request this change, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const EMAIL_CHANGE_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Change Notification</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Change Notification</h1>
    </div>
    <div class="content">
      <p>We received a request to change your email to <strong>{newEmail}</strong>.</p>
      <p>If you did not make this request, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const EMAIL_CHANGE_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Change Successful</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
    .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Change Successful</h1>
    </div>
    <div class="content">
      <p>Your email address has been successfully changed to this address.</p>
      <p>If you did not request this change, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 DevAgency. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

