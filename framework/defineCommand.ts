import { CommandDefinition } from './types/CommandDefinition';
import { OptionDefinitions } from './types/OptionDefinition';

export default function defineCommand<Options extends OptionDefinitions>(
    commandDefinition: CommandDefinition<Options>,
) {
    return commandDefinition;
}
