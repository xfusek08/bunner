export default class BunnerError extends Error {
    constructor(
        public readonly message: string,
        public readonly code: number,
    ) {
        super(message);
        this.name = 'BunnerError';
    }
}
