import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

type TemplateFileInfo = {
    templateFileBaseName: string;
    fullTemplatePath: string;
    templateFileContent: string;
    templateFileTransformed: string;
};

export default async function eachTemplateFile(): Promise<TemplateFileInfo[]> {
    const dir = import.meta.env.BUNNER_ENTRY_POINT_DIRECTORY;
    const templatesDir = join(dir, 'templates');
    const templateFiles = await readdir(templatesDir);
    const result: TemplateFileInfo[] = [];

    for (const file of templateFiles) {
        const sourcePath = join(templatesDir, file);
        const templateFileContent = await readFile(sourcePath, 'utf-8');
        const templateFileTransformed = templateFileContent.replace(/\$BUNNER_ROOT/g, dir);

        result.push({
            templateFileBaseName: file,
            fullTemplatePath: sourcePath,
            templateFileContent,
            templateFileTransformed,
        });
    }

    return result;
}
