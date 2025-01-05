
import EvaluatedOptions from "./EvaluatedOptions";
import { OptionDefinition } from "./OptionDefinition";
import ProcessRunResultPromise from "./ProcessRunResultPromise";
import ScriptArguments from "./ScriptArguments";

export type RunCommandCallback = (commandName: string, arg: string[]) => ProcessRunResultPromise;

export type CommandActionBaseArguments = {
    args: ScriptArguments,
    runCommand: RunCommandCallback,
};

type CommandAction<
    Options extends undefined|readonly OptionDefinition[],
    EOAttribute = Options extends readonly OptionDefinition[]
        ? { options: EvaluatedOptions<Options> }
        : {}
> = (_: CommandActionBaseArguments & EOAttribute) => ProcessRunResultPromise;

export default CommandAction;
