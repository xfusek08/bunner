import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'bun';

import { defineCommand } from '../framework';
import eachTemplateFile from '../framework/eachTemplateFile';

export default defineCommand({
    command: 'bunner-init',
    description: 'Sets up the given directory for a development of bunner scripts',
    options: [
        {
            short: 'D',
            long: 'directory',
            description: 'Directory to initialize',
            type: 'string',
            required: true,
        },
        {
            short: 'i',
            long: 'install',
            description: 'Install dependencies for bunner scripts development',
            type: 'boolean',
            required: false,
            default: false,
        },
    ] as const,
    action: async ({ options }) => {
        const templateFiles: string[] = [];

        (await eachTemplateFile()).forEach(
            async ({ templateFileBaseName, templateFileTransformed }) => {
                templateFiles.push(templateFileBaseName);
                const targetPath = join(options.directory, templateFileBaseName);
                await writeFile(targetPath, templateFileTransformed);
            },
        );

        // Generate .gitignore file
        const gitignoreContent = templateFiles.join('\n');
        const gitignorePath = join(options.directory, '.gitignore');
        await writeFile(gitignorePath, gitignoreContent);

        if (options.install) {
            await $`cd ${import.meta.env.BUNNER_ENTRY_POINT_DIRECTORY} && bun install`;
        }
    },
});
