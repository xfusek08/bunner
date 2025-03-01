import executeCommandName from './executeCommandIName';
import log from './log';
import parseArguments from './parseArguments';
import Command from './types/Command';
import CommandCollection from './types/CommandCollection';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';

export default async function executeCommandInstance({
    command,
    scriptArguments,
    commandCollection,
}: {
    command: Command;
    scriptArguments: ScriptArguments;
    commandCollection: CommandCollection;
}): ProcessRunResultPromise {
    const runCommand = (commandName: string, args: string[] = []) => {
        return executeCommandName({
            commandName: commandName,
            scriptArguments: scriptArguments.replace(args),
            commandCollection: commandCollection,
        });
    };

    const parseResult = await parseArguments({
        args: scriptArguments,
        definitions: command.optionsDefinition,
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
