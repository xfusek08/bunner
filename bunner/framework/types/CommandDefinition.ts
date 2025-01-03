import CategoryDescription from "./CategoryDescription";
import CommandOptionDefinition, { SpecificOptionsCommandDefinitionArray } from "./CommandOptionDefinition";
import EvaluatedOptions from "./EvaluatedOptions";
import ScriptArguments from "./ScriptArguments";

export interface CommandDefinitionBase {
    readonly command: string;
    readonly description: string;
    readonly category?: string|CategoryDescription;
}

export interface CommandDefinitionWithOptions<
    T extends readonly CommandOptionDefinition[],
    EO = EvaluatedOptions<T>
> extends CommandDefinitionBase {
    readonly options: {} extends EO ? never : T;
    readonly action: (_: { args: ScriptArguments, context: ScriptContext, options: EO }) => Promise<number|void>;
}

export interface CommandDefinitionWithoutOptions extends CommandDefinitionBase {
    readonly action: (_: { args: ScriptArguments, context: ScriptContext, }) => Promise<number|void>;
}

type CommandDefinition = CommandDefinitionWithoutOptions | CommandDefinitionWithOptions<readonly CommandOptionDefinition[]>;

export default CommandDefinition;
