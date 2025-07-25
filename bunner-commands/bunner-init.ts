import { existsSync } from 'node:fs';
import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'bun';

import { defineCommand, log } from '../framework';
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

        for (const { templateFileBaseName, templateFileTransformed } of await eachTemplateFile()) {
            const targetPath = join(options.directory, templateFileBaseName);
            templateFiles.push(templateFileBaseName);

            if (!existsSync(targetPath)) {
                log.info(`Creating template file: ${templateFileBaseName} in ${options.directory}`);
                await writeFile(targetPath, templateFileTransformed);
                await chmod(targetPath, 0o666); // Set 666 permissions
            }
        }

        // Generate .gitignore file
        const gitignorePath = join(options.directory, '.gitignore');
        if (!existsSync(gitignorePath)) {
            log.info(`Creating .gitignore file in ${options.directory}`);
            const gitignoreContent = templateFiles.join('\n');
            await writeFile(gitignorePath, gitignoreContent);
            await chmod(gitignorePath, 0o666); // Set 666 permissions on .gitignore
        }

        if (options.install) {
            log.info(
                `Installing dependencies for bunner scripts development in ${options.directory}`,
            );
            await $`cd ${import.meta.env.BUNNER_ENTRY_POINT_DIRECTORY} && bun install`;
        }
    },
});
