import CommandCollection from './CommandCollection';
import EvaluatedOptions from './EvaluatedOptions';
import { OptionDefinitions } from './OptionDefinition';
import ProcessRunResultPromise from './ProcessRunResultPromise';
import ScriptArguments from './ScriptArguments';

export type RunCommandCallback = (
    commandName: string,
    arg: string[],
) => ProcessRunResultPromise;

export type CommandActionBaseArguments = {
    args: ScriptArguments;
    runCommand: RunCommandCallback;
    commandCollection: CommandCollection;
};

type CommandAction<
    Options extends undefined | OptionDefinitions,
    EOAttribute = Options extends OptionDefinitions
        ? { options: EvaluatedOptions<Options> }
        : object,
> = (_: CommandActionBaseArguments & EOAttribute) => ProcessRunResultPromise;

export default CommandAction;
