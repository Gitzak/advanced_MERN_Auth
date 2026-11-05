import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};
export function clearAuthCookies(res) {
  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
}
export function signAccessToken(user, session) {
  return jwt.sign(
    { sid: String(session._id), version: session.version },
    env.JWT_SECRET,
    {
      subject: String(user._id),
      expiresIn: env.ACCESS_TOKEN_SECONDS,
      algorithm: "HS256",
      issuer: "mern-auth",
      audience: "mern-auth-access",
    },
  );
}
export function signRefreshToken(user, session, jti) {
  return jwt.sign(
    { sid: String(session._id), version: session.version },
    env.JWT_REFRESH_SECRET,
    {
      subject: String(user._id),
      jwtid: jti,
      expiresIn: Math.max(
        1,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      ),
      algorithm: "HS256",
      issuer: "mern-auth",
      audience: "mern-auth-refresh",
    },
  );
}
export function setAuthCookies(res, user, session, refreshToken) {
  res.cookie("token", signAccessToken(user, session), {
    ...cookieOptions,
    maxAge: env.ACCESS_TOKEN_SECONDS * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: Math.max(0, session.expiresAt.getTime() - Date.now()),
  });
}
export function verifyJwt(token, refresh = false) {
  return jwt.verify(token, refresh ? env.JWT_REFRESH_SECRET : env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: "mern-auth",
    audience: refresh ? "mern-auth-refresh" : "mern-auth-access",
  });
}
