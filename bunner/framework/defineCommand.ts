import { CommandDefinition } from "./types/CommandDefinition";
import { OptionDefinition } from "./types/OptionDefinition";

export default function defineCommand<
    Options extends readonly OptionDefinition[]
>(commandDefinition: CommandDefinition<Options>) {
    return commandDefinition;
}
