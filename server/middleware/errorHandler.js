/**
 * Not found handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Standard error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Always log the full error with request context on the server
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle CORS rejection
  if (err.message && err.message.startsWith('CORS blocked')) {
    statusCode = 403;
  }

  // In production, keep 500+ error messages generic to prevent leaking database/server internals
  const message = (isProduction && statusCode >= 500)
    ? 'Internal server error'
    : err.message || 'An error occurred';

  res.status(statusCode).json({
    message,
    stack: isProduction ? null : err.stack
  });
};
