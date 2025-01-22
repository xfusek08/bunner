import Cache from "../../../utils/Cache";
import Token from "../Token/Token";

export default class Cell {
    private _cache: Cache = Cache.create();
    
    private constructor(
        public readonly content: string,
        public readonly width: number,
    ) {}
    
    public static create(content: string, width: number): Cell {
        return new Cell(content, width);
    }
    
    public withWidth(width: number): Cell {
        return Cell.create(this.content, width);
    }
    
    public getRow(index: number, pad: boolean = true): string {
        return this._cache.cached(`rows-${index}`, () => {
            const tokens = this.tokenRows[index];
            
            if (!tokens) {
                return " ".repeat(this.width);
            }
            
            return tokens
                .map((token) => token.content)
                .join("")
                .padEnd(this.width, " ");
        });
    }
    
    public get rowCount(): number {
        return this.tokenRows.length;
    }
    
    public get minimalCell(): Cell {
        return this._cache.cached("minimalCell", () => {
            const minimalWidth = this.eachToken().reduce((width, token) => Math.max(width, token.width), 0);
            return Cell.create(this.content, minimalWidth);
        });
    }
    
    public get tokenRows(): Token[][] {
        return this._cache.cached("tokenRows", () => Cell.stringToTokenRows(this.content, this.width));
    }
    
    public eachToken(): Token[] {
        return this.tokenRows.flatMap((row) => row);
    }
    
    private static stringToTokenRows(content: string, width: number): Token[][] {
        const realStringRows = content.split("\n");
        const realRows = realStringRows.map(Token.tokenize);
        
        const result: Token[][] = [];
        let currentRealRow: Token[]|undefined;
        while(currentRealRow = realRows.shift()) {
            
            let currentRow: Token[] = [];
            let currentRowWidth = 0;
            let token: Token|undefined;
            
            while(token = currentRealRow.shift()) {
                if (currentRowWidth + token.width <= width) {
                    currentRow.push(token);
                    currentRowWidth += token.width;
                    continue;
                }
                
                // --- Wrap ---
                
                if (!token.isSingleSpace) {
                    currentRealRow.unshift(token); // place overflowing token to the next row, if it is not a space
                }
                
                realRows.unshift(currentRealRow); // palce back the rest of the row
                break;
            }
            
            result.push(currentRow);
        }
        
        return result;
    }
}
