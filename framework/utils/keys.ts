/**
 * Type-safe version of Object.keys. Unlike the native Object.keys,
 * this function preserves the types of the keys in the returned array.
 *
 * @example
 * const obj = { a: 1, b: 'hello', c: true };
 * // keys(obj) has type ('a' | 'b' | 'c')[]
 * const keyList = keys(obj);
 *
 * @param obj The object to extract keys from
 * @returns An array of the object's keys with proper typing
 */
export default function keys<T extends Record<PropertyKey, unknown>>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}
