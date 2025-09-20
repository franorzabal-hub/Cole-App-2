/**
 * String utility functions for ColeApp
 */

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Remove extra whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string contains substring (case insensitive)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, substring: string): number {
  return (str.match(new RegExp(substring, 'g')) || []).length;
}

/**
 * Remove accents/diacritics from string
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Generate random string
 */
export function randomString(
  length: number,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if string is empty or whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Pad string to specified length
 */
export function padString(
  str: string,
  length: number,
  char: string = ' ',
  position: 'start' | 'end' = 'end'
): string {
  if (str.length >= length) return str;
  const padding = char.repeat(length - str.length);
  return position === 'start' ? padding + str : str + padding;
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Reverse string
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if string is palindrome
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverseString(cleaned);
}

/**
 * Convert string to boolean
 */
export function toBoolean(str: string): boolean {
  return ['true', 'yes', '1', 'on'].includes(str.toLowerCase());
}

/**
 * Mask sensitive string (e.g., email, phone)
 */
export function maskString(
  str: string,
  visibleStart: number = 3,
  visibleEnd: number = 3,
  maskChar: string = '*'
): string {
  if (str.length <= visibleStart + visibleEnd) return str;

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);

  return `${start}${middle}${end}`;
}

/**
 * Split string into chunks
 */
export function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

/**
 * Highlight text within string
 */
export function highlightText(
  text: string,
  search: string,
  highlightClass: string = 'highlight'
): string {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * Generate acronym from string
 */
export function generateAcronym(str: string): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Check if string matches pattern
 */
export function matchesPattern(str: string, pattern: string | RegExp): boolean {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(str);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Convert newlines to <br> tags
 */
export function nl2br(str: string): string {
  return str.replace(/\n/g, '<br>');
}

/**
 * Encode string to base64
 */
export function toBase64(str: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(str);
  }
  return Buffer.from(str).toString('base64');
}

/**
 * Decode base64 string
 */
export function fromBase64(str: string): string {
  if (typeof window !== 'undefined' && window.atob) {
    return window.atob(str);
  }
  return Buffer.from(str, 'base64').toString();
}