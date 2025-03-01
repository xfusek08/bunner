// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_PATTERN = /\u001b\[(?:\d+;?)+m|\u001b\[0m/g;

export function visualLength(str: string): number {
    return str.replace(ANSI_ESCAPE_PATTERN, '').length;
}

export function padEndVisual(
    str: string,
    desiredWidth: number,
    fillString: string = ' ',
): string {
    const length = visualLength(str);
    if (length < desiredWidth) {
        return str + fillString.repeat(desiredWidth - length);
    }
    return str;
}

export function stripColors(str: string): string {
    return str.replaceAll(ANSI_ESCAPE_PATTERN, '');
}
