/**
 * Async utility functions for ColeApp
 */

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(lastError, attempt);
      }

      await sleep(currentDelay);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Timeout a promise
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    sleep(ms).then(() => {
      throw new Error(errorMessage);
    })
  ]);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Run promises in sequence
 */
export async function sequence<T>(
  tasks: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = [];

  for (const task of tasks) {
    results.push(await task());
  }

  return results;
}

/**
 * Run promises in parallel with concurrency limit
 */
export async function parallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number = Infinity
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = async () => {
      results[i] = await tasks[i]();
    };

    const promise = task();
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Map async with concurrency control
 */
export async function mapAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number = Infinity
): Promise<R[]> {
  return parallel(
    items.map((item, index) => () => fn(item, index)),
    concurrency
  );
}

/**
 * Filter async
 */
export async function filterAsync<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(
    items.map((item, index) => predicate(item, index))
  );

  return items.filter((_, index) => results[index]);
}

/**
 * Some async (returns true if any predicate is true)
 */
export async function someAsync<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<boolean> {
  const results = await Promise.all(
    items.map((item, index) => predicate(item, index))
  );

  return results.some(result => result);
}

/**
 * Every async (returns true if all predicates are true)
 */
export async function everyAsync<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<boolean> {
  const results = await Promise.all(
    items.map((item, index) => predicate(item, index))
  );

  return results.every(result => result);
}

/**
 * Reduce async
 */
export async function reduceAsync<T, R>(
  items: T[],
  fn: (acc: R, item: T, index: number) => Promise<R>,
  initial: R
): Promise<R> {
  let accumulator = initial;

  for (let i = 0; i < items.length; i++) {
    accumulator = await fn(accumulator, items[i], i);
  }

  return accumulator;
}

/**
 * Queue for sequential async operations
 */
export class AsyncQueue<T = void> {
  private queue: Array<() => Promise<T>> = [];
  private running = false;

  async add(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      if (!this.running) {
        this.process();
      }
    });
  }

  private async process(): Promise<void> {
    if (this.running || this.queue.length === 0) return;

    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task();
      } catch (error) {
        console.error('AsyncQueue task error:', error);
      }
    }

    this.running = false;
  }

  get size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * Memoize async function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return (async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Race with timeout and default value
 */
export async function raceWithDefault<T>(
  promise: Promise<T>,
  ms: number,
  defaultValue: T
): Promise<T> {
  try {
    return await timeout(promise, ms);
  } catch {
    return defaultValue;
  }
}

/**
 * Poll until condition is met
 */
export async function poll<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    interval?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { interval = 1000, timeout: maxTimeout = 60000 } = options;
  const startTime = Date.now();

  while (true) {
    const result = await fn();

    if (condition(result)) {
      return result;
    }

    if (Date.now() - startTime > maxTimeout) {
      throw new Error('Polling timed out');
    }

    await sleep(interval);
  }
}