import Cache from "../../../utils/Cache";

/**
 * TODO: For now a placeholder implementation without any alignment or padding.
 */
export default class TextTable {
    private _rows: string[][] = [];
    private _cache: Cache = Cache.create();
    
    public pushRow(row: string[]) {
        this._rows.push(row);
    }
    
    public render(width: number, putLine: (line: string) => void) {
        for (const row of this._rows) {
            putLine(row.join(" "));
        }
    }
    
    public *iterateColumn(columnIndex: number): IterableIterator<string> {
        for (const row of this._rows) {
            yield row[columnIndex];
        }
    }
    
    public *iterateRow(rowIndex: number): IterableIterator<string> {
        for (const cell of this._rows[rowIndex]) {
            yield cell;
        }
    }
    
    public columnWidth(columnIndex: number): number {
        return this._cache.cached(`columnWidth(${columnIndex})`, () => {
            let width = 0;
            for (const row of this._rows) {
                width = Math.max(width, row[columnIndex].length);
            }
            return width;
        });
    }
    
    public columnCount(): number {
        return this._cache.cached(`columnCount()`, () => {
            let count = 0;
            for (const row of this._rows) {
                count = Math.max(count, row.length);
            }
            return count;
        });
    }
    
    public rowCount(): number {
        return this._rows.length;
    }
    
    public columnWidths(): number[] {
        return this._cache.cached(`columnWidths()`, () => {
            const widths: number[] = [];
            for (let i = 0; i < this.columnCount(); i++) {
                widths.push(this.columnWidth(i));
            }
            return widths;
        });
    }
}
