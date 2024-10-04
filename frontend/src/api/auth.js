import axiosInstance from "./axiosInstance";

// API call to login
export const loginApi = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    // Store the refresh token expiry date in localStorage
    if (response.data && response.data.refreshTokenExpiryDate) {
      localStorage.setItem(
        "refreshTokenExpiry",
        response.data.refreshTokenExpiryDate
      );
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// API call to register a new user
export const registerApi = async (name, email, password) => {
  try {
    const response = await axiosInstance.post("/auth/signup", {
      name,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// Function to verify email using the 6-digit code
export const confirmEmailCodeApi = async (code) => {
  try {
    const response = await axiosInstance.post("/auth/verify-email", {
      code,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// API call to confirm the reset password
export const sendResetPasswordLinkApi = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// API call to reset password with token
export const resetPasswordApi = async (token, password) => {
  try {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// API call to update user profile (name)
export const updateUserApi = async (name) => {
  try {
    const response = await axiosInstance.put("/auth/update-profile", { name });

    // Handle success or error responses
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};

// API call to check authentication
export const checkAuthApi = async () => {
  const refreshTokenExpiry = localStorage.getItem("refreshTokenExpiry");

  // Check if the refresh token expiration date exists and is valid
  if (!refreshTokenExpiry || new Date(refreshTokenExpiry) < new Date()) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  try {
    // Try to verify the auth token by calling the backend
    const response = await axiosInstance.get("/auth/check-auth");
    return response.data;
  } catch (error) {
    // Check if the error is related to token expiration
    if (error.response && error.response.status === 401) {
      try {
        // Try refreshing the token
        const refreshResponse = await refreshAuthTokenApi();

        if (refreshResponse.success) {
          // Retry the original request after refreshing the token
          const retryResponse = await axiosInstance.get("/auth/check-auth");
          return retryResponse.data;
        } else {
          // If the refresh token API call failed, clear localStorage and redirect to login
          localStorage.clear();
          window.location.href = "/login";
        }
      } catch (refreshError) {
        // If the token refresh fails, clear localStorage and redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      throw error; // For any other error, rethrow it to handle elsewhere
    }
  }
};

// API call to refresh the token
export const refreshAuthTokenApi = async () => {
  try {
    const response = await axiosInstance.post("/auth/refresh-token");
    return response.data;
  } catch (error) {
    throw new Error("Failed to refresh token.");
  }
};

// API call to logout
export const logoutApi = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data; // Return the response to handle the API status
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Network error. Please try again later.");
    }
  }
};
