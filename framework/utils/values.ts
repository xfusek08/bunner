/**
 * Type-safe version of Object.values. Unlike the native Object.values,
 * this function preserves the types of the values in the returned array.
 *
 * @example
 * const obj = { a: 1, b: 'hello', c: true };
 * // values(obj) has type (number | string | boolean)[]
 * const vals = values(obj);
 *
 * @param obj The object to extract values from
 * @returns An array of the object's values with proper typing
 */
export default function values<T extends Record<PropertyKey, unknown>>(obj: T): Array<T[keyof T]> {
    return Object.values(obj) as Array<T[keyof T]>;
}
