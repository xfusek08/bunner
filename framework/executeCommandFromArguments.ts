import executeCommandInstance from './executeCommandInstance';
import log from './log';
import CommandCollection from './types/CommandCollection';
import ProcessRunResultPromise from './types/ProcessRunResultPromise';
import ScriptArguments from './types/ScriptArguments';
import isEmpty from './utils/isEmpty';

export default async function executeCommandFromArguments({
    scriptArguments,
    commandCollection,
    fallbackCommandArguments,
}: {
    scriptArguments: ScriptArguments;
    commandCollection: CommandCollection;
    fallbackCommandArguments?: ScriptArguments;
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

    if (fallbackCommandArguments) {
        await executeCommandFromArguments({
            scriptArguments: fallbackCommandArguments,
            commandCollection: commandCollection,
        });
    }

    return 1;
}
