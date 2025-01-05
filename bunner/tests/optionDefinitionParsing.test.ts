import { describe, expect, test } from "bun:test";
import OptionCatalog from "../framework/types/OptionCatalog";
import Option from "../framework/types/Option";
import { OptionDefinition } from "../framework/types/OptionDefinition";

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
    expect(option.required).toBe(definition.required);
    if ('defaultValue' in definition) {
        expect(option.defaultValue).toBe(definition.defaultValue as any);
    } else {
        expect(option.defaultValue).toBeUndefined();
    }
}

function existsValueWithDefinition(catalog: OptionCatalog, identifier: string, definition: OptionDefinition) {
    const o = catalog.getByIdentifier(identifier);
    expect(o).toBeInstanceOf(Option);
    if (o instanceof Option) {
        OptionDefinitionMatchesOption(definition, o);
    }
}

const es: OptionDefinition = {
    long: "empty-string",
    short: "es",
    description: "Empty string",
    type: "string",
    required: false,
};

const ds: OptionDefinition = {
    long: "default-string",
    short: "ds",
    description: "Default string",
    type: "string",
    required: false,
    defaultValue: "default",
};

const eb: OptionDefinition = {
    long: "empty-boolean",
    short: "eb",
    description: "Empty boolean",
    type: "boolean",
    required: false,
};

const dbt: OptionDefinition = {
    long: "default-boolean-true",
    short: "db",
    description: "Default boolean true",
    type: "boolean",
    required: false,
    defaultValue: true,
};
const dbf: OptionDefinition = {
    long: "default-boolean-false",
    short: "db",
    description: "Default boolean false",
    type: "boolean",
    required: false,
    defaultValue: false,
};

const end: OptionDefinition = {
    long: "empty-number",
    short: "en",
    description: "Empty number",
    type: "number",
    required: false,
};

const dnt: OptionDefinition = {
    long: "default-number-true",
    short: "dn",
    description: "Default number true",
    type: "number",
    required: false,
    defaultValue: 1,
};

