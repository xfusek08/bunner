import { $ } from "bun";
import ScriptArguments from "./framework/types/ScriptArguments";
import { exitWithScheduledCommand } from "./framework/exitWithScheduledCommand";
import loadCommands from "./framework/loadCommands";

const [
    bunExecutable,
    scriptEntryPoint,
    ...args
] = process.argv;

const scriptArguments: ScriptArguments = {
    bunExecutable,
    scriptEntryPoint,
    args,
};

if (args.length === 0) {
    console.log('No arguments provided');
    process.exit(1);
}

const commands = await loadCommands('./commands');

switch (args[0]) {
    case 'bun-bash': {
        exitWithScheduledCommand('_run_in_docker_bun bash');
    }
    case 'bun-init-dev': {
        const { exitCode } = await $`cd scripts && bun add -d @types/bun`;
        process.exit(exitCode);
    }
    case 'bun-clean-dev': {
        const { exitCode } = await $`cd scripts && rm -rf node_modules bun.lockb package.json`;
        process.exit(exitCode);
    }
    default:
        console.log('default');
        break;
}
