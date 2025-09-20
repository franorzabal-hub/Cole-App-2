/**
 * Number utility functions for ColeApp
 */

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to decimal places
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Check if number is between range
 */
export function between(value: number, min: number, max: number, inclusive: boolean = true): boolean {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number, integer: boolean = false): number {
  const num = Math.random() * (max - min) + min;
  return integer ? Math.floor(num) : num;
}

/**
 * Check if number is even
 */
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

/**
 * Check if number is odd
 */
export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

/**
 * Check if number is prime
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate factorial
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial not defined for negative numbers');
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate GCD (Greatest Common Divisor)
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

/**
 * Calculate LCM (Least Common Multiple)
 */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map number from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Calculate mean of numbers
 */
export function mean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Calculate median of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate mode of numbers
 */
export function mode(numbers: number[]): number[] {
  if (numbers.length === 0) return [];

  const frequency: Record<number, number> = {};
  let maxFrequency = 0;

  for (const num of numbers) {
    frequency[num] = (frequency[num] || 0) + 1;
    maxFrequency = Math.max(maxFrequency, frequency[num]);
  }

  return Object.entries(frequency)
    .filter(([_, freq]) => freq === maxFrequency)
    .map(([num]) => Number(num));
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const avg = mean(numbers);
  const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const avgSquaredDiff = mean(squaredDiffs);

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Format number with ordinal suffix
 */
export function toOrdinal(n: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

/**
 * Convert to Roman numerals
 */
export function toRoman(num: number): string {
  if (num <= 0 || num >= 4000) {
    throw new Error('Number must be between 1 and 3999');
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

  let result = '';

  for (let i = 0; i < values.length; i++) {
    const count = Math.floor(num / values[i]);
    if (count) {
      result += symbols[i].repeat(count);
      num -= values[i] * count;
    }
  }

  return result;
}

/**
 * Parse float with fallback
 */
export function parseFloatSafe(value: string | number, fallback: number = 0): number {
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse int with fallback
 */
export function parseIntSafe(value: string | number, fallback: number = 0): number {
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
}