import api from "./axiosInstance";
const post = async (path, body) => {
  const response = await api.post("/auth/" + path, body);
  return response.data;
};
export const loginApi = (email, password) => post("login", { email, password });
export const registerApi = (name, email, password) =>
  post("signup", { name, email, password });
export const confirmEmailCodeApi = (email, code) =>
  post("verify-email", { email, code });
export const resendVerificationApi = (email) =>
  post("resend-verification-email", { email });
export const sendResetPasswordLinkApi = (email) =>
  post("forgot-password", { email });
export const resetPasswordApi = (token, password) =>
  post("reset-password/" + token, { password });
export const updateUserApi = async (name) =>
  (await api.put("/auth/update-profile", { name })).data;
export const requestEmailChangeApi = (newEmail, password) =>
  post("request-email-change", { newEmail, password });
export const confirmEmailChangeApi = (token) =>
  post("confirm-email-change", { token });
export const checkAuthApi = async () =>
  (await api.get("/auth/check-auth")).data;
export const refreshAuthTokenApi = () => post("refresh-token");
export const logoutApi = () => post("logout");
export const changePasswordApi = (oldPassword, newPassword) =>
  post("change-password", { oldPassword, newPassword });
export const deleteAccountApi = (password) =>
  post("delete-account", { password });
