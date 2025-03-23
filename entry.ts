import { lstatSync } from 'fs';
import path from 'path';

import BunnerConst from './framework/const';
import executeCommandFromArguments from './framework/executeCommandFromArguments';
import loadCommandsFromDirectory from './framework/loadCommandsFromDirectory';
import log from './framework/log';
import BunnerError from './framework/types/BunnerError';
import CommandCollection from './framework/types/CommandCollection';
import ScriptArguments from './framework/types/ScriptArguments';

try {
    const [firstARgument, scriptArguments] = ScriptArguments.initFromProcessArgv().popFirstArg();

    let userCommandCollection = CommandCollection.create([]);
    let fallbackCommandArguments = scriptArguments.replace([BunnerConst.HELP_COMMAND]);
    let isValidDirectory = false;

    if (firstARgument) {
        try {
            isValidDirectory = lstatSync(firstARgument).isDirectory();
        } catch {
            log.error(`The provided command directory "${firstARgument}" is not valid directory.`);
            isValidDirectory = false;
        }
    } else {
        log.warn('No command directory provided. Only built-in commands will be available.');
    }

    if (!isValidDirectory) {
        fallbackCommandArguments = fallbackCommandArguments.push('-a');
    } else if (firstARgument) {
        userCommandCollection = CommandCollection.create(
            await loadCommandsFromDirectory({
                directory: path.resolve(__dirname, firstARgument),
            }),
        );
    } else {
        throw new BunnerError('Unexpected error - cannot resolve command directory', 1);
    }

    const bunnerCommandsCollection = CommandCollection.create(
        await loadCommandsFromDirectory({
            directory: path.resolve(__dirname, './bunner-commands'),
            defaultCategory: {
                id: 'bunner-internal',
                title: 'Bunner Internal Commands (primarily for framework development)',
                hidden: true,
            },
        }),
    );

    const commandCollection = CommandCollection.merge(
        userCommandCollection,
        bunnerCommandsCollection,
    );

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
