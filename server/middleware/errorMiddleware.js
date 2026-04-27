function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";

  if (res.headersSent) {
    return next(error);
  }

  return res.status(statusCode).json({
    message
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
