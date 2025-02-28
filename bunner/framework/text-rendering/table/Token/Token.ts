import { visualLength } from '../../../utils/string';

export default class Token {
    private constructor(
        public readonly content: string,
        public readonly width: number,
    ) {}

    public static create(content: string): Token {
        return new Token(content, visualLength(content));
    }

    public get isSingleSpace(): boolean {
        return this.width === 1 && this.content.trim() === '';
    }

    public get isWhite(): boolean {
        return this.content.trim() === '';
    }

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
    public static tokenize(text: string): Token[] {
        return text
            .split(/(\s+)/g)
            .filter((s) => s.length > 0)
            .map(Token.create);
    }

    public toString(): string {
        return this.content;
    }
}
