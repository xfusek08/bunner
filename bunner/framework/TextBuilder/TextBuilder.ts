import TextTable from "../TextTable";
import getTerminalWidth from "../utils/getTerminalWidth";

export default class TextBuilder {
    private _mode: 'line' | TextTable = 'line';
    private _lines: string[] = [];
    private _indentLevel: number = 0;
    private _indentSize: number;
    private _terminalWidth: number;
    
    public get mode() { return this._mode; }
    public get indentLevel() { return this._indentLevel; }
    public get indentSize() { return this._indentSize; }
    public get indentChart() { return this._indentSize * this._indentLevel; }
    public get availableWidth() { return this._terminalWidth - this.indentChart; }
    
    constructor(indentSize: number = 4) {
        this._indentSize = indentSize;
        this._terminalWidth = getTerminalWidth();
    }
    
    public line(text?: string) {
        this.endTable();
        this._lines.push(" ".repeat(this.indentChart) + (text ?? ""));
    }
    
    public aligned(row: string[]) {
        this.asTable().pushRow(row);
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
