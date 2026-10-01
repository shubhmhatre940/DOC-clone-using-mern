import rateLimit from 'express-rate-limit';

/**
 * Standardized 429 response handler
 */
const rateLimitHandler = (message) => (req, res /*, next, options */) => {
  return res.status(429).json({
    success: false,
    message: message || 'Too many requests. Please try again later.'
  });
};

/**
 * Rate limiter for sensitive authentication endpoints (login, signup)
 * 5 attempts per minute per IP
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please wait 1 minute before trying again.')
});

/**
 * Rate limiter for heavy export generation (DOCX, TXT, HTML)
 * 15 requests per 15 minutes
 */
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many document exports requested. Please wait a few minutes before trying again.')
});

/**
 * Stricter rate limiter for PDF export only (runs Puppeteer — expensive, easy DoS target)
 * 5 PDF exports per 15 minutes per IP
 */
export const pdfExportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('PDF export limit reached. Generating PDFs is resource-intensive — please wait 15 minutes before requesting more.')
});

/**
 * Rate limiter for file uploads (DOCX, media)
 * 20 uploads per 15 minutes
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Upload limit reached. Please wait a few minutes before uploading more files.')
});

/**
 * Rate limiter for creating new documents
 * 30 document creations per 15 minutes
 */
export const createDocLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Document creation limit reached. Please slow down and try again shortly.')
});

/**
 * Rate limiter for grammar check API calls
 * 60 requests per minute (it hits an external service)
 */
export const grammarLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Grammar check rate limit reached. Please wait a moment before trying again.')
});
