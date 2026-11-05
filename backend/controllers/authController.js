import * as service from "../services/authService.js";
const handler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};
const ok = (res, message, extra = {}) =>
  res.json({ success: true, message, ...extra });
export const signup = handler(async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      message: "Account created. Check your email or request a new code",
      user: await service.signupService(req.body),
    }),
);
export const verifyEmail = handler(async (req, res) =>
  ok(
    res,
    "Email verified",
    await service.verifyEmailService(req.body.email, req.body.code, res),
  ),
);
export const login = handler(async (req, res) =>
  ok(
    res,
    "Signed in",
    await service.loginService(req.body.email, req.body.password, res),
  ),
);
export const logout = handler(async (req, res) => {
  await service.logoutService(req, res);
  ok(res, "Signed out");
});
export const forgotPassword = handler(async (req, res) => {
  await service.forgotPasswordService(req.body.email);
  ok(res, "If an account exists, a reset email will be sent shortly");
});
export const resetPassword = handler(async (req, res) => {
  await service.resetPasswordService(req.params.token, req.body.password, res);
  ok(res, "Password reset. Please sign in again");
});
export const checkAuth = handler(async (req, res) =>
  ok(res, "Authenticated", {
    user: await service.checkAuthService(req.userId),
  }),
);
export const resendVerificationEmail = handler(async (req, res) => {
  await service.resendVerificationEmailService(req.body.email);
  ok(res, "If verification is needed, a new code will be sent shortly");
});
export const changePassword = handler(async (req, res) => {
  await service.changePasswordService(
    req.userId,
    req.body.oldPassword,
    req.body.newPassword,
    res,
  );
  ok(res, "Password changed. Please sign in again");
});
export const updateProfile = handler(async (req, res) =>
  ok(res, "Profile updated", {
    user: await service.updateProfileService(req.userId, req.body),
  }),
);
export const deleteAccount = handler(async (req, res) => {
  await service.deleteAccountService(req.userId, req.body.password, res);
  ok(res, "Account deleted");
});
export const refreshAuthToken = handler(async (req, res) =>
  ok(
    res,
    "Session renewed",
    await service.refreshAuthTokenService(req.cookies.refreshToken, res),
  ),
);
export const getUserProfile = checkAuth;
export const checkEmailAvailability = handler(async (req, res) =>
  ok(res, "Email availability", {
    isAvailable: await service.checkEmailAvailabilityService(
      req.validatedQuery.email,
    ),
  }),
);
export const confirmEmailChange = handler(async (req, res) => {
  await service.confirmEmailChangeService(req.body.token, res);
  ok(res, "Email updated. Please sign in again");
});
export const requestEmailChange = handler(async (req, res) =>
  ok(res, "Confirmation email queued. Please check your new inbox shortly", {
    user: await service.requestEmailChangeService(
      req.userId,
      req.body.newEmail,
      req.body.password,
    ),
  }),
);
