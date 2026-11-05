import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "./AuthContext";
import * as api from "../api/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const expired = () => {
      if (active) setUser(null);
    };
    window.addEventListener("auth-expired", expired);
    api
      .checkAuthApi()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      window.removeEventListener("auth-expired", expired);
    };
  }, []);
  const run = useCallback(async (action) => {
    try {
      return await action();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request
          ? "Cannot reach the server. Please try again."
          : "Something went wrong. Please try again.");
      toast.error(message);
      return { success: false, message, code: error.response?.data?.code };
    }
  }, []);
  const login = useCallback(
    async (values) => {
      const result = await run(async () => {
        const data = await api.loginApi(values.email, values.password);
        setUser(data.user);
        navigate("/dashboard");
        toast.success("Signed in");
        return data;
      });
      if (result.code === "VERIFICATION_REQUIRED") {
        sessionStorage.setItem("verificationEmail", values.email);
        navigate("/confirm-email");
      }
      return result;
    },
    [run, navigate],
  );
  const register = useCallback(
    (values) =>
      run(async () => {
        const data = await api.registerApi(
          values.name,
          values.email,
          values.password,
        );
        sessionStorage.setItem("verificationEmail", values.email);
        navigate("/confirm-email");
        toast.success(data.message);
        return data;
      }),
    [run, navigate],
  );
  const confirmEmail = useCallback(
    (email, code) =>
      run(async () => {
        const data = await api.confirmEmailCodeApi(email, code);
        setUser(data.user);
        sessionStorage.removeItem("verificationEmail");
        navigate("/dashboard");
        toast.success(data.message);
        return data;
      }),
    [run, navigate],
  );
  const resendVerification = useCallback(
    (email) =>
      run(async () => {
        const data = await api.resendVerificationApi(email);
        toast.info(data.message);
        return data;
      }),
    [run],
  );
  const resetPassword = useCallback(
    (email) =>
      run(async () => {
        const data = await api.sendResetPasswordLinkApi(email);
        toast.info(data.message);
        return data;
      }),
    [run],
  );
  const resetPasswordWithToken = useCallback(
    (token, password) =>
      run(async () => {
        const data = await api.resetPasswordApi(token, password);
        setUser(null);
        navigate("/login");
        toast.success(data.message);
        return data;
      }),
    [run, navigate],
  );
  const updateUser = useCallback(
    (name) =>
      run(async () => {
        const data = await api.updateUserApi(name);
        setUser(data.user);
        toast.success(data.message);
        return data;
      }),
    [run],
  );
  const requestEditEmail = useCallback(
    (email, password) =>
      run(async () => {
        const data = await api.requestEmailChangeApi(email, password);
        setUser(data.user);
        toast.info(data.message);
        return data;
      }),
    [run],
  );
  const confirmEmailChange = useCallback(
    (token) =>
      run(async () => {
        const data = await api.confirmEmailChangeApi(token);
        setUser(null);
        toast.success(data.message);
        navigate("/login");
        return data;
      }),
    [run, navigate],
  );
  const logout = useCallback(
    () =>
      run(async () => {
        const data = await api.logoutApi();
        setUser(null);
        localStorage.removeItem("refreshTokenExpiry");
        navigate("/login");
        return data;
      }),
    [run, navigate],
  );
  const changePassword = useCallback(
    (oldPassword, newPassword) =>
      run(async () => {
        const data = await api.changePasswordApi(oldPassword, newPassword);
        setUser(null);
        navigate("/login");
        toast.success(data.message);
        return data;
      }),
    [run, navigate],
  );
  const deleteAccount = useCallback(
    (password) =>
      run(async () => {
        const data = await api.deleteAccountApi(password);
        setUser(null);
        navigate("/login");
        toast.success(data.message);
        return data;
      }),
    [run, navigate],
  );
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        confirmEmail,
        resendVerification,
        resetPassword,
        resetPasswordWithToken,
        updateUser,
        requestEditEmail,
        confirmEmailChange,
        logout,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
