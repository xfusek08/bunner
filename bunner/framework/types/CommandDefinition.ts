import CategoryDescription from "./CategoryDescription";
import CommandAction from "./CommandAction";
import { OptionDefinition } from "./OptionDefinition";

export interface CommandDefinition<Options extends undefined|readonly OptionDefinition[]> {
    readonly command: string;
    readonly description: string;
    readonly category?: string|CategoryDescription;
    readonly options?: Options;
    readonly action: CommandAction<Options>;
}
