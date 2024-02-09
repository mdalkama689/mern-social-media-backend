// error handler

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  Error.captureStackTrace(err, errorHandler);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong. please try again! ",
    stack: err.stack,
  });
};

export default errorHandler;
