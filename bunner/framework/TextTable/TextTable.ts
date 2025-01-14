
/**
 * TODO: For now a placeholder implementation without any alignment or padding.
 */
export default class TextTable {
    private _rows: string[][] = [];
    
    public pushRow(row: string[]) {
        this._rows.push(row);
    }
    
    public render(width: number, putLine: (line: string) => void) {
        for (const row of this._rows) {
            putLine(row.join(" "));
        }
    }
}
