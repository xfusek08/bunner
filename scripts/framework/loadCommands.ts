
import { $ } from "bun";
import CommandDefinition from "./types/CommandDefinition";

export default async function loadCommands(directory: string): Promise<Record<string, CommandDefinition>> {
    const { stdout } = await $`ls ${directory}`;
    const commandFiles = stdout.toString().split('\n');
    
    const res: Record<string, CommandDefinition> = {};
    for (const commandFile of commandFiles) {
        if (commandFile === '') {
            continue;
        }
        const { default: commandRaw } = await import(`${directory}/${commandFile}`);
        const command = commandRaw as CommandDefinition;
        res[command.command] = command;
    }
    return res;
}
