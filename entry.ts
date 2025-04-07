import { execSync } from 'child_process';
import { lstatSync } from 'fs';
import path from 'path';

import BunnerConst from './framework/const';
import executeCommandFromArguments from './framework/executeCommandFromArguments';
import executeCommandName from './framework/executeCommandIName';
import isScriptDirectoryInitialized from './framework/isScriptDirectoryInitialized';
import loadCommandsFromDirectory from './framework/loadCommandsFromDirectory';
import log from './framework/log';
import BunnerError from './framework/types/BunnerError';
import CommandCollection from './framework/types/CommandCollection';
import ScriptArguments from './framework/types/ScriptArguments';

try {
    const [firstARgument, scriptArguments] = ScriptArguments.initFromProcessArgv().popFirstArg();

    let fallbackCommandArguments = scriptArguments.replace([BunnerConst.HELP_COMMAND]);
    let isValidDirectory = true;

    try {
        isValidDirectory = !!firstARgument && lstatSync(firstARgument).isDirectory();
    } catch {
        log.warn(
            `The provided first argument "${firstARgument}" is not a valid directory, only built-in commands will be available.`,
        );
        isValidDirectory = false;
    }

    if (!isValidDirectory) {
        fallbackCommandArguments = fallbackCommandArguments.push('-a');
    }

    let commandCollection = CommandCollection.create(
        await loadCommandsFromDirectory({
            directory: path.resolve(__dirname, './bunner-commands'),
            defaultCategory: {
                id: 'bunner-internal',
                title: 'Bunner Internal Commands (primarily for framework development)',
                hidden: true,
            },
        }),
    );

    if (isValidDirectory && firstARgument) {
        if (!(await isScriptDirectoryInitialized(firstARgument))) {
            await executeCommandName({
                commandCollection,
                commandName: 'bunner-init',
                scriptArguments: scriptArguments.replace(['-D', firstARgument]),
            });

            try {
                execSync(`./run ${firstARgument} ${scriptArguments.asString()}`, {
                    cwd: scriptArguments.runDirectory,
                    stdio: 'inherit',
                });
                process.exit(0);
            } catch (error) {
                if (
                    error &&
                    typeof error === 'object' &&
                    'status' in error &&
                    typeof error.status === 'number'
                ) {
                    process.exit(error.status);
                }
                process.exit(1);
            }
        }

        const userCommandCollection = CommandCollection.create(
            await loadCommandsFromDirectory({ directory: path.resolve(__dirname, firstARgument) }),
        );

        commandCollection = CommandCollection.merge(userCommandCollection, commandCollection);
    }

    const errorCode =
        (await executeCommandFromArguments({
            scriptArguments,
            commandCollection,
            fallbackCommandArguments,
        })) ?? 0;

    process.exit(errorCode);
} catch (error) {
    if (error instanceof BunnerError) {
        log.error(error.message);
        process.exit(error.code);
    }

    console.error('An unexpected error occurred', error);
    process.exit(1);
}
