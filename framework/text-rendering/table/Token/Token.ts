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

    public get startsWithSpace(): boolean {
        return this.content[0] === ' ';
    }

    public get isWhite(): boolean {
        return this.content.trim() === '';
    }

    public static tokenize(text: string): Token[] {
        return text
            .split(/(\s+)/g)
            .filter((s) => s.length > 0)
            .map(Token.create);
    }

    public toString(): string {
        return this.content;
    }

    public withPrefix(prefix: string): Token {
        return Token.create(prefix + this.content);
    }

    public ensureSpacePrefix(): Token {
        return this.startsWithSpace ? this : this.withPrefix(' ');
    }
}
