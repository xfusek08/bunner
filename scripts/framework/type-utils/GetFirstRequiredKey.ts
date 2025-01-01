
/**
 * Gets the first required key from a type T that exists in the provided Keys array.
 * Useful for finding which properties are required in complex types including unions.
 *
 * @template T - The type to check for required keys
 * @template Keys - Tuple of keys to check in order
 * @returns The first required key found, or never if none found
 */
type GetFirstRequiredKey<T, Keys extends readonly any[]> =
    Keys extends [infer First, ...infer Rest] // Check if Keys has elements by attempting to split into First and Rest
        ? First extends keyof T // Check if First is actually a key of T
            ? T extends { [K in First]: any } // Verify the key exists in all possible variants of T (handles unions)
                ? {} extends Pick<T, First> // Check if the key is optional by seeing if empty object satisfies it
                    ? GetFirstRequiredKey<T, Rest> // If optional, recurse with remaining keys
                    : First // If required, return this key
                : GetFirstRequiredKey<T, Rest> // If key doesn't exist in all variants, try next key
            : never // If not a key of T, return never
        : never; // If no more keys to check, return never

export default GetFirstRequiredKey;

interface Test {
    a?: string,
    b: string,
    c: number,
}

interface Test2 {
    a?: string,
    b?: string,
    c: number,
}

interface Test3 {
    a: string,
    b: string,
    c: number,
}

interface Test4 {
    a: string,
}

type TheKey = GetFirstRequiredKey<Test, ["a", "b"]>; // "b"
type TheKey1 = GetFirstRequiredKey<Test2, ["a", "b"]>; // error
type TheKey2 = GetFirstRequiredKey<Test3, ["c", "b"]>; // c"
type TheKey3 = GetFirstRequiredKey<Test4, ["a"]>; // a
