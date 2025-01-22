const ANSI_ESCAPE_PATTERN = /\u001b\[\d+m|\u001b\[0m/g;

export function visualLength(str: string): number {
    return str.replace(ANSI_ESCAPE_PATTERN, '').length;
}
