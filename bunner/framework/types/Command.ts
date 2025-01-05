import CategoryDescription from "./CategoryDescription";
import CommandAction from "./CommandAction";
import CommandDefinition from "./CommandDefinition";
import OptionDefinition from "./OptionDefinition";
import ScriptArguments from "./ScriptArguments";
import ScriptOptions from "./ScriptOptions";

export default class Command {
    private constructor(
        public readonly command: string,
        public readonly description: string,
        public readonly category: string|null|CategoryDescription,
        public readonly optionsDefinition: OptionDefinition[],
        public readonly action: CommandAction,
    ) {}
    
    public static fromDefinition(definition: CommandDefinition): Command|Error {
        return new Command(
            definition.command,
            definition.description,
            ('category' in definition) ? definition.category ?? null : null,
            ('options' in definition) ? definition.options : [],
            definition.action as CommandAction, // This type cas is because action has different call signatures for different CommandDefinition variants
        );
    }
    
    public get hasOptions() { return this.optionsDefinition.length > 0; }
}
