/**
 * Formatting utility functions for ColeApp
 */

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  decimals?: number
): string {
  const options: Intl.NumberFormatOptions = {};
  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(
  phone: string,
  format: 'US' | 'INTL' = 'US'
): string {
  const cleaned = phone.replace(/\D/g, '');

  if (format === 'US' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (format === 'INTL') {
    // Basic international format
    if (cleaned.length > 10) {
      const country = cleaned.slice(0, cleaned.length - 10);
      const area = cleaned.slice(-10, -7);
      const prefix = cleaned.slice(-7, -4);
      const line = cleaned.slice(-4);
      return `+${country} ${area} ${prefix}-${line}`;
    }
  }

  return phone; // Return original if can't format
}

/**
 * Format credit card number (mask middle digits)
 */
export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 12) return cardNumber;

  const first = cleaned.slice(0, 4);
  const last = cleaned.slice(-4);
  const middle = '*'.repeat(cleaned.length - 8);

  return `${first} ${middle} ${last}`.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Format name (capitalize first letter of each word)
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format grade (number to letter grade)
 */
export function formatGrade(score: number, maxScore: number = 100): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format list of items with proper grammar
 */
export function formatList(
  items: string[],
  conjunction: string = 'and',
  locale: string = 'en-US'
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];
  return `${allButLast.join(', ')}, ${conjunction} ${last}`;
}

/**
 * Format address
 */
export function formatAddress(
  street?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string
): string {
  const parts = [];

  if (street) parts.push(street);
  if (city && state) {
    parts.push(`${city}, ${state}`);
  } else if (city) {
    parts.push(city);
  } else if (state) {
    parts.push(state);
  }
  if (postalCode) parts.push(postalCode);
  if (country) parts.push(country);

  return parts.join(', ');
}

/**
 * Format SQL-safe string (escape single quotes)
 */
export function formatSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Format URL slug
 */
export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Format initials from name
 */
export function formatInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(
  value: boolean,
  trueText: string = 'Yes',
  falseText: string = 'No'
): string {
  return value ? trueText : falseText;
}

/**
 * Format minutes as hours and minutes
 */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format bytes as human-readable speed
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`;
}