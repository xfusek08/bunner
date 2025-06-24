import { existsSync } from 'node:fs';
import { join } from 'node:path';

import eachTemplateFile from './eachTemplateFile';

export default async function isScriptDirectoryInitialized(directory: string) {
    const templateFiles = await eachTemplateFile();
    return templateFiles.every(({ templateFileBaseName }) =>
        existsSync(join(directory, templateFileBaseName)),
    );
}
