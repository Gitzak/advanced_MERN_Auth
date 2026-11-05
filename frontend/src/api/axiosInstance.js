import axios from "axios";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:7500/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});
let refreshing;
const protectedPaths = [
  "/auth/check-auth",
  "/auth/me",
  "/auth/update-profile",
  "/auth/change-password",
  "/auth/request-email-change",
  "/auth/delete-account",
];
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retried ||
      !protectedPaths.includes(request.url)
    )
      throw error;
    request._retried = true;
    try {
      // Share a single refresh request across concurrent API calls in this tab.
      refreshing ??= (async () => {
        if (navigator.locks) {
          // Other tabs may have renewed the shared cookies while this tab waited.
          return navigator.locks.request("mern-auth-refresh", async () => {
            try {
              return await axiosInstance.get("/auth/check-auth", {
                _retried: true,
              });
            } catch (failure) {
              if (failure.response?.status !== 401) throw failure;
              return axiosInstance.post("/auth/refresh-token");
            }
          });
        }
        return axiosInstance.post("/auth/refresh-token");
      })().finally(() => {
        refreshing = undefined;
      });
      await refreshing;
    } catch {
      window.dispatchEvent(new Event("auth-expired"));
      throw error;
    }
    return axiosInstance(request);
  },
);
export default axiosInstance;
