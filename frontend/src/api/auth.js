import axiosInstance from "./axiosInstance";

// API call to login
export const loginApi = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
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

// API call to check authentication
export const checkAuthApi = async () => {
  try {
    const response = await axiosInstance.get("/auth/check-auth");
    return response.data;
  } catch (error) {
    throw error;
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
