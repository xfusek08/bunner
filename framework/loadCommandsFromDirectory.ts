import { readdir } from 'fs/promises';

import log from './log';
import CategoryDescription from './types/CategoryDescription';
import Command from './types/Command';
import { CommandDefinitionHelper } from './types/CommandDefinition';

export default async function loadCommandsFromDirectory({
    directory,
    defaultCategory = null,
}: {
    directory: string;
    defaultCategory?: null | string | CategoryDescription;
}) {
    const allFiles = await readdir(directory);
    const commandFiles = allFiles.filter((file) => file.endsWith('.ts'));

    const res: Command[] = [];
    for (const commandFile of commandFiles) {
        if (commandFile === '') {
            continue;
        }
        const { default: commandDefinition } = await import(`${directory}/${commandFile}`);

        if (!CommandDefinitionHelper.isCommandDefinition(commandDefinition)) {
            log.warn(`Failed to load command from ${commandFile}: not a valid command definition.`);
        }

        if (!CommandDefinitionHelper.hasCategory(commandDefinition)) {
            commandDefinition.category = defaultCategory;
        }

        const command = Command.fromDefinition(commandDefinition);
        if (command instanceof Error) {
            log.warn(`Failed to load command from ${commandFile}: ${command.message}`);
            continue;
        }

        res.push(command);
    }
    return res;
}
