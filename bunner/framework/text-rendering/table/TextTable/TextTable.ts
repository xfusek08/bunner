import clamp from '../../../utils/clamp';
import Cell from '../Cell';

/**
 * TODO: For now a placeholder implementation without any alignment or padding.
 */
export default class TextTable {
    private cells: Cell[][] = [];
    private columnWidths: number[] = [];

    public pushRow(row: string[]) {
        const cellRow: Cell[] = [];
        for (let i = 0; i < row.length; i++) {
            const oldWidth = this.getColumnWidth(i);
            const cell = Cell.create({
                col: i,
                row: this.cells.length,
                content: row[i].trim(),
            });
            const cellCalculatedWidth = cell.width;
            if (cellCalculatedWidth > oldWidth) {
                this.setColumnWidth(i, cellCalculatedWidth);
                cellRow.push(cell);
            } else {
                cellRow.push(cell.withWidth(oldWidth));
            }
        }
        this.cells.push(cellRow);
    }

    public render(width: number, putLine: (line: string) => void) {
        if (isNaN(width) || width <= 0) {
            throw new Error(`Invalid width: ${width}`);
        }

        for (const row of this.cells) {
            if (row.length === 0) {
                putLine('');
                continue;
            }

            if (row.length === 1) {
                this.renderCells(row, putLine);
                continue;
            }

            // * Fitting have to be done per row not for table as a whole because each r
            //   ow might have different number of columns.
            // * Cells are copied because the function manipulates them
            const cellRow = this.fitCellsToWidth([...row], width);

            this.renderCells(cellRow, putLine);
        }
    }

    private renderCells(cells: Cell[], putLine: (line: string) => void) {
        const lines = cells.reduce(
            (acc, cell) => Math.max(acc, cell.rowCount),
            0,
        );

        for (let i = 0; i < lines; i++) {
            const line = cells.map((cell) => cell.getRow(i)).join(' ');
            putLine(line.replace(/ +$/, '')); // remove trailing spaces
        }
    }

    private fitCellsToWidth(cells: Cell[], width: number): Cell[] {
        const totalMAximalWidth = this.calculateTotalRowWidth(cells);
        const lastCell = cells[cells.length - 1];
        const widthWithoutLastCell = totalMAximalWidth - lastCell.width;

        if (totalMAximalWidth <= width) {
            cells[cells.length - 1] = lastCell.withWidth(
                width - widthWithoutLastCell,
            );
            return cells;
        }

        // Compute and check if we are able to fit cells at all

        const minCells = cells.map((c) => c.withWidth(c.minimalWidth));
        const minTotalWidth = this.calculateTotalRowWidth(minCells);
        if (minTotalWidth > width) {
            console.error(`Unable to fit cells into width: ${width}`);
            return minCells; // TODO: maybe flag different style of rendering (bullet points)
        }

        // Compute if we can wrap only the last cell
        const spaceForLastCell = width - widthWithoutLastCell;
        if (
            widthWithoutLastCell < width &&
            spaceForLastCell >= minCells[minCells.length - 1].width
        ) {
            cells[cells.length - 1] =
                cells[cells.length - 1].withWidth(spaceForLastCell);
            return cells;
        }

        let overflowWidth = totalMAximalWidth - width;
        const MAX_REDUCTION_FACTOR = 0.3;

        while (true) {
            const cellStatsOrderedBySize = this.computeCellStats(
                cells,
                minCells,
            );
            const {
                index: largestCellIndex,
                toAverageReductionFactor,
                toMinReductionFactor,
            } = cellStatsOrderedBySize[0];
            const largestCell = cells[largestCellIndex];
            const reductionFactor = clamp(
                toAverageReductionFactor,
                toMinReductionFactor,
                MAX_REDUCTION_FACTOR,
            );
            cells[largestCellIndex] = largestCell.withWidth(
                largestCell.width * reductionFactor,
            );
            const widthDelta =
                largestCell.width - cells[largestCellIndex].width;
            if (widthDelta >= overflowWidth) {
                return cells;
            }
            overflowWidth -= widthDelta;
        }
    }

    private calculateTotalRowWidth(row: Cell[]): number {
        // count in the 1 space between the columns
        return row.reduce((acc, cell) => acc + cell.width + 1, -1);
    }

    private computeCellStats(cells: Cell[], minCells: Cell[]) {
        type CellStat = {
            index: number;
            toAverageReductionFactor: number;
            toMinReductionFactor: number;
        };

        const averageSize =
            cells.reduce((acc, cell) => acc + cell.width, 0) / cells.length;

        return cells
            .map(
                (_, i): CellStat => ({
                    index: i,
                    toAverageReductionFactor: averageSize / cells[i].width,
                    toMinReductionFactor: minCells[i].width / cells[i].width,
                }),
            )
            .sort(
                (a, b) =>
                    a.toAverageReductionFactor - b.toAverageReductionFactor,
            );
    }

    public getColumnWidth(columnIndex: number): number {
        return this.columnWidths[columnIndex] ?? 0;
    }

    public setColumnWidth(columnIndex: number, width: number) {
        // ensure there is enough space for all columns
        while (this.columnWidths.length <= columnIndex) {
            this.columnWidths.push(0);
        }

        this.columnWidths[columnIndex] = width;

        // iterate over all rows and update the width on the column
        for (const cellRow of this.cells) {
            if (columnIndex < cellRow.length) {
                cellRow[columnIndex] = cellRow[columnIndex].withWidth(width);
            }
        }
    }
}
