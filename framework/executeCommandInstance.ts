import BunnerConst from './const';
import executeCommandName from './executeCommandIName';
import log from './log';
import parseArguments from './parseArguments';
import Command from './types/Command';
import CommandCollection from './types/CommandCollection';
import { optionBygName, OptionDefinition } from './types/OptionDefinition';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';

const DefaultHelpOption: OptionDefinition = {
    description: 'Show help',
    type: 'boolean',
    long: 'help',
    short: 'h',
};

export default async function executeCommandInstance({
    command,
    commandCollection,
    scriptArguments,
}: {
    command: Command;
    commandCollection: CommandCollection;
    scriptArguments: ScriptArguments;
}): ProcessRunResultPromise {
    const runCommand = async (commandName: string, args: string[] = []) => {
        return executeCommandName({
            commandCollection,
            commandName,
            scriptArguments: scriptArguments.replace(args),
        });
    };

    const hasHelpOption =
        !!optionBygName(command.optionsDefinition, 'h') ||
        !!optionBygName(command.optionsDefinition, 'help');

    const parseResult = await parseArguments({
        args: scriptArguments,
        definitions: hasHelpOption
            ? command.optionsDefinition
            : [...command.optionsDefinition, DefaultHelpOption],
        passUnknownOptions: command.passUnknownOptions,
    });

    if (parseResult instanceof Array) {
        parseResult.forEach((error) => log.error(error));
        return 1;
    }

    const { restArgs, options } = parseResult;

    if (!hasHelpOption && options.help) {
        return executeCommandName({
            commandName: BunnerConst.HELP_COMMAND,
            commandCollection,
            scriptArguments: scriptArguments.replace([command.command]),
        });
    }

    return (
        (await command.action({
            args: restArgs,
            options,
            runCommand,
            commandCollection,
        })) ?? 0
    );
}
