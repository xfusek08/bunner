import executeCommandInstance from './executeCommandInstance';
import log from './log';
import CommandCollection from './types/CommandCollection';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';

export default async function executeCommandName({
    commandCollection,
    commandName,
    fallbackCommandName,
    scriptArguments,
}: {
    commandCollection: CommandCollection;
    commandName: string;
    fallbackCommandName?: string;
    scriptArguments: ScriptArguments;
}): ProcessRunResultPromise {
    const command = commandCollection.get(commandName ?? '');
    if (!command) {
        log.error(`Command "${commandName}" not found`);
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

    return (
        (await executeCommandInstance({
            command,
            commandCollection,
            scriptArguments,
        })) ?? 0
    );
}
