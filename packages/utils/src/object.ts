/**
 * Object utility functions for ColeApp
 */

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  const result = {} as T;

  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key];

        if (val && typeof val === 'object' && !Array.isArray(val)) {
          result[key] = deepMerge(result[key] || {}, val);
        } else {
          result[key] = val as any;
        }
      }
    }
  }

  return result;
}

/**
 * Pick properties from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit properties from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get nested property value
 */
export function get<T = any>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T;
    }
    result = result[key];
  }

  return (result !== undefined ? result : defaultValue) as T;
}

/**
 * Set nested property value
 */
export function set<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any
): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const result = { ...obj };
  let current = result;

  for (const key of keys) {
    if (!(key in current) || typeof current[key as keyof typeof current] !== 'object') {
      (current as any)[key] = {};
    }
    current = current[key as keyof typeof current] as any;
  }

  (current as any)[lastKey] = value;
  return result;
}

/**
 * Map object values
 */
export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key);
    }
  }

  return result;
}

/**
 * Filter object by predicate
 */
export function filterObject<T extends Record<string, any>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result = {} as Partial<T>;

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Invert object key-value pairs
 */
export function invert<T extends Record<string, any>>(
  obj: T
): Record<string, keyof T> {
  const result = {} as Record<string, keyof T>;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[String(obj[key])] = key;
    }
  }

  return result;
}

/**
 * Check if objects are equal (shallow)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * Check if objects are equal (deep)
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
}

/**
 * Clean object (remove null/undefined values)
 */
export function clean<T extends Record<string, any>>(obj: T): Partial<T> {
  const result = {} as Partial<T>;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Freeze object (deep)
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as any)[prop];
    if (val && typeof val === 'object') {
      deepFreeze(val);
    }
  });

  return obj;
}

/**
 * Create object from entries
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: Array<[K, V]>
): Record<K, V> {
  const result = {} as Record<K, V>;

  for (const [key, value] of entries) {
    result[key] = value;
  }

  return result;
}

/**
 * Get object diff
 */
export function diff<T extends Record<string, any>>(
  obj1: T,
  obj2: T
): Partial<T> {
  const result = {} as Partial<T>;

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!deepEqual(obj1[key], obj2[key])) {
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

/**
 * Has nested property
 */
export function has(obj: Record<string, any>, path: string): boolean {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Flatten nested object
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}