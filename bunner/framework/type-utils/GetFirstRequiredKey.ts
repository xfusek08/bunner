import IsNullable from './IsNullable';

/**
 * Gets the first required key from a type T that exists in the provided Keys array.
 * Useful for finding which properties are required in complex types including unions.
 *
 * @template T - The type to check for required keys
 * @template Keys - Tuple of keys to check in order
 * @returns The first required key found, or never if none found
 */
type GetFirstRequiredKey<T, Keys extends readonly unknown[]> = Keys extends [
    infer First,
    ...infer Rest,
] // Check if Keys has elements by attempting to split into First and Rest
    ? First extends keyof T // Check if First is actually a key of T
        ? T extends { [K in First]: infer U } // Verify the key exists in all possible variants of T (handles unions)
            ? IsNullable<U> extends true // Check if the key is optional
                ? GetFirstRequiredKey<T, Rest> // If optional, recurse with remaining keys
                : First // If required, return this key
            : GetFirstRequiredKey<T, Rest> // If key doesn't exist in all variants, try next key
        : [] extends Rest
          ? never // If no more keys to check, return never
          : GetFirstRequiredKey<T, Rest> // If First isn't a key of T, try
    : never; // If no more keys to check, return never

export default GetFirstRequiredKey;

interface Test {
    a?: string;
    b: string;
    c: number;
}

interface Test2 {
    a?: string;
    b?: string;
    c: number;
}

interface Test3 {
    a: string;
    b: string;
    c: number;
}

interface Test4 {
    a: string;
}

// eslint-disable-next-line unused-imports/no-unused-vars
type TheKey = GetFirstRequiredKey<Test, ['a', 'b']>; // "b"

// eslint-disable-next-line unused-imports/no-unused-vars
type TheKey1 = GetFirstRequiredKey<Test2, ['a', 'b']>; // error

// eslint-disable-next-line unused-imports/no-unused-vars
type TheKey2 = GetFirstRequiredKey<Test3, ['c', 'b']>; // c"

// eslint-disable-next-line unused-imports/no-unused-vars
type TheKey3 = GetFirstRequiredKey<Test4, ['a']>; // a
