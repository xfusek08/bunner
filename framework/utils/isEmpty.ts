// NOTE: This has to be ordered from the most specific to the most general -> typescript will match the first one that fits
function isEmpty(value: string): value is '';
function isEmpty(value: number): value is 0;
function isEmpty(value: string | null): value is '' | null;
function isEmpty(value: number | null): value is 0 | null;
function isEmpty(value: string | undefined): value is '' | undefined;
function isEmpty(value: number | undefined): value is 0 | undefined;
function isEmpty(value: null): value is null;
function isEmpty(value: undefined): value is undefined;
function isEmpty<T>(value: T): value is Extract<T, null | undefined>;
function isEmpty(value: {
    [K in string | number]: unknown;
}): value is {
    [K in string | number]: never;
};
function isEmpty<T>(value: Array<T>): value is [];
function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'number') {
        return value === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
}

export default isEmpty;
