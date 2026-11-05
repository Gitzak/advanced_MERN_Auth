export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.statusCode || err.status || 500;
  let message = err.message;
  if (err.code === 11000) {
    status = 409;
    message = "Email is already in use";
  }
  if (
    err.name === "ValidationError" ||
    err.name === "CastError" ||
    err.type === "entity.parse.failed"
  ) {
    status = 400;
    message = "Invalid request data";
  }
  if (status >= 500) {
    console.error("Request failed:", req.method, req.path, err.name);
    message = "Something went wrong. Please try again later";
  }
  res
    .status(status)
    .json({
      success: false,
      message,
      ...(err.code === "VERIFICATION_REQUIRED" ? { code: err.code } : {}),
    });
};
