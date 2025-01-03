
import { $ } from "bun";
import CommandDefinition from "./types/CommandDefinition";
import Command from "./types/Command";
import CategoryDescription from "./types/CategoryDescription";
import log from "./log";

export default async function loadCommandsFromDirectory({
    directory,
    defaultCategory = null,
}: {
    directory: string,
    defaultCategory?: null|string|CategoryDescription,
}) {
    const { stdout } = await $`ls ${directory}`;
    const commandFiles = stdout.toString().split('\n');
    
    const res: Command[] = [];
    
    for (const commandFile of commandFiles) {
        if (commandFile === '') {
            continue;
        }
        const { default: commandRaw } = await import(`${directory}/${commandFile}`);
        let definition = commandRaw as CommandDefinition;
        if (defaultCategory !== null && !('category' in definition)) {
            definition = { ...definition, category: defaultCategory };
        }
        const command = Command.fromDefinition(definition);
        if (command instanceof Error) {
            log.warn(`Failed to load command from ${commandFile}: ${command.message}`);
            continue;
        }
        res.push(command);
    }
    return res;
}