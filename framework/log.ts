export default class log {
    private static timestamp(): string {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}. ${month}. ${year} ${hours}:${minutes}:${seconds}`;
    }

    private static format(level: string, message: string, color: string): string {
        const paddedLevel = level.padEnd(7, ' ');
        return `${color}${this.timestamp()} | ${paddedLevel} | ${message}\x1b[0m`;
    }

    public static info(message: string, stdout: boolean = false, ...rest: unknown[]): void {
        const formatted = this.format('INFO', message, '\x1b[36m');
        this.logOut(formatted, !stdout, ...rest);
    }

    public static warn(message: string, stdout: boolean = false, ...rest: unknown[]): void {
        const formatted = this.format('WARN', message, '\x1b[33m');
        this.logOut(formatted, !stdout, ...rest);
    }

    public static error(message: string, stdout: boolean = false, ...rest: unknown[]): void {
        const formatted = this.format('ERROR', message, '\x1b[31m');
        this.logOut(formatted, !stdout, ...rest);
    }

    public static success(message: string, stdout: boolean = false, ...rest: unknown[]): void {
        const formatted = this.format('SUCCESS', message, '\x1b[32m');
        this.logOut(formatted, !stdout, ...rest);
    }

    public static debug(message: string, stdout: boolean = false, ...rest: unknown[]): void {
        const formatted = this.format('DEBUG', message, '\x1b[90m');
        this.logOut(formatted, !stdout, ...rest);
    }

    private static logOut(message: string, isErr: boolean, ...rest: unknown[]): void {
        if (isErr) {
            console.error(message, ...rest);
        } else {
            console.log(message, ...rest);
        }
    }
}
