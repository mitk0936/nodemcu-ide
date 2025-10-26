/**
 * Wraps a function call (sync or async) and returns a uniform { error, data } result.
 *
 * @example
 * const result = await tryCatch(fetchData, 'COM3', 115200);
 */
export async function tryCatch<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn> | TReturn,
  ...args: TArgs
): Promise<{ error: string | null; data: TReturn | null }> {
  try {
    const data = await fn(...args);
    return { error: null, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return { error: message, data: null };
  }
}
