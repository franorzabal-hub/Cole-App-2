/**
 * ColeApp Shared Utilities
 *
 * This package provides common utility functions used across
 * the ColeApp ecosystem including date manipulation, validation,
 * formatting, and other helper functions.
 */

// Export all date utilities
export * from './date';

// Export all validation utilities
export * from './validation';

// Export all formatting utilities
export * from './format';

// Export all string utilities
export * from './string';

// Export all array utilities
export * from './array';

// Export all object utilities
export * from './object';

// Export all number utilities
export * from './number';

// Export all async utilities
export * from './async';

// Re-export types for convenience
export type {
  ValidationRule,
  ValidationResult,
  ValidationError,
  User,
  Tenant,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
} from '@coleapp/types';