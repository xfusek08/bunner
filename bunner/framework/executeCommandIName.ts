import CommandCollection from "./types/CommandCollection";
import ScriptArguments from "./types/ScriptArguments";
import log from "./log";
import executeCommandInstance from "./executeCommandInstance";
import ProcessRunResultPromise from "./types/ProcessRunResultPromise";

export default async function executeCommandName({
    commandName,
    scriptArguments,
    commandCollection,
    fallbackCommandName,
}:{
    commandName: string,
    scriptArguments: ScriptArguments,
    commandCollection: CommandCollection,
    fallbackCommandName?: string,
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
    
    return await executeCommandInstance({
        command,
        commandCollection,
        scriptArguments,
    }) ?? 0;
}
