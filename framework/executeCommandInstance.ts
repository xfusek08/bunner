import executeCommandName from './executeCommandIName';
import log from './log';
import parseArguments from './parseArguments';
import Command from './types/Command';
import CommandCollection from './types/CommandCollection';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';

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
            commandCollection: commandCollection,
            commandName: commandName,
            scriptArguments: scriptArguments.replace(args),
        });
    };

    const parseResult = await parseArguments({
        args: scriptArguments,
        definitions: command.optionsDefinition,
        passUnknownOptions: command.passUnknownOptions,
    });

    if (parseResult instanceof Array) {
        parseResult.forEach((error) => log.error(error));
        return 1;
    }

    const { restArgs, options } = parseResult;

    return (
        (await command.action({
            args: restArgs,
            options,
            runCommand,
            commandCollection,
        })) ?? 0
    );
}
