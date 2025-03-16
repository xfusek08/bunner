import CategoryDescription from './CategoryDescription';
import CommandAction from './CommandAction';
import { CommandDefinition } from './CommandDefinition';
import { OptionDefinitions } from './OptionDefinition';

export default class Command {
    private constructor(
        public readonly command: string,
        public readonly description: string,
        public readonly category: string | null | CategoryDescription,
        public readonly optionsDefinition: OptionDefinitions,
        public readonly passUnknownOptions: boolean = false,
        public readonly action: CommandAction<OptionDefinitions>,
    ) {}

    public static fromDefinition(
        definition: CommandDefinition<undefined | OptionDefinitions>,
    ): Command | Error {
        return new Command(
            definition.command,
            definition.description,
            'category' in definition ? (definition.category ?? null) : null,
            definition.options ?? [],
            definition.passUnknownOptions,
            definition.action as CommandAction<OptionDefinitions>, // This type cas is because action has different call signatures for different CommandDefinition variants
        );
    }

    public get hasOptions() {
        return this.optionsDefinition.length > 0;
    }
}
