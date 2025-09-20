/**
 * Array utility functions for ColeApp
 */

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Remove duplicates by property
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const val = item[key];
    if (seen.has(val)) {
      return false;
    }
    seen.add(val);
    return true;
  });
}

/**
 * Group array items by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested array
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * Get random item from array
 */
export function randomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get array intersection
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * Get array difference
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}

/**
 * Sort array by property
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Find item by property
 */
export function findBy<T>(arr: T[], key: keyof T, value: any): T | undefined {
  return arr.find(item => item[key] === value);
}

/**
 * Filter array by multiple conditions
 */
export function filterBy<T>(arr: T[], conditions: Partial<T>): T[] {
  return arr.filter(item => {
    return Object.entries(conditions).every(([key, value]) => {
      return item[key as keyof T] === value;
    });
  });
}

/**
 * Sum array of numbers or by property
 */
export function sum(arr: number[]): number;
export function sum<T>(arr: T[], key: keyof T): number;
export function sum<T>(arr: T[] | number[], key?: keyof T): number {
  if (typeof arr[0] === 'number') {
    return (arr as number[]).reduce((sum, n) => sum + n, 0);
  }
  return (arr as T[]).reduce((sum, item) => sum + Number(item[key!]), 0);
}

/**
 * Get array average
 */
export function average(arr: number[]): number;
export function average<T>(arr: T[], key: keyof T): number;
export function average<T>(arr: T[] | number[], key?: keyof T): number {
  if (arr.length === 0) return 0;
  return sum(arr as any, key as any) / arr.length;
}

/**
 * Get min/max from array
 */
export function min(arr: number[]): number | undefined {
  return arr.length > 0 ? Math.min(...arr) : undefined;
}

export function max(arr: number[]): number | undefined {
  return arr.length > 0 ? Math.max(...arr) : undefined;
}

/**
 * Move item in array
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/**
 * Get last n items
 */
export function last<T>(arr: T[], n: number = 1): T[] {
  return arr.slice(-n);
}

/**
 * Get first n items
 */
export function first<T>(arr: T[], n: number = 1): T[] {
  return arr.slice(0, n);
}

/**
 * Create array range
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Remove item from array
 */
export function remove<T>(arr: T[], item: T): T[] {
  return arr.filter(i => i !== item);
}

/**
 * Remove item by index
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Check if arrays are equal
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * Partition array by predicate
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  
  arr.forEach(item => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });
  
  return [pass, fail];
}