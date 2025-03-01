import { EXIT_CODE_SCHEDULED_COMMAND } from './constants';

export function exitWithScheduledCommand(command: string): never {
    console.log(command);
    process.exit(EXIT_CODE_SCHEDULED_COMMAND);
}