describe("OptionCatalog.fromDefinitions:", () => {
    
    test("From Empty Array", () => {
        const c = OptionCatalog.fromDefinitions([]);
        hasNOptions(c, 0);
    });
    
    test("From Single Option", () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: "long",
                short: "l",
                description: "desc",
                type: "string",
                required: true,
            },
        ]);
        hasOption(c, "long");
        hasNOptions(c, 1);
    });
    
    test("From Multiple Options", () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: "long",
                short: "l",
                description: "desc",
                type: "string",
                required: true,
            },
            {
                long: "long2",
                short: "l2",
                description: "desc2",
                type: "string",
                required: true,
            },
        ]);
        hasNOptions(c, 2);
        hasOption(c, "long");
        hasOption(c, "long2");
    });
    
    test("Identifier selection priority", () => {
        const c = OptionCatalog.fromDefinitions([
            {
                long: "long",
                short: "l",
                description: "desc",
                type: "string",
                required: true,
            },
            {
                short: "l2",
                description: "desc2",
                type: "string",
                required: true,
            },
        ]);
        hasNOptions(c, 2);
        hasOption(c, "long");
        hasOption(c, "l2");
    });
    
    test("Invalid Option Definition", () => {
        expect(() => OptionCatalog.fromDefinitions([
            {
                description: "desc",
                type: "string",
            } as any,
        ])).toThrow(); // this throws when identified cannot be created for the given option.
    });
    
    test("Option find by long nad short name", () => {
        const ls: OptionDefinition = {
            long: "long-short",
            short: "ls",
            description: "long short desc",
            type: "string",
            required: true,
        };
        
        const s: OptionDefinition = {
            short: "s",
            description: "short desc",
            type: 'boolean',
            required: true,
        };
        
        const l: OptionDefinition = {
            long: "long",
            description: "long desc",
            type: 'number',
            required: true,
        };
        
        const c = OptionCatalog.fromDefinitions([ls, s, l])
        let o = c.getByLongName("long-short");
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(ls, o);
        }
        
        expect(c.getByLongName("s")).toBeEmpty();
        expect(c.getByLongName("")).toBeEmpty();
        
        o = c.getByLongName("long");
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(l, o);
        }
    });
    
    test("Option find by short name", () => {
        const ls: OptionDefinition = {
            long: "long-short",
            short: "ls",
            description: "long short desc",
            type: "string",
            required: true,
        };
        
        const s: OptionDefinition = {
            short: "s",
            description: "short desc",
            type: 'boolean',
            required: true,
        };
        
        const l: OptionDefinition = {
            long: "long",
            description: "long desc",
            type: 'number',
            required: true,
        };
        
        const c = OptionCatalog.fromDefinitions([ls, s, l])
        let o = c.getByShortName("ls");
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(ls, o);
        }
        
        o = c.getByShortName("s");
        expect(o).toBeInstanceOf(Option);
        if (o instanceof Option) {
            OptionDefinitionMatchesOption(s, o);
        }
        
        expect(c.getByShortName("long")).toBeEmpty();
        expect(c.getByShortName("")).toBeEmpty();
    });
    
    test("Option default value resolution", () => {

        const c = OptionCatalog.fromDefinitions([es, ds, eb, dbt, dbf, end, dnt]);
        existsValueWithDefinition(c, "empty-string", es);
        existsValueWithDefinition(c, "default-string", ds);
        existsValueWithDefinition(c, "empty-boolean", eb);
        existsValueWithDefinition(c, "default-boolean-true", dbt);
        existsValueWithDefinition(c, "default-boolean-false", dbf);
        existsValueWithDefinition(c, "empty-number", end);
        existsValueWithDefinition(c, "default-number-true", dnt);
        
        expect(c.getByIdentifier("empty-string")?.withValue("value").value).toBe("value");
        expect(c.getByIdentifier("default-string")?.withValue("value").value).toBe("value");
        expect(c.getByIdentifier("empty-boolean")?.withValue(true).value).toBe(true);
        expect(c.getByIdentifier("default-boolean-true")?.withValue(false).value).toBe(false);
        expect(c.getByIdentifier("default-boolean-false")?.withValue(true).value).toBe(true);
        expect(c.getByIdentifier("empty-number")?.withValue(2).value).toBe(2);
    });
    
    test(`Script Param Resolution With default options`, () => {
        const c = OptionCatalog.fromDefinitions([es, ds, eb, dbt, dbf, end, dnt]);
        expect(c.buildScriptOptions()).toEqual({
            "empty-string": undefined,
            "default-string": "default",
            "empty-boolean": undefined,
            "default-boolean-true": true,
            "default-boolean-false": false,
            "empty-number": undefined,
            "default-number-true": 1,
        });
    });
    
    test(`Script Param Resolution With Custom Values`, () => {
        const c = OptionCatalog.fromDefinitions([es, ds, eb, dbt, dbf, end, dnt]);
        const expectedObject = {
            "empty-string": undefined as string|undefined,
            "default-string": "default",
            "empty-boolean": undefined as boolean|undefined,
            "default-boolean-true": true,
            "default-boolean-false": false,
            "empty-number": undefined  as number|undefined,
            "default-number-true": 1,
        };
        
        c.register(c.getByIdentifier("empty-string")?.withValue("value")!);
        expectedObject['empty-string'] = "value";
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("empty-boolean")?.withValue(true)!);
        expectedObject['empty-boolean'] = true;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("empty-number")?.withValue(2)!);
        expectedObject['empty-number'] = 2;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("default-string")?.withValue("custom")!);
        expectedObject['default-string'] = "custom";
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("default-boolean-true")?.withValue(false)!);
        expectedObject['default-boolean-true'] = false;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("default-boolean-false")?.withValue(true)!);
        expectedObject['default-boolean-false'] = true;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
        c.register(c.getByIdentifier("default-number-true")?.withValue(3)!);
        expectedObject['default-number-true'] = 3;
        expect(c.buildScriptOptions()).toEqual(expectedObject);
        
    });
    
});
