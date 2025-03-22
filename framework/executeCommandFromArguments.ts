import executeCommandInstance from './executeCommandInstance';
import log from './log';
import CommandCollection from './types/CommandCollection';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';
import isEmpty from './utils/isEmpty';

export default async function executeCommandFromArguments({
    scriptArguments,
    commandCollection,
    fallbackCommandName,
}: {
    scriptArguments: ScriptArguments;
    commandCollection: CommandCollection;
    fallbackCommandName?: string;
}): ProcessRunResultPromise {
    const [commandNameFromArgs, restCommandArgs] = scriptArguments.popFirstArg();

    if (!isEmpty(commandNameFromArgs)) {
        const command = commandCollection.get(commandNameFromArgs);
        if (command) {
            return (
                (await executeCommandInstance({
                    command,
                    commandCollection,
                    scriptArguments: restCommandArgs,
                })) ?? 0
            );
        } else {
            log.error(`Command "${commandNameFromArgs}" not found`);
        }
    }

    if (fallbackCommandName) {
        const fallbackCommand = commandCollection.get(fallbackCommandName);
        if (fallbackCommand) {
            await executeCommandInstance({
                command: fallbackCommand,
                commandCollection: commandCollection,
                scriptArguments: scriptArguments.clear(),
            });
        }
    }

    return 1;
}
