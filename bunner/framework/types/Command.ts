import CategoryDescription from "./CategoryDescription";
import CommandDefinition from "./CommandDefinition";
import CommandOptionDefinition from "./CommandOptionDefinition";
import ScriptArguments from "./ScriptArguments";
import ScriptOptions from "./ScriptOptions";

type ActionFunction = (_: { args: ScriptArguments, options?: ScriptOptions }) => Promise<number|void>;

export default class Command {
    private constructor(
        public readonly command: string,
        public readonly description: string,
        public readonly category: string|null|CategoryDescription,
        public readonly optionsDefinition: CommandOptionDefinition[],
        public readonly action: ActionFunction,
    ) {}
    
    public static fromDefinition(definition: CommandDefinition): Command|Error {
        return new Command(
            definition.command,
            definition.description,
            ('category' in definition) ? definition.category ?? null : null,
            ('options' in definition) ? definition.options : [],
            definition.action as ActionFunction, // This type cas is because action has different call signatures for different CommandDefinition variants
        );
    }
    
    public get hasOptions() { return this.optionsDefinition.length > 0; }
}
