import CommandCollection from "./types/CommandCollection";
import ScriptArguments from "./types/ScriptArguments";
import log from "./log";
import executeCommandInstance from "./executeCommandInstance";
import ProcessRunResultPromise from "./types/ProcessRunResultPromise";

export default async function executeCommandFromArguments({
    scriptArguments,
    commandCollection,
    fallbackCommandName,
}:{
    scriptArguments: ScriptArguments,
    commandCollection: CommandCollection,
    fallbackCommandName?: string,
}): ProcessRunResultPromise {
    const [commandName, restCommandArgs] = scriptArguments.popFirstArg();
    
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
        scriptArguments: restCommandArgs,
    }) ?? 0;
}
