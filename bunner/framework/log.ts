
export default class log {
    
    private static timestamp(): string {
        return new Date().toISOString();
    }

    private static format(level: string, emoji: string, message: string, color: string): string {
        return `${color}${emoji} [${level}] ${this.timestamp()}: ${message}\x1b[0m`;
    }

    public static info(message: string, stdout: boolean = false): void {
        const formatted = this.format('INFO', '💡', message, '\x1b[36m');
        stdout ? console.log(formatted) : console.error(formatted);
    }

    public static warn(message: string, stdout: boolean = false): void {
        const formatted = this.format('WARN', '⚠️', message, '\x1b[33m');
        stdout ? console.log(formatted) : console.error(formatted);
    }

    public static error(message: string): void {
        const formatted = this.format('ERROR', '❌', message, '\x1b[31m');
        console.error(formatted);
    }

    public static success(message: string, stdout: boolean = false): void {
        const formatted = this.format('SUCCESS', '✅', message, '\x1b[32m');
        stdout ? console.log(formatted) : console.error(formatted);
    }

    public static debug(message: string, stdout: boolean = false): void {
        const formatted = this.format('DEBUG', '🔍', message, '\x1b[90m');
        stdout ? console.log(formatted) : console.error(formatted);
    }
}
