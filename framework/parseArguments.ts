import Option from './types/Option';
import OptionCatalog from './types/OptionCatalog';
import { OptionDefinitions } from './types/OptionDefinition';
import ScriptArguments from './types/ScriptArguments';
import ScriptOptions from './types/ScriptOptions';

type Props = {
    args: ScriptArguments;
    definitions: OptionDefinitions;
    passUnknownOptions?: boolean;
};

type SuccessfulResult = {
    options: ScriptOptions;
    restArgs: ScriptArguments;
};

type ErrorResult = string[];

type Result = SuccessfulResult | ErrorResult;

export default function parseArguments({
    args,
    definitions,
    passUnknownOptions = false,
}: Props): Result {
    const optionCatalog = OptionCatalog.fromDefinitions(definitions);
    // console.log('Option catalog:', { definitions, optionCatalog });
    const workingArgs = args.args.slice();
    const positionalArgs: string[] = [];
    const errors: ErrorResult = [];

    const registerOption = ({
        defaultOption,
        optionDisplayName,
        requestValue,
    }: {
        defaultOption: Option | null;
        optionDisplayName: string;
        requestValue: () => string | undefined;
    }) => {
        if (!defaultOption) {
            errors.push(`Unknown option: ${optionDisplayName}`);
            return;
        }

        if (defaultOption.isType('boolean')) {
            optionCatalog.register(defaultOption.withValue(true));
            return;
        }

        const strValue = requestValue();

        if (defaultOption.isValueSet && strValue) {
            errors.push(
                `Option ${defaultOption.dashedIdentifier} cannot be set more than once, the current value "${defaultOption.value}" would be overwritten by ${optionDisplayName} with value "${strValue}".`,
            );
            return;
        }

        if (defaultOption.isValueSet && !strValue) {
            errors.push(
                `There was an attempt to set option ${defaultOption.dashedIdentifier} more than once by option ${optionDisplayName} without a value. The current value is "${defaultOption.value}".`,
            );
            return;
        }

        if (!strValue) {
            errors.push(`Option ${optionDisplayName} must have a value`);
            return;
        }

        const value = defaultOption.parseValue(strValue);
        if (value instanceof Error) {
            errors.push(value.message);
            return;
        }

        const finalOption = defaultOption.withValue(value);
        if (finalOption instanceof Error) {
            errors.push(finalOption.message);
            return;
        }

        optionCatalog.register(finalOption);
        return;
    };

    // Process arguments

    while (workingArgs.length > 0) {
        const arg = workingArgs.shift()!;

        // Check for --option=value
        if (arg.startsWith('--') && arg.includes('=')) {
            const [name, value] = arg.slice(2).split('=');
            const defaultOption = optionCatalog.getByLongName(name);
            if (defaultOption || !passUnknownOptions) {
                registerOption({
                    defaultOption,
                    optionDisplayName: `--${name}`,
                    requestValue: () => value,
                });
                continue;
            }
        }

        // Check for --option value
        if (arg.startsWith('--') && arg.length > 2) {
            const name = arg.slice(2);
            const defaultOption = optionCatalog.getByLongName(name);
            if (defaultOption || !passUnknownOptions) {
                registerOption({
                    defaultOption,
                    optionDisplayName: `--${name}`,
                    requestValue: () => workingArgs.shift(),
                });
                continue;
            }
        }

        // -- is a valid positional argument or invalid option but it should be passed through as a positional argument
        if (arg.startsWith('--')) {
            positionalArgs.push(arg);
            continue;
        }

        // Check for -o=value
        if (arg.startsWith('-') && arg.includes('=')) {
            const [name, value] = arg.slice(1).split('=');
            const defaultOption = optionCatalog.getByShortName(name);
            if (defaultOption || !passUnknownOptions) {
                registerOption({
                    defaultOption,
                    optionDisplayName: `-${name}`,
                    requestValue: () => value,
                });
                continue;
            }
        }

        // Check for -o [value]
        if (arg.startsWith('-') && arg.length === 2) {
            const shortNames = arg.slice(1);
            const defaultOption = optionCatalog.getByShortName(shortNames);
            if (defaultOption || !passUnknownOptions) {
                registerOption({
                    defaultOption,
                    optionDisplayName: `-${shortNames}`,
                    requestValue: () => workingArgs.shift(),
                });
                continue;
            }
        }

        // Check for -abc (condensed flags)
        if (arg.startsWith('-') && arg.length > 2) {
            const shortNames = arg.slice(1);
            const mappedCondensedFlags = shortNames.split('').map((shortName) => ({
                flagOption: optionCatalog.getByShortName(shortName),
                shortName,
            }));
            const areAllFlagsValid = mappedCondensedFlags.every(
                ({ flagOption: option }) => option !== null,
            );
            if (areAllFlagsValid || !passUnknownOptions) {
                mappedCondensedFlags.forEach(({ flagOption, shortName }) => {
                    if (!flagOption?.isType('boolean')) {
                        errors.push(
                            `Option -${shortName} in condensed flags option "-${shortNames}" must be a boolean. The option is defined as "${flagOption?.type}"`,
                        );
                        return;
                    }
                    registerOption({
                        defaultOption: flagOption,
                        optionDisplayName: `-${shortName}`,
                        requestValue: () => undefined,
                    });
                });
                continue;
            }
        }

        // everything else (including "-") is a positional argument
        positionalArgs.push(arg);
    }

    // Check for required options
    for (const option of optionCatalog.iterate()) {
        if (option.required && !option.isValueSet) {
            errors.push(`Option ${option.prettyDashedShortLongName} is required`);
        }
    }

    // Check for errors
    if (errors.length > 0) {
        return errors;
    }

    return {
        options: optionCatalog.buildScriptOptions(),
        restArgs: args.replace(positionalArgs),
    };
}
