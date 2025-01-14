
const DEFAULT_TERMINAL_WIDTH = 80;

export default function getTerminalWidth() {
    const n = process.env.COLUMNS ?? "";
    const res = parseInt(n);
    if (isNaN(res)) {
        return DEFAULT_TERMINAL_WIDTH;
    } else {
        return res;
    }
}
