import { describe, expect, test } from 'bun:test';

import { visualLength } from './string';

describe('string', () => {
    describe('visualLength', () => {
        test('plain strings without ANSI codes', () => {
            expect(visualLength('hello')).toBe(5);
            expect(visualLength('')).toBe(0);
            expect(visualLength('   ')).toBe(3);
            expect(visualLength('hello world')).toBe(11);
        });

        test('strings with ANSI color codes', () => {
            expect(visualLength('\x1b[31mred\x1b[0m')).toBe(3);
            expect(visualLength('\x1b[32mgreen text\x1b[0m')).toBe(10);
            expect(visualLength('\x1b[1m\x1b[31mbold red\x1b[0m')).toBe(8);
        });

        test('mixed content strings', () => {
            expect(visualLength('normal \x1b[31mred\x1b[0m normal')).toBe(17);
            expect(visualLength('\x1b[31mred\x1b[0m\x1b[32mgreen\x1b[0m')).toBe(8);
            expect(visualLength('start\x1b[31m red middle\x1b[0m end')).toBe(20);
        });
        test('multiple ANSI codes in sequence', () => {
            expect(visualLength('\x1b[1m\x1b[31m\x1b[42mcomplex\x1b[0m')).toBe(7);
            expect(visualLength('\x1b[31m\x1b[31m\x1b[31mtest\x1b[0m')).toBe(4);
        });
    });
});
