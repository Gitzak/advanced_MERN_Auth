import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data.message || "An error occurred.";
      console.log(message);
    } else if (error.request) {
      console.log("No response from server. Please try again later.");
    } else {
      console.log("An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
