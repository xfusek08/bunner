import TextTable from '../table/TextTable';

export default class TextBuilder {
    private _mode: 'line' | TextTable = 'line';
    private _lines: string[] = [];
    private _indentLevel: number = 0;
    private _indentSize: number;
    private _terminalWidth: number;

    public get mode() {
        return this._mode;
    }
    public get indentLevel() {
        return this._indentLevel;
    }
    public get indentSize() {
        return this._indentSize;
    }
    public get indentChart() {
        return this._indentSize * this._indentLevel;
    }
    public get availableWidth() {
        return this._terminalWidth - this.indentChart;
    }

    constructor({
        indentSize = 4,
        width = process.stdout.columns,
    }: {
        indentSize?: number;
        width?: number;
    } = {}) {
        this._indentSize = indentSize;
        this._terminalWidth = width ?? process.stdout.columns;
        if (isNaN(this._terminalWidth)) {
            this._terminalWidth = 80;
        }
    }

    public line(text?: string) {
        this.endTable();
        this._lines.push(' '.repeat(this.indentChart) + (text ?? ''));
    }

    public aligned(row: string[]) {
        this.asTable().pushRow(row);
    }

    public separator(variant: 'single' | 'double' = 'single') {
        this.endTable();
        const char = variant === 'single' ? '-' : '=';
        this._lines.push(char.repeat(this.availableWidth));
    }

    public indent() {
        this.endTable();
        this._indentLevel++;
    }

    public unindent() {
        this.endTable();
        this._indentLevel = Math.max(0, this._indentLevel - 1);
    }

    public render() {
        this.endTable();
        return this._lines.join('\n');
    }

    private asTable(): TextTable {
        if (this._mode === 'line') {
            this._mode = new TextTable();
        }
        return this._mode;
    }

    private endTable() {
        if (this._mode === 'line') {
            return;
        }

        const table = this._mode;
        this._mode = 'line';

        table.render(this.availableWidth, (line) => this.line(line));
    }
}
