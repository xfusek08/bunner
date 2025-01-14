function stripAnsi(str: string): string {
    return str.replace(/\x1B\[\d+(?:;\d+)*m/g, '');
}

class Cell {
    private value: string = "";
    private rows: string[] = [];
    private w: number = 0;
    private minWidth: number = 0;
    
    constructor(
        public readonly X: number,
        public readonly Y: number,
        value: string = "",
    ) {
        this.value = value;
        this.w = this.getMaxWidth();
        this.recalculateRows();
    }
    
    public getValue(): string {
        return this.value;
    }
    
    public getRows(): readonly string[] {
        return this.rows;
    }
    
    public setValue(value: string) {
        if (this.value !== value) {
            this.value = value;
            this.recalculateRows();
        }
    }
    
    public getHeight(): number {
        return this.rows.length;
    }
    
    public getWidth(): number {
        return this.w;
    }
    
    public getMaxWidth(): number {
        return stripAnsi(this.value).length;
    }
    
    public setWidth(value: number) {
        if (this.w !== value) {
            this.w = value;
            this.recalculateRows();
        }
    }
    
    private recalculateRows() {
        this.rows = [];
        const words = this.value.split(" ");
        this.minWidth = words.reduce((acc, word) => Math.max(acc, stripAnsi(word).length), 0);
        this.w = Math.max(this.w, this.minWidth);
        
        let currentRow: string[] = [];
        let currentLength = 0;
        
        for (const word of words) {
            const wordLength = stripAnsi(word).length;
            if (currentLength + wordLength + (currentLength > 0 ? 1 : 0) > this.w) {
                this.rows.push(currentRow.join(" "));
                currentRow = [word];
                currentLength = wordLength;
            } else {
                if (currentLength > 0) {
                    currentLength += 1; // space
                }
                currentRow.push(word);
                currentLength += wordLength;
            }
        }
        if (currentRow.length > 0) {
            this.rows.push(currentRow.join(" "));
        }
        
        // Pad all rows to match width
        this.rows = this.rows.map(row => {
            const visibleLength = stripAnsi(row).length;
            return row + " ".repeat(this.w - visibleLength);
        });
    }
}

class Table {
    private readonly COLUMN_SPACING = 1; // Reduced spacing to just 1
    private columnWidths: number[] = [];
    private cells: Cell[][] = [];
    
    public get columnCount(): number {
        return this.columnWidths.length;
    }
    
    public addRow(columns: string[]) {
        const x = this.cells.length;
        const length = Math.max(this.columnCount, columns.length);
        this.cells.push(Array.from({ length }).map((_, y) => {
            let value = "";
            if (y < columns.length) {
                value = columns[y];
            }
            const c = new Cell(x, y, value);
            return c;
        }));
    }
    
    private recalculateCells(availableWidth: number) {
        const maxRowLength = this.cells.reduce((acc, row) => Math.max(acc, row.length), 0);
        
        // Ensure rows have proper number of cells
        for (const row of this.cells) {
            while (row.length < maxRowLength) {
                row.push(new Cell(row.length, row.length));
            }
        }
        
        // Compute max width for each column without leftover logic
        this.columnWidths = Array.from({ length: maxRowLength }).map(() => 0);
        for (let y = 0; y < maxRowLength; y++) {
            for (let x = 0; x < this.cells.length; x++) {
                const cell = this.cells[x][y];
                this.columnWidths[y] = Math.max(this.columnWidths[y], cell.getMaxWidth());
            }
        }
        
        // Update all cells
        for (const row of this.cells) {
            for (const cell of row) {
                cell.setWidth(this.columnWidths[cell.Y]);
            }
        }
    }
    
    public render(availableWidth: number, putLine: (line: string) => void) {
        this.recalculateCells(availableWidth);
        
        for (const row of this.cells) {
            const rowHeight = row.reduce((acc, cell) => Math.max(acc, cell.getHeight()), 0);
            
            for (let rowY = 0; rowY < rowHeight; rowY++) {
                const parts = row.map((cell, columnIndex) => {
                    const rows = cell.getRows();
                    const content = rowY < rows.length ? rows[rowY] : " ".repeat(this.columnWidths[columnIndex]);
                    if (columnIndex < row.length - 1) {
                        // Pad all columns except the last one
                        return content.padEnd(this.columnWidths[columnIndex]);
                    }
                    return content;
                });
                
                putLine(parts.join(" ".repeat(this.COLUMN_SPACING)));
            }
        }
    }
}

export default class TextBuilder {
    private _lines: string[] = [];
    private _indent: number = 0;
    private _table: Table|null = null;
    private readonly indentSize: number;
    private availableWidth: number;
    
    private constructor(indentSize: number = 4, availableWidth: number) {
        this.indentSize = indentSize;
        this.availableWidth = availableWidth;
    }
    
    public static async create(indentSize: number = 4) {
        const awaitable = await this.getAvailableWidth();
        return new TextBuilder(indentSize, awaitable);
    }
    
    private static async getAvailableWidth() {
        const n = process.env.COLUMNS ?? "";
        const res = parseInt(n);
        if (isNaN(res)) {
            return 80;
        } else {
            return res;
        }
    }
    
    private async flushTable() {
        if (this._table) {
            // Account for indent in available width
            const effectiveWidth = this.availableWidth - (this._indent * this.indentSize);
            this._table.render(
                effectiveWidth,
                (line) => this._lines.push(" ".repeat(this._indent * this.indentSize) + line)
            );
            this._table = null;
        }
    }
    
    public currentIndentChars(): number {
        return this._indent * this.indentSize;
    }
    
    public line(text?: string) {
        if (this._table) {
            this.flushTable();
            this.line(text);
            return;
        }
        
        if (text === undefined) {
            this._lines.push("");
            return;
        }
        
        text.split("\n").forEach((l) => {
            this._lines.push(" ".repeat(this._indent * this.indentSize) + l);
        });
    };
    
    public row(columns: string[]) {
        if (!this._table) {
            this._table = new Table();
        }
        
        this._table.addRow(columns);
    }
    
    public indent() {
        this.flushTable();
        this._indent++;
        return this._indent;
    }
    
    public unindent() {
        this.flushTable();
        if (this._indent > 0) {
            this._indent--;
        }
        return this._indent;
    }
    
    public render(): string {
        this.flushTable();
        return this._lines.join("\n");
    }
}
