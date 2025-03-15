import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'bun';

import { defineCommand } from '../framework';

export default defineCommand({
    command: 'bunner-init',
    description: 'Sets up the current directory for a development of bunner scripts',
    options: [
        {
            short: 'D',
            long: 'directory',
            description: 'Directory to initialize',
            type: 'string',
            required: false,
            defaultValue: '.',
        },
    ] as const,
    action: async ({ options }) => {
        const dir = import.meta.env.BUNNER_ENTRY_POINT_DIRECTORY;
        const templatesDir = join(dir, 'templates');

        // Get all files in the templates directory
        const templateFiles = await readdir(templatesDir);

        // Process each template file
        for (const file of templateFiles) {
            const sourcePath = join(templatesDir, file);
            const targetPath = join(options.directory, file);

            await $`cat "${sourcePath}" | sed "s|\$BUNNER_ROOT|${dir}|g" > "${targetPath}"`;
        }

        // Generate .gitignore file
        const gitignoreContent = templateFiles.join('\n');
        const gitignorePath = join(options.directory, '.gitignore');
        await writeFile(gitignorePath, gitignoreContent);

        await $`cd ${dir} && bun install`;
    },
});
