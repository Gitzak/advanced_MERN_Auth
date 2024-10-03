import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  checkAuthApi,
  confirmEmailCodeApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  sendResetPasswordLinkApi,
} from "../api/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User data
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Keep navigate for internal use if needed

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const refreshTokenExpiry = localStorage.getItem("refreshTokenExpiry");

        // Check if the refresh token expiration date exists and is still valid
        if (!refreshTokenExpiry || new Date(refreshTokenExpiry) < new Date()) {
          setUser(null);
          localStorage.clear();

          // Check if the current route is a public route (e.g., /login, /register)
          const publicPaths = getAllPublicPaths();
          if (!publicPaths.includes(location.pathname)) {
            navigate("/login"); // Redirect to login if the session has expired and not on a public route
          }
          return;
        }

        const data = await checkAuthApi();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.message === "Failed to refresh token.") {
          setUser(null); // Clear user data if refresh fails
          navigate("/login"); // Redirect to login if unable to refresh
          toast.error("Session expired, please log in again.");
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const login = async (userData, navigateFn) => {
    try {
      const data = await loginApi(userData.email, userData.password);

      if (data.success) {
        setUser(data.user); // Set authenticated user
        navigateFn("/dashboard"); // Navigate to dashboard using passed navigate function
        toast.success("Logged in successfully!");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  // Register function
  const register = async (userData, navigateFn) => {
    try {
      const data = await registerApi(
        userData.name,
        userData.email,
        userData.password
      );

      if (data.success) {
        navigateFn("/confirm-email");
        toast.success(
          "Registered successfully! Please check your email for the confirmation code."
        );
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration. Please try again.");
    }
  };

  // Confirm email function
  const confirmEmail = async (code, navigateFn) => {
    try {
      const data = await confirmEmailCodeApi(code); // Call the API to confirm the email

      if (data.success) {
        toast.success("Email verified successfully!");
        navigateFn("/dashboard"); // Navigate to the dashboard after successful confirmation
      } else {
        toast.error(data.message || "Invalid code, please try again.");
      }
    } catch (error) {
      console.error("Email confirmation error:", error);
      toast.error(
        "An error occurred during email confirmation. Please try again."
      );
    }
  };

  // Call the API to confirm the reset code
  const resetPassword = async (email, navigateFn) => {
    try {
      const data = await sendResetPasswordLinkApi(email);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Invalid email, please try again.");
      }
    } catch (error) {
      console.error("Reset password confirmation error:", error);
      toast.error("An error occurred, please try again.");
    }
  };

  const resetPasswordWithToken = async (token, newPassword, navigateFn) => {
    try {
      const data = await resetPasswordApi(token, newPassword); // Call the API to reset password

      if (data.success) {
        toast.success(data.message);
        navigateFn("/login"); // Redirect to login after successful password reset
      } else {
        toast.error(data.message || "Password reset failed, please try again.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred, please try again.");
    }
  };

  const logout = async (navigateFn) => {
    try {
      const data = await logoutApi(); // Call the logout API

      if (data.success) {
        setUser(null); // Clear user state
        localStorage.clear();
        navigateFn("/login"); // Navigate to the login page using passed navigate function
        toast.info("Logged out successfully!");
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        confirmEmail,
        resetPassword,
        resetPasswordWithToken,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
