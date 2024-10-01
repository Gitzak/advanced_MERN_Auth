import jwt from "jsonwebtoken";
import { ApiError } from "./errors.js";

export const generateTokenAndSetCookie = (res, userId) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return accessToken;
  } catch (error) {
    console.error("Error generating access token and setting cookie:", error);
    throw new ApiError("Failed to authenticate user", 500);
  }
};

export const generateRefreshTokenAndSetCookie = (res, userId) => {
  try {
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    const refreshTokenExpiryDate = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      refreshToken,
      refreshTokenExpiryDate, // Return the expiration date
    };
  } catch (error) {
    console.error("Error generating refresh token and setting cookie:", error);
    throw new ApiError("Failed to generate refresh token", 500);
  }
};
