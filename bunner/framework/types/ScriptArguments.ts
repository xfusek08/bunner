
export default class ScriptArguments {
    private constructor(
        public readonly runDirectory: string,
        public readonly bunExecutable: string,
        public readonly scriptEntryPoint: string,
        public readonly args: string[],
    ) {}
    
    public static initFromProcessArgv(): ScriptArguments {
        const [
            bunExecutable,
            scriptEntryPoint,
            ...args
        ] = process.argv;
        
        return new ScriptArguments(
            process.cwd(),
            bunExecutable,
            scriptEntryPoint,
            args,
        );
    }
    
    public popFirstArg() {
        const args = this.args.slice();
        const firstArg = args.shift();
        return [
            firstArg,
            new ScriptArguments(
                this.runDirectory,
                this.bunExecutable,
                this.scriptEntryPoint,
                args,
            )
        ] as const;
    }
    
    public clear() {
        return new ScriptArguments(
            this.runDirectory,
            this.bunExecutable,
            this.scriptEntryPoint,
            [],
        );
    }
}
