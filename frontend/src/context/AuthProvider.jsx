import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { checkAuthApi, loginApi, logoutApi } from "../api/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User data
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Keep navigate for internal use if needed

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const refreshTokenExpiry = localStorage.getItem("refreshTokenExpiry");

        console.log('====================================');
        console.log(refreshTokenExpiry);
        console.log('====================================');

        // Check if the refresh token expiration date exists and is still valid
        if (!refreshTokenExpiry || new Date(refreshTokenExpiry) < new Date()) {
          setUser(null);
          localStorage.clear();
          navigate("/login"); // Redirect to login if the session has expired
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
