export default class ScriptArguments {
    private constructor(
        public readonly runDirectory: string,
        public readonly bunExecutable: string,
        public readonly scriptEntryPoint: string,
        public readonly args: string[],
    ) {}

    public static initFromProcessArgv(): ScriptArguments {
        const [bunExecutable, scriptEntryPoint, ...args] = process.argv;

        return new ScriptArguments(process.cwd(), bunExecutable, scriptEntryPoint, args);
    }

    public isEmpty() {
        return this.args.length === 0;
    }

    public popFirstArg(): [string | null, ScriptArguments] {
        if (this.isEmpty()) {
            return [null, this] as const;
        }
        const args = this.args.slice();
        const firstArg = args.shift();
        return [firstArg ?? null, this.replace(args)];
    }

    public push(...arg: string[]): ScriptArguments;
    public push(arg: string[]): ScriptArguments;
    public push(arg: string): ScriptArguments;
    public push(arg: string | string[]) {
        const newArgs = Array.isArray(arg) ? arg : [arg];
        return this.replace([...this.args, ...newArgs]);
    }

    public replace(args: string[]) {
        return new ScriptArguments(
            this.runDirectory,
            this.bunExecutable,
            this.scriptEntryPoint,
            args,
        );
    }

    public clear() {
        return this.replace([]);
    }

    public getString(pos: number): string | null;
    public getString(pos: number, defaultValue: string): string;
    public getString(pos: number, defaultValue: string | null = null): string | null {
        if (pos >= this.args.length) {
            return defaultValue;
        }
        const val = this.args[pos];
        if (typeof val !== 'string') {
            return defaultValue;
        }
        return val;
    }

    public asString(): string {
        return this.args.join(' ');
    }
}
