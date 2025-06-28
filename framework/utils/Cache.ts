export default class Cache {
    private constructor(private _data: Record<string | number | symbol, unknown> = {}) {}

    public static create(): Cache {
        return new Cache();
    }

    // Overload for async fetchers
    public cached<T, K extends string | number | symbol>(
        key: K,
        fetcher: () => Promise<T>,
    ): Promise<T>;

    // Overload for sync fetchers
    public cached<T, K extends string | number | symbol>(key: K, fetcher: () => T): T;

    // Implementation that handles both cases
    public cached<T, K extends string | number | symbol>(
        key: K,
        fetcher: () => T | Promise<T>,
    ): T | Promise<T> {
        if (this._data[key]) {
            return this._data[key] as T;
        }

        const result = fetcher();

        if (result instanceof Promise) {
            // Handle async case
            return result.then((asyncResult) => {
                this._data[key] = asyncResult;
                return asyncResult;
            });
        } else {
            // Handle sync case
            this._data[key] = result;
            return result;
        }
    }

    /**
     * Invalidates the entire cache by clearing all stored data
     */
    public invalidate(): void {
        this._data = {};
    }
}
