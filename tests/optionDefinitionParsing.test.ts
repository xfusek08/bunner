/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'bun:test';

import Option from '../framework/types/Option';
import OptionCatalog from '../framework/types/OptionCatalog';
import { OptionDefinition } from '../framework/types/OptionDefinition';
import nonNilPipe from '../framework/utils/nonNilPipe';

function hasOption(catalog: OptionCatalog, identifier: string) {
    expect(catalog.getByIdentifier(identifier)).toBeInstanceOf(Option);
}

function hasNOptions(catalog: OptionCatalog, n: number) {
    expect(Object.values((catalog as any).options).length).toBe(n);
}

function OptionDefinitionMatchesOption(definition: OptionDefinition, option: Option) {
    expect(option.long as any).toBe(definition.long as any);
    expect(option.short as any).toBe(definition.short as any);
    expect(option.description).toBe(definition.description);
    expect(option.type).toBe(definition.type);

    if ('required' in definition) {
        expect(option.required).toBe(definition.required as any);
    } else {
        expect(option.required).toBe(false);
    }

    if ('defaultValue' in definition) {
        expect(option.defaultValue).toBe(definition.defaultValue as any);
    } else {
        expect(option.defaultValue).toBeUndefined();
    }
}

function existsValueWithDefinition(
    catalog: OptionCatalog,
    identifier: string,
    definition: OptionDefinition,
) {
    const o = catalog.getByIdentifier(identifier);
    expect(o).toBeInstanceOf(Option);
    if (o instanceof Option) {
        OptionDefinitionMatchesOption(definition, o);
    }
}

const es: OptionDefinition = {
    long: 'empty-string',
    short: 'es',
    description: 'Empty string',
    type: 'string',
    required: false,
};

const ds: OptionDefinition = {
    long: 'default-string',
    short: 'ds',
    description: 'Default string',
    type: 'string',
    required: false,
    defaultValue: 'default',
};

const b: OptionDefinition = {
    long: 'boolean',
    short: 'b',
    description: 'Empty boolean',
    type: 'boolean',
};

const end: OptionDefinition = {
    long: 'empty-number',
    short: 'en',
    description: 'Empty number',
    type: 'number',
    required: false,
};

const dnt: OptionDefinition = {
    long: 'default-number-true',
    short: 'dn',
    description: 'Default number true',
    type: 'number',
    required: false,
    defaultValue: 1,
};

