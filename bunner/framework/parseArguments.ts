
import OptionCatalog from "./types/OptionCatalog";
import { OptionDefinition } from "./types/OptionDefinition";
import Option from "./types/Option";
import ScriptArguments from "./types/ScriptArguments";
import ScriptOptions from "./types/ScriptOptions";

type Props = {
    args: ScriptArguments,
    definitions: OptionDefinition[],
};

type SuccessfulResult = {
    options: ScriptOptions,
    restArgs: ScriptArguments,
}

type ErrorResult = string[];

type Result = SuccessfulResult | ErrorResult;

export default function parseArguments({
    args,
    definitions,
}: Props): Result {
    const optionCatalog = OptionCatalog.fromDefinitions(definitions);
    const workingArgs = args.args.slice();
    const positionalArgs: string[] = [];
    const errors: ErrorResult = [];
    
    const registerOption = (
        optionName: string,
        defaultOption: Option|null,
        requestValue: () => string|undefined
    ) => {
        if (!defaultOption) {
            errors.push(`Unknown option: ${optionName}`);
            return ;
        }
        
        if (defaultOption.isType("boolean")) {
            optionCatalog.register(defaultOption.withValue(true));
            return;
        }
        
        const strValue = requestValue();
        if (!strValue) {
            errors.push(`Option ${defaultOption.prettyDashedShortLongName} must have a value`);
            return;
        }
        
        const value = defaultOption.parseValue(strValue);
        if (value instanceof Error) {
            errors.push(value.message);
            return
        }
        
        const finalOption = defaultOption.withValue(value);
        if (finalOption instanceof Error) {
            errors.push(finalOption.message);
            return;
        }
        
        optionCatalog.register(finalOption);
        return;
    };
    
    while (workingArgs.length > 0) {
        let arg = workingArgs.shift()!;
        
        if (arg.startsWith('--')) {
            const [name, value] = arg.slice(2).split('=');
            const defaultOption = optionCatalog.getByLongName(name);
            registerOption(name, defaultOption, () => value ?? workingArgs.shift());
            continue;
        }
        
        if (arg.startsWith('-')) {
            const shortName = arg;
            const defaultOption = optionCatalog.getByShortName(shortName);
            registerOption(shortName, defaultOption, () => workingArgs.shift());
            continue;
        }
        
        positionalArgs.push(arg);
    }
    
    if (errors.length > 0) {
        return errors;
    }
    
    return {
        options: optionCatalog.buildScriptOptions(),
        restArgs: args.replace(positionalArgs),
    };
}
