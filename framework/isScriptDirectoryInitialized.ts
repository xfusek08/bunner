import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import eachTemplateFile from './eachTemplateFile';
import log from './log';

export default async function isScriptDirectoryInitialized(directory: string) {
    const templateFiles = await eachTemplateFile();

    for (const { templateFileBaseName, templateFileTransformed } of templateFiles) {
        const targetPath = join(directory, templateFileBaseName);

        if (!existsSync(targetPath)) {
            console.log(`File "${targetPath}" does not exist.`);
            return false;
        }

        let targetFileContent;

        try {
            targetFileContent = await readFile(targetPath, 'utf-8');
        } catch (error) {
            log.error(`Error with file ${targetPath}`, false, error);
            return false;
        }

        if (targetFileContent !== templateFileTransformed) {
            return false;
        }
    }

    return true;
}
