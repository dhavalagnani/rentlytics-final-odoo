/**
 * Standardized API Response Helper
 * Ensures consistent response format across all endpoints
 */

/**
 * Send a standardized success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 */
export const sendSuccess = (res, data, status = 200, message = null) => {
  const response = {
    ok: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(status).json(response);
};

/**
 * Send a standardized error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {string} code - Optional error code
 */
export const sendError = (res, error, status = 400, code = null) => {
  const response = {
    ok: false,
    error
  };
  
  if (code) {
    response.code = code;
  }
  
  return res.status(status).json(response);
};

/**
 * Send a standardized response with custom shape
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {boolean} options.ok - Success status
 * @param {any} options.data - Response data (for success)
 * @param {string} options.error - Error message (for errors)
 * @param {string} options.code - Optional error code
 * @param {number} options.status - HTTP status code (default: 200)
 */
export const sendResponse = (res, { ok, data, error, code }, status = 200) => {
  const response = { ok };
  
  if (ok && data !== undefined) {
    response.data = data;
  }
  
  if (!ok && error) {
    response.error = error;
    if (code) {
      response.code = code;
    }
  }
  
  return res.status(status).json(response);
};

/**
 * Common HTTP status codes for reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Common error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * Predefined response helpers for common scenarios
 */
export const responses = {
  // Success responses
  ok: (res, data, message) => sendSuccess(res, data, HTTP_STATUS.OK, message),
  created: (res, data, message) => sendSuccess(res, data, HTTP_STATUS.CREATED, message),
  noContent: (res) => res.status(HTTP_STATUS.NO_CONTENT).send(),
  
  // Error responses
  badRequest: (res, error, code) => sendError(res, error, HTTP_STATUS.BAD_REQUEST, code),
  unauthorized: (res, error = 'Unauthorized', code = ERROR_CODES.AUTHENTICATION_ERROR) => 
    sendError(res, error, HTTP_STATUS.UNAUTHORIZED, code),
  forbidden: (res, error = 'Forbidden', code = ERROR_CODES.AUTHORIZATION_ERROR) => 
    sendError(res, error, HTTP_STATUS.FORBIDDEN, code),
  notFound: (res, error = 'Resource not found', code = ERROR_CODES.NOT_FOUND) => 
    sendError(res, error, HTTP_STATUS.NOT_FOUND, code),
  conflict: (res, error, code = ERROR_CODES.CONFLICT) => 
    sendError(res, error, HTTP_STATUS.CONFLICT, code),
  validationError: (res, error) => 
    sendError(res, error, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR),
  internalError: (res, error = 'Internal server error') => 
    sendError(res, error, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR),
  rateLimitExceeded: (res, error = 'Rate limit exceeded') => 
    sendError(res, error, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED)
};
