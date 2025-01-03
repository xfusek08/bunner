import Command from "./types/Command";
import CommandCollection from "./types/CommandCollection";
import BunnerConst from "./const";
import ScriptArguments from "./types/ScriptArguments";
import log from "./log";

export default async function executeCommand({
    command,
    scriptArguments,
    commandCollection,
}:{
    command: Command,
    scriptArguments: ScriptArguments,
    commandCollection: CommandCollection,
}): Promise<number|void> {
    if (command.hasOptions) {
        const [options, restArgs] = scriptArguments.parseOptions(command.optionsDefinition);
        if (options instanceof Error) {
            log.error(options.message);
            process.exit(1);
        }
        return await command.action({ args: restArgs, options });
    } else {
        return await command.action({ args: scriptArguments, options: undefined });
    }
    
}
