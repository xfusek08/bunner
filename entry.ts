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

    if (!firstARgument || !lstatSync(firstARgument).isDirectory()) {
        log.error(
            'Invalid command directory path, please provide a directory from which to load commands as a first argument',
        );
        process.exit(1);
    }

    const userCommandCollection = CommandCollection.create(
        await loadCommandsFromDirectory({
            directory: path.resolve(__dirname, firstARgument),
        }),
    );

    const bunnerCommandsCollection = CommandCollection.create(
        await loadCommandsFromDirectory({
            directory: path.resolve(__dirname, './bunner-commands'),
            defaultCategory: {
                id: 'bunner-internal',
                title: 'Bunner Internal Commands (primarily for framework development)',
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
            fallbackCommandName: BunnerConst.HELP_COMMAND,
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
