import Command from "./types/Command";
import CommandCollection from "./types/CommandCollection";
import ScriptArguments from "./types/ScriptArguments";
import executeCommandName from "./executeCommandIName";
import log from "./log";
import ProcessRunResultPromise from "./types/ProcessRunResultPromise";

export default async function executeCommandInstance({
    command,
    scriptArguments,
    commandCollection,
}:{
    command: Command,
    scriptArguments: ScriptArguments,
    commandCollection: CommandCollection,
}): ProcessRunResultPromise {
    const runCommand = (commandName: string, args: string[] = []) => {
        return executeCommandName({
            commandName: commandName,
            scriptArguments: scriptArguments.replace(args),
            commandCollection: commandCollection,
        });
    };
    
    try {
        if (command.hasOptions) {
            const { options, restArgs } = await parseOptions(scriptArguments, command.optionsDefinition);
            return await command.action({ args: restArgs, options, runCommand }) ?? 0;
        } else {
            return await command.action({ args: scriptArguments, runCommand }) ?? 0;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            log.error(error.message);
        } else {
            log.error("An error occurred while parsing options");
        }
        return 1;
    }
}
