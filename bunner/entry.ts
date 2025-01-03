import loadCommandsFromDirectory from "./framework/loadCommandsFromDirectory";
import CommandCollection from "./framework/types/CommandCollection";
import execute from "./framework/execute";
import BunnerConst from "./framework/const";
import ScriptArguments from "./framework/types/ScriptArguments";

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

execute({
    scriptArguments,
    commandCollection,
    fallbackCommand: BunnerConst.HELP_COMMAND,
});
