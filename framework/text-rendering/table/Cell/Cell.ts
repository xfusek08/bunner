import Cache from '../../../utils/Cache';
import { padEndVisual, visualLength } from '../../../utils/string';
import Token from '../Token/Token';

interface CellProps {
    col: number;
    row: number;
    content: string;
    width?: number;
}

export default class Cell {
    private _cache: Cache = Cache.create();

    private constructor(
        public readonly content: string,
        public readonly col: number,
        public readonly row: number,
        private readonly desiredWidth: number | null,
    ) {}

    public static create(props: CellProps): Cell {
        return new Cell(props.content, props.col, props.row, props.width ?? null);
    }

    public withWidth(width: number): Cell {
        return Cell.create({
            col: this.col,
            row: this.row,
            content: this.content,
            width: Math.ceil(width),
        });
    }

    public getRow(index: number): string {
        return this._cache.cached(`rows-${index}`, () => {
            const tokens = this.tokenRows[index];

            if (!tokens) {
                return ' '.repeat(this.width);
            }

            let res = tokens.map((token) => token.content).join('');
            res = padEndVisual(res, this.width);
            return res;
        });
    }

    public get width(): number {
        if (this.desiredWidth === null) {
            return this.widthOfContent;
        }
        return Math.max(this.desiredWidth, this.minimalWidth);
    }

    public get widthOfContent(): number {
        return this._cache.cached('widthOfContent', () => visualLength(this.content));
    }

    public get minimalWidth(): number {
        return this._cache.cached('minimalWidth', () => {
            const words = this.content.split(/\s+/);
            if (words.length === 0) {
                return 0;
            }
            return Math.max(...words.map((word) => visualLength(word)));
        });
    }

    public get rowCount(): number {
        return this.tokenRows.length;
    }

    public get tokenRows(): Token[][] {
        return this._cache.cached('tokenRows', () =>
            Cell.stringToTokenRows(this.content, this.width),
        );
    }

    public get eachToken(): Token[] {
        return this._cache.cached('eachToken', () => this.tokenRows.flatMap((row) => row));
    }

    private static stringToTokenRows(content: string, width: number): Token[][] {
        const realStringRows = content.split('\n');
        const realRows = realStringRows.map(Token.tokenize);

        const result: Token[][] = [];
        let currentRealRow: Token[] | undefined;
        while ((currentRealRow = realRows.shift())) {
            const currentRow: Token[] = [];
            let currentRowWidth = 0;
            let token: Token | undefined;

            while ((token = currentRealRow.shift())) {
                if (currentRowWidth + token.width <= width) {
                    currentRow.push(token);
                    currentRowWidth += token.width;
                    continue;
                }

                // --- Wrap ---

                // when token that overflows was not a single space return the current token to head of the queue to be processed in the next row
                if (!token.isSingleSpace) {
                    currentRealRow.unshift(token);
                }

                // palce back the rest of the row to be processed in the next row
                realRows.unshift(currentRealRow);
                break;
            }
            result.push(currentRow);
        }

        return result;
    }
}
