/**
 * Validation utility functions for ColeApp
 */

import { ValidationError, ValidationResult, ValidationRule } from '@coleapp/types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic international format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it has between 7 and 15 digits
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
      code: 'PASSWORD_NO_UPPERCASE'
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
      code: 'PASSWORD_NO_LOWERCASE'
    });
  }

  if (!/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
      code: 'PASSWORD_NO_NUMBER'
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
      code: 'PASSWORD_NO_SPECIAL'
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Get password strength score (0-5)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return strength;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate if value is a number
 */
export function isNumber(value: any): boolean {
  return !isNaN(value) && isFinite(value);
}

/**
 * Validate if value is an integer
 */
export function isInteger(value: any): boolean {
  return Number.isInteger(Number(value));
}

/**
 * Validate if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate if string is alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate if string contains only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Validate field with custom rules
 */
export function validateField(
  value: any,
  fieldName: string,
  rules: ValidationRule
): ValidationResult {
  const errors: ValidationError[] = [];

  // Required validation
  if (rules.required && !value) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'FIELD_REQUIRED'
    });
  }

  // Only continue if value exists or if not required
  if (!value && !rules.required) {
    return { valid: true };
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${rules.minLength} characters`,
        code: 'MIN_LENGTH'
      });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${rules.maxLength} characters`,
        code: 'MAX_LENGTH'
      });
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} format is invalid`,
        code: 'PATTERN_MISMATCH'
      });
    }
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      errors.push({
        field: fieldName,
        message: typeof customResult === 'string' ? customResult : `${fieldName} validation failed`,
        code: 'CUSTOM_VALIDATION'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validate multiple fields
 */
export function validateFields(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult {
  const allErrors: ValidationError[] = [];

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[fieldName], fieldName, fieldRules);
    if (result.errors) {
      allErrors.push(...result.errors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined
  };
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, ''); // Remove HTML tags
}

/**
 * Validate file type
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return !!extension && allowedTypes.includes(extension);
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate postal code (US format)
 */
export function isValidPostalCode(code: string, country: string = 'US'): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    MX: /^\d{5}$/,
    BR: /^\d{5}-?\d{3}$/,
  };

  const pattern = patterns[country];
  return pattern ? pattern.test(code) : true;
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, letters, numbers, underscore, hyphen
  // Must start with a letter
  return /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/.test(username);
}

/**
 * Escape HTML characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate IBAN
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  // Basic length check (15-34 characters)
  if (cleaned.length < 15 || cleaned.length > 34) {
    return false;
  }

  // Move first 4 characters to the end
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  let numericIBAN = '';
  for (const char of rearranged) {
    if (/[0-9]/.test(char)) {
      numericIBAN += char;
    } else if (/[A-Z]/.test(char)) {
      numericIBAN += (char.charCodeAt(0) - 55).toString();
    } else {
      return false;
    }
  }

  // Calculate mod 97
  let checksum = BigInt(numericIBAN) % 97n;
  return checksum === 1n;
}