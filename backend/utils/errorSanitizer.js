/**
 * Error Sanitizer Utility
 * 
 * Strips sensitive environment variable values from error messages
 * to prevent leaking API keys, secrets, and credentials to clients.
 */

// List of env variable prefixes/names that contain sensitive values
const SENSITIVE_ENV_KEYS = [
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'JWT_SECRET',
  'MONGODB_URI',
  'BREVO_API_KEY',
  'ORCID_CLIENT_SECRET',
  'ORCID_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'DATABASE_URL',
  'DB_PASSWORD',
  'API_KEY',
  'SECRET_KEY',
  'ACCESS_TOKEN',
  'PRIVATE_KEY',
];

/**
 * Build a list of sensitive values from environment variables.
 * Cached on first call for performance.
 */
let _sensitiveValues = null;

function getSensitiveValues() {
  if (_sensitiveValues) return _sensitiveValues;

  _sensitiveValues = [];

  // Collect values from known sensitive keys
  for (const key of SENSITIVE_ENV_KEYS) {
    const value = process.env[key];
    if (value && value.length >= 6) {
      _sensitiveValues.push(value);
    }
  }

  // Also scan for any env var whose name contains sensitive keywords
  const sensitivePatterns = ['SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'CREDENTIAL', 'PRIVATE', '_URI'];
  for (const [key, value] of Object.entries(process.env)) {
    if (value && value.length >= 8) {
      const upperKey = key.toUpperCase();
      if (sensitivePatterns.some(pattern => upperKey.includes(pattern))) {
        if (!_sensitiveValues.includes(value)) {
          _sensitiveValues.push(value);
        }
      }
    }
  }

  // Sort by length descending so longer values are replaced first
  // (prevents partial matches leaving fragments)
  _sensitiveValues.sort((a, b) => b.length - a.length);

  return _sensitiveValues;
}

/**
 * Reset the cached sensitive values (useful if env changes at runtime)
 */
function resetSensitiveValuesCache() {
  _sensitiveValues = null;
}

/**
 * Sanitize a string by replacing any sensitive environment variable
 * values with [REDACTED].
 * 
 * @param {string} message - The message to sanitize
 * @returns {string} - The sanitized message
 */
function sanitizeMessage(message) {
  if (!message || typeof message !== 'string') return message;

  let sanitized = message;
  const sensitiveValues = getSensitiveValues();

  for (const value of sensitiveValues) {
    // Use split/join for safe replacement (avoids regex special char issues)
    if (sanitized.includes(value)) {
      sanitized = sanitized.split(value).join('[REDACTED]');
    }
  }

  return sanitized;
}

/**
 * Get a safe error message for client responses.
 * 
 * In production: returns a generic message unless it's a known safe error.
 * In development: returns the sanitized (but detailed) message.
 * 
 * @param {Error|string} error - The error object or message
 * @param {string} fallbackMessage - A safe fallback message to use
 * @returns {string} - A safe message for the client
 */
function getSafeErrorMessage(error, fallbackMessage = 'An internal error occurred') {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const isProduction = process.env.NODE_ENV === 'production';

  // Always sanitize the message first
  const sanitized = sanitizeMessage(rawMessage);

  // Known safe error patterns that can be shown to the user
  const safePatterns = [
    /file too large/i,
    /only .+ files are allowed/i,
    /no file uploaded/i,
    /not found/i,
    /already exists/i,
    /validation/i,
    /required/i,
    /invalid.*format/i,
    /unauthorized/i,
    /forbidden/i,
    /duplicate/i,
  ];

  const isSafeMessage = safePatterns.some(pattern => pattern.test(rawMessage));

  if (isSafeMessage) {
    return sanitized;
  }

  // In production, return the fallback for non-safe messages
  if (isProduction) {
    return fallbackMessage;
  }

  // In development, return sanitized but detailed message
  return sanitized;
}

/**
 * Sanitize an entire error response object.
 * Removes or redacts any fields that might contain sensitive data.
 * 
 * @param {object} responseObj - The response object to sanitize
 * @returns {object} - The sanitized response object
 */
function sanitizeErrorResponse(responseObj) {
  if (!responseObj || typeof responseObj !== 'object') return responseObj;

  const sanitized = { ...responseObj };

  // Sanitize known message fields
  if (sanitized.message) {
    sanitized.message = sanitizeMessage(sanitized.message);
  }
  if (sanitized.error) {
    if (typeof sanitized.error === 'string') {
      sanitized.error = sanitizeMessage(sanitized.error);
    } else if (typeof sanitized.error === 'object' && sanitized.error.message) {
      sanitized.error = { ...sanitized.error, message: sanitizeMessage(sanitized.error.message) };
    }
  }

  // Remove stack traces in production
  if (process.env.NODE_ENV === 'production') {
    delete sanitized.stack;
    delete sanitized.error;
  }

  return sanitized;
}

module.exports = {
  sanitizeMessage,
  getSafeErrorMessage,
  sanitizeErrorResponse,
  resetSensitiveValuesCache,
};
