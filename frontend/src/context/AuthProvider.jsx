import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { checkAuthApi, loginApi, logoutApi } from "../api/Auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User data
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Keep navigate for internal use if needed

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await checkAuthApi();
        if (data.success) {
          setUser(data.user); // Set authenticated user
        } else {
          setUser(null); // No user authenticated
        }
      } catch (error) {
        setUser(null); // No user authenticated
      } finally {
        setLoading(false); // Authentication check completed
      }
    };

    verifyAuth();
  }, []);

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
    }
  };

  const logout = async (navigateFn) => {
    try {
      const data = await logoutApi(); // Call the logout API

      if (data.success) {
        setUser(null); // Clear user state
        localStorage.removeItem("user"); // Remove user data from localStorage
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
