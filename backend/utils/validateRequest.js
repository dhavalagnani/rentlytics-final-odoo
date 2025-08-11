/**
 * Validates required fields in request body
 * @param {Object} body - Request body object
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid boolean and message
 */
export const validateRequest = (body, requiredFields) => {
  const missingFields = [];

  for (const field of requiredFields) {
    if (
      !body[field] ||
      (typeof body[field] === "string" && body[field].trim() === "")
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return {
    isValid: true,
    message: "Validation passed",
  };
};
