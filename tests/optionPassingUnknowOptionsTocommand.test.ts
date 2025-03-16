import { describe, expect, test } from 'bun:test';

import parseArguments from '../framework/parseArguments';
import ScriptArguments from '../framework/types/ScriptArguments';

function prepareDefaultArguments(): ScriptArguments {
    return ScriptArguments.initFromProcessArgv().clear();
}

describe('Pass Unknown Options Tests', () => {
    test('Default behavior - unknown options generate errors', () => {
        const args = prepareDefaultArguments().replace(['--unknown', '--another-unknown']);
        const res = parseArguments({
            args,
            definitions: [],
            // passUnknownOptions defaults to false
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(2);
        expect(res).toEqual(['Unknown option: --unknown', 'Unknown option: --another-unknown']);
    });

    test('With passUnknownOptions=true - unknown options are passed through', () => {
        const args = prepareDefaultArguments().replace(['--unknown', '--another-unknown=value']);
        const res = parseArguments({
            args,
            definitions: [],
            passUnknownOptions: true,
        });
        expect(res).toEqual({
            options: {},
            restArgs: prepareDefaultArguments().replace(['--unknown', '--another-unknown=value']),
        });
    });

    test('Mixed case - known options and unknown options', () => {
        const args = prepareDefaultArguments().replace([
            '--known',
            'value',
            '--unknown',
            '-h',
            '-u',
            'unknown-value',
        ]);
        const res = parseArguments({
            args,
            definitions: [
                {
                    long: 'known',
                    short: 'k',
                    description: 'Known option',
                    type: 'string',
                    required: false,
                },
            ],
            passUnknownOptions: true,
        });
        expect(res).toEqual({
            options: {
                known: 'value',
            },
            restArgs: prepareDefaultArguments().replace(['--unknown', '-h', '-u', 'unknown-value']),
        });
    });

    test('Condensed flags with unknown options', () => {
        const args = prepareDefaultArguments().replace(['-kux']);
        const res = parseArguments({
            args,
            definitions: [
                {
                    short: 'k',
                    description: 'Known option',
                    type: 'boolean',
                },
            ],
            passUnknownOptions: true,
        });
        expect(res).toEqual({
            options: { k: false },
            restArgs: prepareDefaultArguments().replace(['-kux']),
        });
    });

    test('Validation errors still work with passUnknownOptions=true', () => {
        const args = prepareDefaultArguments().replace([
            '--required-string',
            'valid-value',
            '--unknown-option',
            '--missing-required',
        ]);
        const res = parseArguments({
            args,
            definitions: [
                {
                    long: 'required-string',
                    short: 'r',
                    description: 'Required string option',
                    type: 'string',
                    required: true,
                },
                {
                    long: 'missing-required',
                    short: 'm',
                    description: 'Another required option that is missing',
                    type: 'string',
                    required: true,
                },
            ],
            passUnknownOptions: true,
        });
        expect(res).toBeArray();
        expect(res).toContain('Option --missing-required must have a value');
        expect(res).toContain('Option -m --missing-required is required');
    });

    test('Options with equals and passUnknownOptions=true', () => {
        const args = prepareDefaultArguments().replace(['--known=value', '--unknown=foo']);
        const res = parseArguments({
            args,
            definitions: [
                {
                    long: 'known',
                    short: 'k',
                    description: 'Known option',
                    type: 'string',
                    required: false,
                },
            ],
            passUnknownOptions: true,
        });
        expect(res).toEqual({
            options: {
                known: 'value',
            },
            restArgs: prepareDefaultArguments().replace(['--unknown=foo']),
        });
    });
});
