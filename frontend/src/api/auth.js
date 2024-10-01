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
        // Check if the error is related to token expiration
        if (error.response && error.response.status === 401) {
            // Try refreshing the token
            const refreshResponse = await refreshAuthTokenApi();
            if (refreshResponse.success) {
                // Retry the original request after refreshing the token
                const retryResponse = await axiosInstance.get(
                    "/auth/check-auth"
                );
                return retryResponse.data;
            }
        }
        throw error;
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
