import { describe, expect, test } from 'bun:test';

import parseArguments from '../framework/parseArguments';
import { OptionDefinition } from '../framework/types/OptionDefinition';
import ScriptArguments from '../framework/types/ScriptArguments';

function prepareDefaultArguments(): ScriptArguments {
    return ScriptArguments.initFromProcessArgv().clear();
}

describe('Argument Parsing', () => {
    describe('Only Positional Arguments Tests', () => {
        test('Empty Arguments', () => {
            expect(
                parseArguments({
                    args: prepareDefaultArguments(),
                    definitions: [],
                }),
            ).toEqual({
                options: {},
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Non-option arguments', () => {
            const args = prepareDefaultArguments().replace(['foo', 'bar']);
            expect(
                parseArguments({
                    args,
                    definitions: [],
                }),
            ).toEqual({
                options: {},
                restArgs: args,
            });
        });
    });

    describe('Unknown Option Tests', () => {
        test('Single long option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo']),
                definitions: [],
            });
            expect(res).toBeArray();
            expect(res).toHaveLength(1);
            expect(res).toEqual(['Unknown option: --foo']);
        });

        test('Single short option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [],
            });
            expect(res).toBeArray();
            expect(res).toHaveLength(1);
            expect(res).toEqual(['Unknown option: -f']);
        });

        test('Multiple options', () => {
            const args = prepareDefaultArguments().replace([
                '-f',
                '--foo',
                '--b',
            ]);
            const res = parseArguments({
                args,
                definitions: [],
            });
            expect(res).toBeArray();
            expect(res).toHaveLength(3);
            expect(res).toEqual([
                'Unknown option: -f',
                'Unknown option: --foo',
                'Unknown option: --b',
            ]);
        });

        test('Options and positional arguments', () => {
            const args = prepareDefaultArguments().replace([
                'foo',
                '-f',
                '--foo',
                'bar',
                '--b',
            ]);
            const res = parseArguments({
                args,
                definitions: [],
            });
            expect(res).toBeArray();
            expect(res).toHaveLength(3);
            expect(res).toEqual([
                'Unknown option: -f',
                'Unknown option: --foo',
                'Unknown option: --b',
            ]);
        });

        test('Positional arguments and single option', () => {
            const args = prepareDefaultArguments().replace([
                'foo',
                'bar',
                '--foo',
            ]);
            const res = parseArguments({
                args,
                definitions: [],
            });
            expect(res).toBeArray();
            expect(res).toHaveLength(1);
            expect(res).toEqual(['Unknown option: --foo']);
        });
    });

    describe('Bool Flag Option Tests', () => {
        test('Single optional boolean option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Boolean option set to true by short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Boolean option with only short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Boolean option with short name set to true', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required boolean option with only short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required boolean option set to true by short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required boolean option set by long name prefix', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--f']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual(['Unknown option: --f']);
        });

        test('Required boolean option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required boolean option set to true by short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required boolean option set to true by long name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });
    });

    describe('Additional Bool Flag Option Tests', () => {
        test('Boolean option set to true by both short and long names', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', '--foo']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Boolean option set to true by both short and long names with positional arguments', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    'foo',
                    '--foo',
                    'bar',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments().replace(['foo', 'bar']),
            });
        });

        test('Boolean option with only positional arguments', () => {
            const args = prepareDefaultArguments().replace(['foo', 'bar']);
            const res = parseArguments({
                args,
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: false,
                },
                restArgs: args,
            });
        });

        test('Boolean option set to true with positional arguments', () => {
            const args = prepareDefaultArguments().replace([
                'foo',
                '-f',
                'bar',
            ]);
            const res = parseArguments({
                args,
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: true,
                },
                restArgs: prepareDefaultArguments().replace(['foo', 'bar']),
            });
        });

        test('One valid and one invalid option', () => {
            const args = prepareDefaultArguments().replace(['-f', '--foo']);
            const res = parseArguments({
                args,
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual(['Unknown option: --foo']);
        });

        test('Multiple different boolean options', () => {
            const definitions: OptionDefinition[] = [
                {
                    short: 'f',
                    description: 'foo',
                    type: 'boolean',
                },
                {
                    short: 'F',
                    long: 'foo',
                    description: 'foo',
                    type: 'boolean',
                },
                {
                    short: 'b',
                    description: 'bar',
                    type: 'boolean',
                },
                {
                    long: 'bar',
                    description: 'bar',
                    type: 'boolean',
                },
            ];

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments(),
                }),
            ).toEqual({
                options: {
                    f: false,
                    foo: false,
                    b: false,
                    bar: false,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace([
                        '-f',
                        '--foo',
                        '-b',
                        '--bar',
                    ]),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: true,
                    b: true,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace([
                        '-f',
                        '-b',
                        '--bar',
                    ]),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: false,
                    b: true,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace([
                        '-f',
                        '-F',
                        '-b',
                        '--bar',
                    ]),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: true,
                    b: true,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace(['-fF', '--bar']),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: true,
                    b: false,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace(['--foo', '--bar']),
                }),
            ).toEqual({
                options: {
                    f: false,
                    foo: true,
                    b: false,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace(['-f', '--bar']),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: false,
                    b: false,
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    definitions,
                    args: prepareDefaultArguments().replace([
                        'foo',
                        '-f',
                        '--foo',
                        'bar',
                        '-b',
                        '--bar',
                    ]),
                }),
            ).toEqual({
                options: {
                    f: true,
                    foo: true,
                    b: true,
                    bar: true,
                },
                restArgs: prepareDefaultArguments().replace(['foo', 'bar']),
            });
        });
    });

    describe('Condensed Bool Flag Option Tests', () => {
        test('Two condensed boolean options', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-fb']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                    {
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: true,
                    b: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Two condensed boolean options with one undefined', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                    {
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: true,
                    b: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Two condensed required boolean options', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-fb']),
                definitions: [
                    {
                        short: 'f',
                        description: 'foo',
                        type: 'boolean',
                    },
                    {
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    f: true,
                    b: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Boolean option with default true value and capital letters', () => {
            const definitions: OptionDefinition[] = [
                {
                    short: 'F',
                    long: 'foo',
                    description: 'foo',
                    type: 'boolean',
                },
                {
                    short: 'f',
                    description: 'foo',
                    type: 'boolean',
                },
                {
                    short: 'b',
                    description: 'bar',
                    type: 'boolean',
                },
                {
                    short: 'Z',
                    description: 'baz',
                    type: 'boolean',
                },
                {
                    short: 'z',
                    long: 'zoo',
                    description: 'qux',
                    type: 'boolean',
                },
            ];
            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace([
                        'hello',
                        '-FfbZz',
                        'world',
                    ]),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: true,
                    f: true,
                    b: true,
                    Z: true,
                    zoo: true,
                },
                restArgs: prepareDefaultArguments().replace(['hello', 'world']),
            });

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace([
                        'hello',
                        '-Fz',
                        'world',
                        'foo',
                    ]),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: true,
                    zoo: true,
                    f: false,
                    Z: false,
                    b: false,
                },
                restArgs: prepareDefaultArguments().replace([
                    'hello',
                    'world',
                    'foo',
                ]),
            });
        });
    });

    describe('Single String Option Tests', () => {
        test('Single string option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {},
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with long name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with short name without value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option -f must have a value']);
        });

        test('String option with long name without value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option --foo must have a value']);
        });

        test('String option with long name and equal sign', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with short name and equal sign', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f=bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with value that looks like an option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', '--bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: '--bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with value that looks like a known option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', '--foo']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: '--foo',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with value that looks like another known option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', '--bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: '--bar',
                    bar: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with long name and equal sign without value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option --foo must have a value']);
        });

        test('String option with short name and equal sign without value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f=']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option -f must have a value']);
        });

        test('String option with value that looks like another known option with string value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', '--bar=qux']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'string',
                        required: false,
                        defaultValue: 'baz',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: '--bar=qux',
                    bar: 'baz',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with long name and equal sign with empty value followed by another positional argument', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option --foo must have a value']);
        });

        test('String option with long name and equal sign with empty value followed by unknown option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=', '--bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'Option --foo must have a value',
                'Unknown option: --bar',
            ]);
        });

        test('String option with long name and equal sign with empty value followed by unknown option and another positional argument', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo=',
                    '--bar',
                    'baz',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'Option --foo must have a value',
                'Unknown option: --bar',
            ]);
        });

        test('String option with long name and equal sign with empty value followed by known option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=', '--bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual(['Option --foo must have a value']);
        });

        test('String option set by more than one argument', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo',
                    'bar',
                    '-f',
                    'baz',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'Option --foo cannot be set more than once, the current value "bar" would be overwritten by -f with value "baz".',
            ]);
        });

        test('String option set multiple times where one is invalid', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo',
                    'bar',
                    '--foo',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'There was an attempt to set option --foo more than once by option --foo without a value. The current value is "bar".',
            ]);
        });

        test('String option set multiple times where one is invalid nad onw is short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'bar', '-f']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'There was an attempt to set option --foo more than once by option -f without a value. The current value is "bar".',
            ]);
        });
    });

    describe('Optional String Option With Default Values', () => {
        test('String option with default value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with default value and short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', 'baz']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('String option with default value and long name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'baz']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                },
                restArgs: prepareDefaultArguments(),
            });
        });
    });

    describe('Combination Of Multiple Optional String Arguments', () => {
        test('Multiple string options with default values', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Multiple string options with default values and short names', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    'baz',
                    '-b',
                    'qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Multiple string options with default values and long names', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo',
                    'baz',
                    '--baz',
                    'qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Multiple string options with default values and positional arguments', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo',
                    'baz',
                    'qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments().replace(['qux']),
            });
        });

        test('Multiple string options with default values and long names with equal signs', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo=baz',
                    '--baz=qux',
                    'quux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments().replace(['quux']),
            });
        });

        test('Multiple string options with default values and long names with equal signs followed by positional argument', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    'asd',
                    '--foo=baz',
                    'qwe',
                    '-b',
                    'qux',
                    'qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'zxc',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'baz',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments().replace([
                    'asd',
                    'qwe',
                    'qux',
                ]),
            });
        });

        test('Multiple string options with default values and long names with empty values', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=', '--baz=']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual([
                'Option --foo must have a value',
                'Option --baz must have a value',
            ]);
        });

        test('Multiple string options with default values and long names with empty values followed by positional argument', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '--foo=',
                    '--baz=',
                    'qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual([
                'Option --foo must have a value',
                'Option --baz must have a value',
            ]);
        });

        test('Multiple string options with one default value and one specified value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                        defaultValue: 'baz',
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'qux',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                    baz: 'qux',
                },
                restArgs: prepareDefaultArguments(),
            });
        });
    });

    describe('Required String Option Tests', () => {
        test('Required string option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                ],
            });
            expect(res).toEqual(['Option -f --foo is required']);
        });

        test('Required string option with short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required string option with long name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required string option with short name without value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                ],
            });
            expect(res).toEqual([
                'Option -f must have a value',
                'Option -f --foo is required',
            ]);
        });
    });

    describe('Combination of required and optional string options', () => {
        test('Required and optional string option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual(['Option -f --foo is required']);
        });

        test('Required and optional string option with short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Required and optional string option with long name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', 'bar']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: true,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'string',
                        required: false,
                        defaultValue: 'baz',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 'bar',
                    bar: 'baz',
                },
                restArgs: prepareDefaultArguments(),
            });
        });
    });

    describe('Single Number Option Tests', () => {
        test('Single number option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {},
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option with default value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                        defaultValue: 42,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option with short name', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-f', '42']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option with float value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo', '42.5']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42.5,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option with invalid float value', () => {
            const definitions: OptionDefinition[] = [
                {
                    long: 'foo',
                    short: 'f',
                    description: 'foo',
                    type: 'number',
                    required: false,
                },
            ];

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace([
                        '--foo',
                        '42.5.5',
                    ]),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5.5"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo', 'asd']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "asd"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo', '42.5e']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5e"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace([
                        '--foo',
                        '42.5e-',
                    ]),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5e-"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo', '-42']),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: -42,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo', '-42.5']),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: -42.5,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option set by equal sign', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=42']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option set by equal sign with float value', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['--foo=42.5']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42.5,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Number option set by equal sign with invalid float value', () => {
            const definitions: OptionDefinition[] = [
                {
                    long: 'foo',
                    short: 'f',
                    description: 'foo',
                    type: 'number',
                    required: false,
                },
            ];

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=42.5.5']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5.5"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=asd']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "asd"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=42.5e']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5e"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=42.5e-']),
                    definitions,
                }),
            ).toEqual([
                'Option --foo must be a valid number representation. Received: "42.5e-"',
            ]);

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=-42']),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: -42,
                },
                restArgs: prepareDefaultArguments(),
            });

            expect(
                parseArguments({
                    args: prepareDefaultArguments().replace(['--foo=-42.5']),
                    definitions,
                }),
            ).toEqual({
                options: {
                    foo: -42.5,
                },
                restArgs: prepareDefaultArguments(),
            });
        });
    });

    describe('Final Combination Of All', () => {
        test('Multiple options with different types and requirements', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    '42',
                    '-b',
                    'baz',
                    '--bar',
                    'baz',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                    baz: 'baz',
                    bar: true,
                },
                restArgs: prepareDefaultArguments().replace(['baz']),
            });
        });

        test('Multiple options with different types and requirements with default values', () => {
            const res = parseArguments({
                args: prepareDefaultArguments(),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                        defaultValue: 42,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                    baz: 'bar',
                    bar: false,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Multiple options with different types and requirements with default values and arguments', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    '42',
                    '--baz',
                    'bar',
                    '--bar',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                        defaultValue: 42,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                    baz: 'bar',
                    bar: true,
                },
                restArgs: prepareDefaultArguments(),
            });
        });

        test('Multiple options with different types and requirements with default values and arguments and unknown options', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    '42',
                    '--baz',
                    'bar',
                    '--bar',
                    'baz',
                    '--qux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                        defaultValue: 42,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual(['Unknown option: --qux']);
        });

        test('Multiple options with different types and requirements with default values and arguments and unknown options and positional arguments', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    '-f',
                    '42',
                    '--baz',
                    'bar',
                    '--bar',
                    'baz',
                    'quux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                        defaultValue: 42,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                        defaultValue: 'bar',
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: 42,
                    baz: 'bar',
                    bar: true,
                },
                restArgs: prepareDefaultArguments().replace(['baz', 'quux']),
            });
        });

        test('Multiple positional arguments with some options defined where some are defined with equal signs nad some are flags', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace([
                    'asd',
                    '--foo=-3123.45',
                    'baz',
                    '--bar',
                    'qux',
                    'quux',
                ]),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'number',
                        required: false,
                    },
                    {
                        long: 'baz',
                        short: 'b',
                        description: 'baz',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'boolean',
                    },
                ],
            });
            expect(res).toEqual({
                options: {
                    foo: -3123.45,
                    bar: true,
                },
                restArgs: prepareDefaultArguments().replace([
                    'asd',
                    'baz',
                    'qux',
                    'quux',
                ]),
            });
        });
    });

    describe('Error Cases', () => {
        test('Condensed flags with non-boolean option', () => {
            const res = parseArguments({
                args: prepareDefaultArguments().replace(['-fb']),
                definitions: [
                    {
                        long: 'foo',
                        short: 'f',
                        description: 'foo',
                        type: 'string',
                        required: false,
                    },
                    {
                        long: 'bar',
                        short: 'b',
                        description: 'bar',
                        type: 'string',
                        required: false,
                    },
                ],
            });
            expect(res).toEqual([
                'Option -f in condensed flags option "-fb" must be a boolean. The option is defined as "string"',
                'Option -b in condensed flags option "-fb" must be a boolean. The option is defined as "string"',
            ]);
        });
    });
});
