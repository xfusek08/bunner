import Option from './Option';
import { OptionDefinitions } from './OptionDefinition';
import ScriptOptions from './ScriptOptions';

export default class OptionCatalog {
    private constructor(private readonly options: Record<string, Option>) {}

    public static fromOptions(options: Option[]): OptionCatalog {
        const catalog = new OptionCatalog({});
        options.forEach((option) => catalog.register(option));
        return catalog;
    }

    public static fromDefinitions(definitions: OptionDefinitions): OptionCatalog {
        const catalog = new OptionCatalog({});
        definitions.forEach((definition) => catalog.register(Option.create(definition)));
        return catalog;
    }

    public getByLongName(name: string): Option | null {
        return Object.values(this.options).find((option) => option.long === name) ?? null;
    }

    public getByShortName(name: string): Option | null {
        return Object.values(this.options).find((option) => option.short === name) ?? null;
    }

    public getByIdentifier(identifier: string): Option | null {
        return this.options[identifier] ?? null;
    }

    public register(option: Option): void {
        this.options[option.identifier] = option;
    }

    public buildScriptOptions(): ScriptOptions {
        return Object.values(this.options).reduce((acc, option) => {
            acc[option.identifier] = option.value;
            return acc;
        }, {} as ScriptOptions);
    }

    public iterate(): Iterable<Option> {
        return Object.values(this.options);
    }
}
