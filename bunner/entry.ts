import loadCommandsFromDirectory from "./framework/loadCommandsFromDirectory";
import CommandCollection from "./framework/types/CommandCollection";
import BunnerConst from "./framework/const";
import ScriptArguments from "./framework/types/ScriptArguments";
import executeCommandFromArguments from "./framework/executeCommandFromArguments";

const scriptArguments = ScriptArguments.initFromProcessArgv();

const bunnerCommandsCollection = CommandCollection.create(
    await loadCommandsFromDirectory({
        directory: './framework/bunner-commands',
        defaultCategory: {
            id: 'bunner-internal',
            title: 'Bunner Internal Commands (primarily for framework development)',
        },
    })
);

const userCommandCollection = CommandCollection.create(
    await loadCommandsFromDirectory({
        directory:'./commands',
        defaultCategory: {
            id: 'user-defined',
            title: `User-defined Commands in \"${scriptArguments.runDirectory}/command\"`,
        },
    })
);

const commandCollection = CommandCollection.merge(
    bunnerCommandsCollection,
    userCommandCollection
);

const errorCode = await executeCommandFromArguments({
    scriptArguments,
    commandCollection,
    fallbackCommandName: BunnerConst.HELP_COMMAND,
}) ?? 0;

process.exit(errorCode);
