import { CommandDefinitionWithOptions, CommandDefinitionWithoutOptions } from "./types/CommandDefinition";
import CommandOptionDefinition from "./types/CommandOptionDefinition";

function defineCommand<T extends readonly CommandOptionDefinition[]>(commandDefinition: CommandDefinitionWithOptions<T>): CommandDefinitionWithOptions<T>;
function defineCommand(commandDefinition: CommandDefinitionWithoutOptions): CommandDefinitionWithoutOptions;
function defineCommand(commandDefinition: any) {
    return commandDefinition;
}

export default defineCommand;
