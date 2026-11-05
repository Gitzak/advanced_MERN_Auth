import mongoose from "mongoose";
import { verifyJwt } from "../utils/generateTokenAndSetCookie.js";
import { findUserById } from "../repositories/userRepository.js";
import { Session } from "../models/Session.js";
export const verifyToken = async (req, res, next) => {
  let decoded;
  try {
    decoded = verifyJwt(req.cookies?.token);
    if (
      !mongoose.isObjectIdOrHexString(decoded.sub) ||
      !mongoose.isObjectIdOrHexString(decoded.sid)
    )
      throw Error("claims");
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Please sign in again" });
  }
  try {
    const [user, session] = await Promise.all([
      findUserById(decoded.sub),
      Session.findOne({
        _id: decoded.sid,
        userId: decoded.sub,
        expiresAt: { $gt: new Date() },
      }),
    ]);
    if (
      !user?.isVerified ||
      !session ||
      decoded.version !== user.sessionVersion ||
      session.version !== user.sessionVersion
    )
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please sign in again",
        });
    req.userId = String(user._id);
    req.user = user;
    req.sessionId = String(session._id);
    req.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};
