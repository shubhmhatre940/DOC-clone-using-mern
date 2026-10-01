/**
 * Resolves JWT secret with environment safety.
 * In production (NODE_ENV=production), this enforces that JWT_SECRET is explicitly
 * provided and throws an immediate fatal error if missing, preventing silent fallback
 * to a hardcoded or well-known secret.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR]: JWT_SECRET environment variable is required in production.');
    }
    console.warn('[SECURITY WARNING]: JWT_SECRET is not set in environment. Falling back to local development secret.');
    return 'super_secret_jwt_key_for_google_docs_clone_12345';
  }
  return secret;
};

export default getJwtSecret;
