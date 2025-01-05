import { describe, expect, test } from "bun:test";
import ScriptArguments from "../framework/types/ScriptArguments";
import { OptionDefinition } from "../framework/types/OptionDefinition";
import parseArguments from "../framework/parseArguments";

function prepareDefaultArguments(): ScriptArguments {
    return ScriptArguments.initFromProcessArgv().clear();
}

describe("Argument Parsing", () => {
    
    // #region Only Positional Arguments Tests
    
    test("Empty Arguments and empty options", () => {
        expect(parseArguments({
            args: prepareDefaultArguments(),
            definitions: [],
        })).toEqual({
            options: {},
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("No definition with non-option arguments", () => {
        const args = prepareDefaultArguments().replace(["foo", "bar"]);
        expect(parseArguments({
            args,
            definitions: [],
        })).toEqual({
            options: {},
            restArgs: args,
        });
    });
    
    // #endregion
    
    // #region Unknown Option Tests
    
    test("No definition with with single long option argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo"]),
            definitions: [],
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(1);
        expect(res).toEqual(["Unknown option: --foo"]);
    });
    
    test("No definition with with single short option argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [],
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(1);
        expect(res).toEqual(["Unknown option: -f"]);
    });
    
    test("No definition with multiple options of various types", () => {
        const args = prepareDefaultArguments().replace(["-f", "--foo", "--b"]);
        const res = parseArguments({
            args,
            definitions: [],
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(3);
        expect(res).toEqual([
            "Unknown option: -f",
            "Unknown option: --foo",
            "Unknown option: --b",
        ]);
    });
    
    test("No definition with combination of options and positional arguments", () => {
        const args = prepareDefaultArguments().replace(["foo", "-f", "--foo", "bar", "--b"]);
        const res = parseArguments({
            args,
            definitions: [],
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(3);
        expect(res).toEqual([
            "Unknown option: -f",
            "Unknown option: --foo",
            "Unknown option: --b",
        ]);
    });
    
    test("No definition with positional arguments and single option on last position", () => {
        const args = prepareDefaultArguments().replace(["foo", "bar", "--foo"]);
        const res = parseArguments({
            args,
            definitions: [],
        });
        expect(res).toBeArray();
        expect(res).toHaveLength(1);
        expect(res).toEqual([
            "Unknown option: --foo",
        ]);
    });
    
    // #endregion
    
    // #region Bool Flag Option Tests
    
    test("Single optional boolean option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single optional boolean option set to true by presence of short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single optional boolean option with only short name without argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single optional boolean option with only short name set to true by single short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option with only short name without argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option with only short name set to true by single short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option with only short name tried to be set by long name prefix", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--f"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual([
            "Unknown option: --f",
        ]);
    });
    
    test("Single required boolean option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option set to true by presence of short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option set to true by presence of long name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option set to true by presence of both short and long name arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "--foo"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single required boolean option set to true by presence of both short and long name arguments without other positional arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "foo", "--foo", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: true,
            },
            restArgs: prepareDefaultArguments().replace(["foo", "bar"]),
        });
    });
    
    test("Single optional boolean option with only positional arguments", () => {
        const args = prepareDefaultArguments().replace(["foo", "bar"]);
        const res = parseArguments({
            args,
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
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
    
    test("Single optional boolean option set to true with positional arguments", () => {
        const args = prepareDefaultArguments().replace(["foo", "-f", "bar"]);
        const res = parseArguments({
            args,
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: true,
            },
            restArgs: prepareDefaultArguments().replace(["foo", "bar"]),
        });
    });
    
    test("One valid option argument and one invalid option argument", () => {
        const args = prepareDefaultArguments().replace(["-f", "--foo"]);
        const res = parseArguments({
            args,
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual([
            "Unknown option: --foo",
        ]);
    });
    
    test("Multiple different optional boolean options", () => {
        const definitions: OptionDefinition[] = [
            {
                short: "f",
                description: "foo",
                type: "boolean",
            },
            {
                short: 'F',
                long: "foo",
                description: "foo",
                type: "boolean",
            },
            {
                short: "b",
                description: "bar",
                type: "boolean",
            },
            {
                long: "bar",
                description: "bar",
                type: "boolean",
            },
        ];
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments(),
        })).toEqual({
            options: {
                f: false,
                foo: false,
                b: false,
                bar: false,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "--foo", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: false,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "-F", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-fF", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: false,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["--foo", "--bar"]),
        })).toEqual({
            options: {
                f: false,
                foo: true,
                b: false,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: false,
                b: false,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["foo", "-f", "--foo", "bar", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments().replace(["foo", "bar"]),
        });
    });
    
    test("Multiple different required boolean options", () => {
        const definitions: OptionDefinition[] = [
            {
                short: "f",
                description: "foo",
                type: "boolean",
            },
            {
                long: "foo",
                description: "foo",
                type: "boolean",
            },
            {
                short: "b",
                description: "bar",
                type: "boolean",
            },
            {
                long: "bar",
                description: "bar",
                type: "boolean",
            },
        ];
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments(),
        })).toEqual({
            options: {
                f: false,
                foo: false,
                b: false,
                bar: false,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "--foo", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: false,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["--foo", "--bar"]),
        })).toEqual({
            options: {
                f: false,
                foo: true,
                b: false,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["-f", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: false,
                b: false,
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            definitions,
            args: prepareDefaultArguments().replace(["foo", "-f", "--foo", "bar", "-b", "--bar"]),
        })).toEqual({
            options: {
                f: true,
                foo: true,
                b: true,
                bar: true,
            },
            restArgs: prepareDefaultArguments().replace(["foo", "bar"]),
        });
    });
    
    // #endregion
    
    // #region Condensed Bool Flag Option Tests
    
    test("Two condensed optional boolean options", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-fb"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
                {
                    short: "b",
                    description: "bar",
                    type: "boolean",
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
    
    test("Two condensed optional boolean options with one is undefined", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
                {
                    short: "b",
                    description: "bar",
                    type: "boolean",
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
    
    test("Two condensed required boolean options", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-fb"]),
            definitions: [
                {
                    short: "f",
                    description: "foo",
                    type: "boolean",
                },
                {
                    short: "b",
                    description: "bar",
                    type: "boolean",
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
    
    test("Boolean option with default true value and capital letters and required value", () => {
        const definitions: OptionDefinition[] = [
            {
                short: "F",
                long: "foo",
                description: "foo",
                type: "boolean",
            },
            {
                short: "f",
                description: "foo",
                type: "boolean",
            },
            {
                short: "b",
                description: "bar",
                type: "boolean",
            },
            {
                short: "Z",
                description: "baz",
                type: "boolean",
            },
            {
                short: "z",
                long: "zoo",
                description: "qux",
                type: "boolean",
            },
        ];
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["hello", "-FfbZz", "world"]),
            definitions
        })).toEqual({
            options: {
                foo: true,
                f: true,
                b: true,
                Z: true,
                zoo: true,
            },
            restArgs: prepareDefaultArguments().replace(["hello", "world"]),
        });
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["hello", "-Fz", "world", "foo"]),
            definitions
        })).toEqual({
            options: {
                foo: true,
                zoo: true,
                f: false,
                Z: false,
                b: false,
            },
            restArgs: prepareDefaultArguments().replace(["hello", "world", "foo"]),
        });
    });
        
    // #region Single String Option Tests
    
    test("Single string option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {},
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with long name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with short name argument without value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option -f must have a value",
        ]);
    });
    
    test("Single string option with long name argument without value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
        ]);
    });
    
    test("Single string option defined with long name and equal sign", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option defined with short name and equal sign", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f=bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with followed by value that looks like an option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "--bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "--bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with followed by value that looks like an known option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "--foo"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "--foo",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with followed by value that looks like another known option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "--bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "--bar",
                bar:  false,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option defined with long name and equal sign without value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo="]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
        ]);
    });
    
    test("Single string option defined with short name and equal sign without value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f="]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option -f must have a value",
        ]);
    });
    
    test("Single string option with followed by value that looks like another known option with string value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "--bar=qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "string",
                    required: false,
                    defaultValue: "baz"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "--bar=qux",
                bar: "baz",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option defined with long name and equal sign with empty value followed by another positional argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
        ]);
    });
    
    test("Single string option defined with long name and equal sign with empty value followed by unknown option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "--bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
            "Unknown option: --bar",
        ]);
    });
    
    test("Single string option defined with long name and equal sign with empty value followed by unknown option and another positional argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "--bar", "baz"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
            "Unknown option: --bar",
        ]);
    });
    
    test("Single string option defined with long name and equal sign with empty value followed by known option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "--bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
        ]);
    });
    
    test("Single string option validly set by more than one argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar", "-f", "baz"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo cannot be set more than once, the current value \"bar\" would be overwritten by -f with value \"baz\"."
        ]);
    });
    
    test("Single string option set multiple times where one is invalid", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar", "--foo"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "There was an attempt to set option --foo more than once by option --foo without a value. The current value is \"bar\"."
        ]);
    });
    
    test("Single string option set multiple times where one is invalid nad onw is short name", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar", "-f"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "There was an attempt to set option --foo more than once by option -f without a value. The current value is \"bar\"."
        ]);
    });
    
    // #endregion
    
    // #region Optional String Option With Default Values
    
    test("Single string option with default value without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with default value and short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "baz"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single string option with default value and long name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "baz"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    // #endregion
    
    // #region Combination Of Multiple Optional String Arguments
    
    test("Multiple optional string options with default values", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple optional string options with default values and short name arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "baz", "-b", "qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple optional string options with default values and long name arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "baz", "--baz", "qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple optional string options with default values and other positional arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "baz", "qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments().replace(["qux"]),
        });
    });
    
    test("Multiple optional string options with default values and long name arguments with equal signs", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=baz", "--baz=qux", "quux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments().replace(["quux"]),
        });
    });
    
    test("Multiple optional string options with default values and long name arguments with equal signs followed by another positional argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["asd", "--foo=baz", "qwe", "-b", "qux", "qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "zxc"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "baz",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments().replace(["asd", "qwe", "qux"]),
        });
    });
    
    
    test("Multiple optional string options with default values and long name arguments with empty values", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "--baz="]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
            "Option --baz must have a value",
        ]);
    });
    
    test("Multiple optional string options with default values and long name arguments with empty values followed by another positional argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=", "--baz=", "qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo must have a value",
            "Option --baz must have a value",
        ]);
    });
    
    test("Multiple optional string options with one default value and one specified value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false,
                    defaultValue: "baz"
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "qux"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
                baz: "qux",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    // #endregion
    
    // #region Required String Option Tests
    
    test("Single required string option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo is required",
        ]);
    });
    
    test("Single required string option with short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single required string option with long name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single required string option with short name argument without value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
            ],
        });
        expect(res).toEqual([
            "Option -f must have a value",
        ]);
    });
    
    // #endregion
    
    // #region Combination of required and optional string options
    
    test("One required and one optional string option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option --foo is required",
        ]);
    });
    
    test("One required and one optional string option with short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("One required and one optional string option with long name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: true
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "string",
                    required: false,
                    defaultValue: "baz"
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: "bar",
                bar: "baz",
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    // #endregion
    
    // #region Single Number Option Tests
    
    test("Single number option without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
                },
            ],
        });
        expect(res).toEqual({
            options: {},
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single number option with default value without any argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false,
                    defaultValue: 42
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
    
    test("Single number option with short name argument", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "42"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
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
    
    test("Single number option with float value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "42.5"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
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
    
    test("Single number option with invalid float value", () => {
        const definitions: OptionDefinition[] = [
            {
                long: "foo",
                short: "f",
                description: "foo",
                type: "number",
                required: false
            },
        ];
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "42.5.5"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5.5\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "asd"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"asd\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "42.5e"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5e\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "42.5e-"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5e-\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "-42"]),
            definitions,
        })).toEqual({
            options: {
                foo: -42,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo", "-42.5"]),
            definitions,
        })).toEqual({
            options: {
                foo: -42.5,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Single number option set by equal sign", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=42"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
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
    
    test("Single number option set by equal sign with float value", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["--foo=42.5"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
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
    
    test("Single number option set by equal sign with invalid float value", () => {
        const definitions: OptionDefinition[] = [
            {
                long: "foo",
                short: "f",
                description: "foo",
                type: "number",
                required: false
            },
        ];
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=42.5.5"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5.5\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=asd"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"asd\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=42.5e"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5e\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=42.5e-"]),
            definitions,
        })).toEqual([
            "Option --foo must be a valid number representation. Received: \"42.5e-\"",
        ]);
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=-42"]),
            definitions,
        })).toEqual({
            options: {
                foo: -42,
            },
            restArgs: prepareDefaultArguments(),
        });
        
        expect(parseArguments({
            args: prepareDefaultArguments().replace(["--foo=-42.5"]),
            definitions,
        })).toEqual({
            options: {
                foo: -42.5,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    // #endregion
    
    // #region Final Combination Of All
    
    test("Multiple options with different types and requirements", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "42", "--foo", "42.5", "-b", "--bar", "baz"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: 42,
                baz: "baz",
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple options with different types and requirements with default values", () => {
        const res = parseArguments({
            args: prepareDefaultArguments(),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false,
                    defaultValue: 42
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: 42,
                baz: "bar",
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple options with different types and requirements with default values and arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "42", "--baz", "bar", "--bar"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false,
                    defaultValue: 42
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: 42,
                baz: "bar",
                bar: true,
            },
            restArgs: prepareDefaultArguments(),
        });
    });
    
    test("Multiple options with different types and requirements with default values and arguments and unknown options", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "42", "--baz", "bar", "--bar", "baz", "--qux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false,
                    defaultValue: 42
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual([
            "Unknown option: --qux",
        ]);
    });
    
    test("Multiple options with different types and requirements with default values and arguments and unknown options and positional arguments", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-f", "42", "--baz", "bar", "--bar", "baz", "--qux", "quux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false,
                    defaultValue: 42
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false,
                    defaultValue: "bar"
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: 42,
                baz: "bar",
                bar: true,
            },
            restArgs: prepareDefaultArguments().replace(["quux"]),
        });
    });
    
    test("Multiple positional arguments with some options defined where some are defined with equal signs nad some are flags", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["asd", "--foo=-3123.45", "baz", "--bar", "qux", "quux"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "number",
                    required: false
                },
                {
                    long: "baz",
                    short: "b",
                    description: "baz",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "boolean",
                },
            ],
        });
        expect(res).toEqual({
            options: {
                foo: -3123.45,
                bar: true,
            },
            restArgs: prepareDefaultArguments().replace(["asd", "baz", "qux", "quux"]),
        });
    });
    
    // #endregion
    
    // #region Error Cases
    
    test("Test condensed flags with non-boolean option", () => {
        const res = parseArguments({
            args: prepareDefaultArguments().replace(["-fb"]),
            definitions: [
                {
                    long: "foo",
                    short: "f",
                    description: "foo",
                    type: "string",
                    required: false
                },
                {
                    long: "bar",
                    short: "b",
                    description: "bar",
                    type: "string",
                    required: false
                },
            ],
        });
        expect(res).toEqual([
            "Option -f must have a value",
        ]);
    });
    
});
