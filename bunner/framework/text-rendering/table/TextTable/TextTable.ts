import Cache from "../../../utils/Cache";
import clamp from "../../../utils/clamp";
import Cell from "../Cell";

/**
 * TODO: For now a placeholder implementation without any alignment or padding.
 */
export default class TextTable {
    private _rows: string[][] = [];
    private _cache: Cache = Cache.create();
    
    public pushRow(row: string[]) {
        this._rows.push(row.map((c, i) => c + (i < row.length -1 ? " " : "")));
        this._cache.invalidate();
    }
    
    public render(width: number, putLine: (line: string) => void) {
        if (isNaN(width) || width <= 0) {
            throw new Error(`Invalid width: ${width}`);
        }
        
        for (const row of this._rows) {
            if (row.length === 0) {
                putLine("");
                continue;
            }
            
            if (row.length === 1) {
                putLine(row[0]);
                continue;
            }
            
            let cells = row.map((content, i) => Cell.create(content, this.columnWidth(i)));
            cells = this.fitCellsToWidth(cells, width);
            this.renderCells(cells, putLine);
            
            const widthWithoutLastCell = cells.slice(0, -1).reduce((acc, cell) => acc + cell.width, 0);
            if (widthWithoutLastCell < width) {
                cells[cells.length - 1] = cells[cells.length - 1].withWidth(width - widthWithoutLastCell);
                continue;
            }
        }
    }
    
    private renderCells(cells: Cell[], putLine: (line: string) => void) {
        const lines = cells.reduce((acc, cell) => Math.max(acc, cell.rowCount), 0);
        for (let i = 0; i < lines; i++) {
            let line = "";
            for (const cell of cells) {
                line += cell.getRow(i);
            }
            putLine(line);
        }
    }
    
    private fitCellsToWidth(cells: Cell[], width: number): Cell[] {
        const totalMAximalWidth = cells.reduce((acc, cell) => acc + cell.width, 0);
        const lastCell = cells[cells.length - 1];
        const widthWithoutLastCell = totalMAximalWidth - lastCell.width;
        
        if (totalMAximalWidth <= width) {
            cells[cells.length - 1] = lastCell.withWidth(width - widthWithoutLastCell);
            return cells;
        }
        
        // Compute and check if we are able to fit cells at all
        
        let minCells = cells.map((cell) => cell.minimalCell);
        let minTotalWidth = minCells.reduce((acc, cell) => acc + cell.width, 0);
        if (minTotalWidth > width) {
            console.error(`Unable to fit cells into width: ${width}`);
            return minCells; // TODO: maybe flat for different style of rendering
        }
        
        // Compute if we can wrap only the last cell
        const spaceForLastCell = width - widthWithoutLastCell;
        if (widthWithoutLastCell < width && spaceForLastCell >= minCells[minCells.length - 1].width) {
            cells[cells.length - 1] = minCells[minCells.length - 1].withWidth(spaceForLastCell);
            return cells;
        }
        
        let overflowWidth = totalMAximalWidth - width;
        const MAX_REDUCTION_FACTOR = 0.3;
        
        while(true) {
            const cellStatsOrderedBySize = this.computeCellStats(cells, minCells, width);
            const {
                index: largestCellIndex,
                toAverageReductionFactor,
                toMinReductionFactor,
            } = cellStatsOrderedBySize[0];
            const largestCell = cells[largestCellIndex];
            const reductionFactor = clamp(toAverageReductionFactor, toMinReductionFactor, MAX_REDUCTION_FACTOR);
            cells[largestCellIndex] = largestCell.withWidth(largestCell.width * reductionFactor);
            const widthDelta = largestCell.width - cells[largestCellIndex].width;
            if (widthDelta >= overflowWidth) {
                return cells;
            }
            overflowWidth -= widthDelta;
        }
    }
    
    private computeCellStats(cells: Cell[], minCells: Cell[], width: number) {
        type CellStat = {
            index: number,
            toAverageReductionFactor: number,
            toMinReductionFactor: number,
        };
        
        const averageSize = cells.reduce((acc, cell) => acc + cell.width, 0) / cells.length;
        
        /*
            x * cell.width = averageSize
            x = averageSize / cell.width
        */
        return cells.map((_, i): CellStat => ({
            index: i,
            toAverageReductionFactor: averageSize / cells[i].width,
            toMinReductionFactor: minCells[i].width / cells[i].width,
        })).sort((a, b) => a.toAverageReductionFactor - b.toAverageReductionFactor);
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
        return this.columnWidths()[columnIndex];
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
            for (let columnIndex = 0; columnIndex < this.columnCount(); columnIndex++) {
                let width = 0;
                for (const row of this._rows) {
                    width = Math.max(width, row[columnIndex].length);
                }
                widths.push(width);
            }
            return widths;
        });
    }
}