describe('OptionCatalog.fromDefinitions:', () => {
    test('From Empty Array', () => {
        const c = OptionCatalog.fromDefinitions([]);
        hasNOptions(c, 0);
    });

    test('From Single Option', () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: 'long',
                short: 'l',
                description: 'desc',
                type: 'string',
                required: true,
            },
        ]);
        hasOption(c, 'long');
        hasNOptions(c, 1);
    });

    test('From Multiple Options', () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: 'long',
                short: 'l',
                description: 'desc',
                type: 'string',
                required: true,
            },
            {
                long: 'long2',
                short: 'l2',
                description: 'desc2',
                type: 'string',
                required: true,
            },
        ]);
        hasNOptions(c, 2);
        hasOption(c, 'long');
        hasOption(c, 'long2');
    });

    test('Identifier selection priority', () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: 'long',
                short: 'l',
                description: 'desc',
                type: 'string',
                required: true,
            },
            {
                short: 'l2',
                description: 'desc2',
                type: 'string',
                required: true,
            },
        ]);
        hasNOptions(c, 2);
        hasOption(c, 'long');
        hasOption(c, 'l2');
    });

    test('Invalid Option Definition', () => {
        expect(() =>
            OptionCatalog.fromDefinitions([
                {
                    description: 'desc',
                    type: 'string',
                } as any,
            ]),
        ).toThrow(); // this throws when identified cannot be created for the given option.
    });

    test('Option find by long nad short name', () => {
        const ls: OptionDefinition = {
            long: 'long-short',
            short: 'ls',
            description: 'long short desc',
            type: 'string',
            required: true,
        };

        const s: OptionDefinition = {
            short: 's',
            description: 'short desc',
            type: 'boolean',
        };

        const l: OptionDefinition = {
            long: 'long',
            description: 'long desc',
            type: 'number',
            required: true,
        };

        const c = OptionCatalog.fromDefinitions([ls, s, l]);
        let o = c.getByLongName('long-short');
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(ls, o);
        }

        expect(c.getByLongName('s')).toBeEmpty();
        expect(c.getByLongName('')).toBeEmpty();

        o = c.getByLongName('long');
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(l, o);
        }
    });

    test('Option find by short name', () => {
        const ls: OptionDefinition = {
            long: 'long-short',
            short: 'ls',
            description: 'long short desc',
            type: 'string',
            required: true,
        };

        const s: OptionDefinition = {
            short: 's',
            description: 'short desc',
            type: 'boolean',
        };

        const l: OptionDefinition = {
            long: 'long',
            description: 'long desc',
            type: 'number',
            required: true,
        };

        const c = OptionCatalog.fromDefinitions([ls, s, l]);
        let o = c.getByShortName('ls');
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(ls, o);
        }

        o = c.getByShortName('s');
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(s, o);
        }

        expect(c.getByShortName('long')).toBeEmpty();
        expect(c.getByShortName('')).toBeEmpty();
    });

    test('Option default value resolution', () => {
        const c = OptionCatalog.fromDefinitions([es, ds, b, end, dnt]);
        existsValueWithDefinition(c, 'empty-string', es);
        existsValueWithDefinition(c, 'default-string', ds);
        existsValueWithDefinition(c, 'boolean', b);
        existsValueWithDefinition(c, 'empty-number', end);
        existsValueWithDefinition(c, 'default-number-true', dnt);

        expect(c.getByIdentifier('empty-string')?.withValue('value').value).toBe('value');
        expect(c.getByIdentifier('default-string')?.withValue('value').value).toBe('value');
        expect(c.getByIdentifier('boolean')?.withValue(true).value).toBe(true);
        expect(c.getByIdentifier('empty-number')?.withValue(2).value).toBe(2);
    });

    test('Script Param Resolution With default options', () => {
        const c = OptionCatalog.fromDefinitions([es, ds, b, end, dnt]);
        expect(c.buildScriptOptions()).toEqual({
            'empty-string': undefined,
            'default-string': 'default',
            boolean: false,
            'empty-number': undefined,
            'default-number-true': 1,
        });
    });

    test('Script Param Resolution With Custom Values', () => {
        const c = OptionCatalog.fromDefinitions([es, ds, b, end, dnt]);
        const expectedObject = {
            'empty-string': undefined as string | undefined,
            'default-string': 'default',
            boolean: false,
            'empty-number': undefined as number | undefined,
            'default-number-true': 1,
        };

        nonNilPipe(
            c.getByIdentifier('empty-string'),
            (o) => o.withValue('value'),
            c.register.bind(c),
        );
        expectedObject['empty-string'] = 'value';
        expect(c.buildScriptOptions()).toEqual(expectedObject);

        nonNilPipe(c.getByIdentifier('boolean'), (o) => o.withValue(true), c.register.bind(c));
        expectedObject['boolean'] = true;
        expect(c.buildScriptOptions()).toEqual(expectedObject);

        nonNilPipe(c.getByIdentifier('empty-number'), (o) => o.withValue(2), c.register.bind(c));
        expectedObject['empty-number'] = 2;
        expect(c.buildScriptOptions()).toEqual(expectedObject);

        nonNilPipe(
            c.getByIdentifier('default-string'),
            (o) => o.withValue('custom'),
            c.register.bind(c),
        );
        expectedObject['default-string'] = 'custom';
        expect(c.buildScriptOptions()).toEqual(expectedObject);

        nonNilPipe(
            c.getByIdentifier('default-number-true'),
            (o) => o.withValue(3),
            c.register.bind(c),
        );
        expectedObject['default-number-true'] = 3;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
    });
});
