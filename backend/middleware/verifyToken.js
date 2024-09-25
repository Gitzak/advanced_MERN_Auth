import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - invalid token',
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - user not found or deleted',
      });
    }

    req.userId = decoded.userId;
    req.role = user.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - token expired',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - invalid token signature',
      });
    }

    console.error('Error in verifyToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying token',
    });
  }
};