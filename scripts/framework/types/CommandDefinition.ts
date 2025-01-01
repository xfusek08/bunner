import CommandOptionDefinition, { SpecificOptionsCommandDefinitionArray } from "./CommandOptionDefinition";
import EvaluatedOptions from "./EvaluatedOptions";
import ScriptArguments from "./ScriptArguments";

export interface CommandDefinitionBase {
    command: string,
    description: string,
}

export interface CommandDefinitionWithOptions<T extends readonly CommandOptionDefinition[]> extends CommandDefinitionBase {
    options: SpecificOptionsCommandDefinitionArray<T>,
    action: (_: { args: ScriptArguments, options: EvaluatedOptions<T> }) => Promise<never>;
}

export interface CommandDefinitionWithoutOptions extends CommandDefinitionBase {
    action: (_: { args: ScriptArguments }) => Promise<never>;
}
