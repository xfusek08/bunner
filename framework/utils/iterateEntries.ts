/**
 * Type-safe iteration over object entries preserving literal types
 */
export default function iterateEntries<
    T extends Record<string, unknown>,
    K extends string = Extract<keyof T, string>,
>(obj: T, fn: (entry: [K, T[K]]) => void): void {
    (Object.entries(obj) as Array<[K, T[K]]>).forEach((entry) => {
        fn(entry);
    });
}
