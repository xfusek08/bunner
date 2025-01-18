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
    
    public get rows(): string[] {
        return this._cache.cached("rows", () => {
            return this.tokenRows.map((row) => row.join(""));
        });
    }
    
    public get minimalCell(): Cell {
        return this._cache.cached("minimalCell", () => {
            const minimalWidth = this.eachToken().reduce((width, token) => Math.max(width, token.width), 0);
            return Cell.create(this.content, minimalWidth);
        });
    }
    
    public get tokenRows(): Token[][] {
        return this._cache.cached("tokenRows", () => {
            return Cell.stringToTokenRows(this.content, this.width);
        });
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
                if (currentRowWidth + token.width < width) {
                    currentRow.push(token);
                    currentRowWidth += token.width;
                    continue;
                }
                
                // --- Wrap ---
                
                if (!token.isSingleSpace) {
                    currentRealRow.unshift(token); // omit trailing one-space token it is replaced by implied new line symbol
                }
                
                realRows.unshift(currentRealRow); // palce back the rest of the row
                break;
            }
            
            result.push(currentRow);
        }
        
        return result;
    }
}
