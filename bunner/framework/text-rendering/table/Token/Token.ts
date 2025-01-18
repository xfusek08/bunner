export default class Token {
    private constructor(
        public readonly content: string,
        public readonly width: number,
        public readonly isSingleSpace: boolean,
    ) {}
    
    /**
     *                                ' '
     *                                [A]
     *                              +-----+
     *                              |     |
     *                              v     |
     *     +----------+   ' '    +-----------+
     *     | initial  | -------> |   space   |<--+
     *     +----------+          +-----------+   |
     *           |                     |         |
     *           |                     |         |
     *   not ' ' |             not ' ' |         |
     *   [A]     |           [P space] |         | ' '
     *           |                 [A] |         |
     *           |                     |         |
     *           v                     v         |
     *           |               +-----------+   |
     *           +-------------> |   word    |---+
     *                           +-----------+
     *                              |    ^
     *                              |    |
     *                              +----+
     *                              not ' '
     *                              [A]
     *
     * Legend:
     *   [A] = currentWord += char
     *   [P space] = push space Token
     *   [P word] = push word Token
     */
    public static tokenize(content: string): Token[] {
        const res: Token[] = [];
        
        let state: 'space' | 'word' | 'initial' = 'initial';
        let currentWord = '';
        
        for (let char of content) {
            switch (state) {
                case 'initial':
                    if (char === ' ') {
                        state = 'space';
                    } else {
                        state = 'word';
                    }
                    currentWord += char;
                    break;
                case 'space':
                    if (char === ' ') {
                        currentWord += char;
                        state = 'space';
                    } else {
                        res.push(new Token(currentWord, currentWord.length, true));
                        currentWord = char;
                        state = 'word';
                    }
                    break;
                case 'word':
                    if (char === ' ') {
                        res.push(new Token(currentWord, currentWord.length, false));
                        currentWord = char;
                        state = 'space';
                    } else {
                        currentWord += char;
                        state = 'word';
                    }
                    break;
            }
        }
        
        if (currentWord) {
            res.push(new Token(currentWord, currentWord.length, state === 'space'));
        }
        
        return res;
    }
    
    public toString(): string {
        return this.content;
    }
}
