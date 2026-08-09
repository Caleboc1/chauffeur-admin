/**
 * Checks if a value is present.
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

/**
 * Validates an email address.
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a phone number format.
 */
export function isValidPhone(phone) {
  // Simple validation: check if it has digits and symbols commonly used in phone numbers
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(String(phone)) && String(phone).length >= 8;
}

/**
 * Checks for minimum string length.
 */
export function hasMinLength(value, min) {
  return typeof value === 'string' && value.trim().length >= min;
}
