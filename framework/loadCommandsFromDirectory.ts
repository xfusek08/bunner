import { readdir } from 'fs/promises';

import log from './log';
import CategoryDescription from './types/CategoryDescription';
import Command from './types/Command';
import { CommandDefinition } from './types/CommandDefinition';

export default async function loadCommandsFromDirectory({
    directory,
    defaultCategory = null,
}: {
    directory: string;
    defaultCategory?: null | string | CategoryDescription;
}) {
    const commandFiles = await readdir(directory);

    const res: Command[] = [];
    for (const commandFile of commandFiles) {
        if (commandFile === '') {
            continue;
        }
        const { default: commandRaw } = await import(
            `${directory}/${commandFile}`
        );
        let definition = commandRaw as CommandDefinition<undefined>;
        if (defaultCategory !== null && !('category' in definition)) {
            definition = { ...definition, category: defaultCategory };
        }
        const command = Command.fromDefinition(definition);
        if (command instanceof Error) {
            log.warn(
                `Failed to load command from ${commandFile}: ${command.message}`,
            );
            continue;
        }
        res.push(command);
    }
    return res;
}
