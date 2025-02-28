import Cache from '../../../utils/Cache';
import { visualLength } from '../../../utils/string';
import Token from '../Token/Token';

export default class Cell {
    private _cache: Cache = Cache.create();

    private constructor(
        public readonly content: string,
        private readonly desiredWidth: number | null,
    ) {}

    public static create(content: string, width?: number): Cell {
        return new Cell(content, width ?? null);
    }

    public withWidth(width: number): Cell {
        return Cell.create(this.content, width);
    }

    public getRow(index: number): string {
        return this._cache.cached(`rows-${index}`, () => {
            const tokens = this.tokenRows[index];

            if (!tokens) {
                return ' '.repeat(this.width);
            }

            return tokens
                .map((token) => token.content)
                .join('')
                .padEnd(this.width, ' ');
        });
    }

    public get width(): number {
        if (this.desiredWidth === null) {
            return this.widthOfContent;
        }
        return Math.max(this.desiredWidth, this.minimalWidth);
    }

    public get widthOfContent(): number {
        return this._cache.cached('widthOfContent', () =>
            visualLength(this.content),
        );
    }

    public get minimalWidth(): number {
        return this._cache.cached('minimalWidth', () => {
            return this.eachToken.reduce(
                (width, token) => Math.max(width, token.width),
                0,
            );
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
        return this._cache.cached('eachToken', () =>
            this.tokenRows.flatMap((row) => row),
        );
    }

    private static stringToTokenRows(
        content: string,
        width: number,
    ): Token[][] {
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
