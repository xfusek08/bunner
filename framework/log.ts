export default class log {
    private static timestamp(): string {
        return new Date().toISOString();
    }

    private static format(
        level: string,
        emoji: string,
        message: string,
        color: string,
    ): string {
        return `${color}${emoji} [${level}] ${this.timestamp()}: ${message}\x1b[0m`;
    }

    public static info(message: string, stdout: boolean = false): void {
        const formatted = this.format('INFO', '💡', message, '\x1b[36m');
        this.logOut(formatted, !stdout);
    }

    public static warn(message: string, stdout: boolean = false): void {
        const formatted = this.format('WARN', '⚠️', message, '\x1b[33m');
        this.logOut(formatted, !stdout);
    }

    public static error(message: string): void {
        const formatted = this.format('ERROR', '❌', message, '\x1b[31m');
        console.error(formatted);
    }

    public static success(message: string, stdout: boolean = false): void {
        const formatted = this.format('SUCCESS', '✅', message, '\x1b[32m');
        this.logOut(formatted, !stdout);
    }

    public static debug(message: string, stdout: boolean = false): void {
        const formatted = this.format('DEBUG', '🔍', message, '\x1b[90m');
        this.logOut(formatted, !stdout);
    }

    private static logOut(message: string, isErr: boolean): void {
        if (isErr) {
            console.error(message);
        } else {
            console.log(message);
        }
    }
}
