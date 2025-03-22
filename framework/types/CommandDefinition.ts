import CategoryDescription from './CategoryDescription';
import CommandAction from './CommandAction';
import { OptionDefinitions } from './OptionDefinition';

export default interface CommandDefinition<O extends undefined | OptionDefinitions> {
    readonly command: string;
    readonly description: string;
    readonly category?: string | CategoryDescription;
    readonly options?: O;
    readonly passUnknownOptions?: boolean;
    readonly action: CommandAction<O>;
}

export const CommandDefinitionHelper = {
    isCommandDefinition<O extends undefined | OptionDefinitions>(
        obj: unknown,
    ): obj is CommandDefinition<O> {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'command' in obj &&
            'description' in obj &&
            'action' in obj
        );
    },

    hasCategory<O extends undefined | OptionDefinitions>(
        obj: CommandDefinition<O>,
    ): obj is CommandDefinition<O> & { category: string | CategoryDescription } {
        return 'category' in obj;
    },
} as const;
