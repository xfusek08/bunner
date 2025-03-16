import CategoryDescription from './CategoryDescription';
import CommandAction from './CommandAction';
import { OptionDefinitions } from './OptionDefinition';

export interface CommandDefinition<O extends undefined | OptionDefinitions> {
    readonly command: string;
    readonly description: string;
    readonly category?: string | CategoryDescription;
    readonly options?: O;
    readonly passUnknownOptions?: boolean;
    readonly action: CommandAction<O>;
}
