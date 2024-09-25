import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    console.log('====================================');
    console.log(token);
    console.log('====================================');
    
    // Handle missing token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token contains the required data
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
    }

    // Attach user info to request and proceed
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - token expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token signature",
      });
    }

    // Catch-all for other errors
    console.error("Error in verifyToken:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying token",
    });
  }
};
