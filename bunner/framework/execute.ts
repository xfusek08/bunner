import CommandCollection from "./types/CommandCollection";
import ScriptArguments from "./types/ScriptArguments";
import log from "./log";
import executeCommand from "./executeCommand";

export default async function execute({
    scriptArguments,
    commandCollection,
    fallbackCommandName,
}:{
    scriptArguments: ScriptArguments,
    commandCollection: CommandCollection,
    fallbackCommandName?: string,
}): Promise<never> {
    const [commandName, restCommandArgs] = scriptArguments.popFirstArg();
    
    const command = commandCollection.get(commandName ?? '');
    if (!command) {
        log.error(`Command "${commandName}" not found`);
        if (fallbackCommandName) {
            const fallbackCommand = commandCollection.get(fallbackCommandName);
            if (fallbackCommand) {
                await executeCommand({
                    command: fallbackCommand,
                    commandCollection: commandCollection,
                    scriptArguments: scriptArguments.clear(),
                });
            }
        }
        process.exit(1);
    }
    
    const res = await executeCommand({
        command,
        commandCollection,
        scriptArguments: restCommandArgs,
    }) ?? 0;
    
    process.exit(res);
}
