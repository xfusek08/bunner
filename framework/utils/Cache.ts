export default class Cache {
    private _cache: Map<string, unknown> = new Map();

    private constructor() {} // Final class

    public static create(): Cache {
        return new Cache();
    }

    public cached<T>(key: string, factory: () => T): T {
        if (!this._cache.has(key)) {
            this._cache.set(key, factory());
        }
        return this._cache.get(key) as T;
    }

    public invalidate(key?: string) {
        if (key !== undefined) {
            this._cache.delete(key);
        } else {
            this._cache.clear();
        }
    }
}
