import { describe, expect, it } from 'bun:test';

import Token from './Token';

describe('Token', () => {
    describe('tokenize', () => {
        it('should keep spaces as separate tokens', () => {
            const tokens = Token.tokenize('hello world');
            expect(tokens.map((t) => t.content)).toEqual([
                'hello',
                ' ',
                'world',
            ]);
        });

        it('should handle multiple spaces', () => {
            const tokens = Token.tokenize('hello  world');
            expect(tokens.map((t) => t.content)).toEqual([
                'hello',
                '  ',
                'world',
            ]);
        });

        it('should handle leading spaces', () => {
            const tokens = Token.tokenize(' hello');
            expect(tokens.map((t) => t.content)).toEqual([' ', 'hello']);
        });

        it('should handle trailing spaces', () => {
            const tokens = Token.tokenize('hello ');
            expect(tokens.map((t) => t.content)).toEqual(['hello', ' ']);
        });

        it('should handle multiple consecutive spaces correctly', () => {
            const tokens = Token.tokenize('  hello   world  ');
            expect(tokens.map((t) => t.content)).toEqual([
                '  ',
                'hello',
                '   ',
                'world',
                '  ',
            ]);
        });

        it('should handle mixed spaces and words', () => {
            const tokens = Token.tokenize(' hello world ');
            expect(tokens.map((t) => t.content)).toEqual([
                ' ',
                'hello',
                ' ',
                'world',
                ' ',
            ]);
        });
    });
});
