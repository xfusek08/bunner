import TextBuilder from '../text-rendering/TextBuilder';
import Command from '../types/Command';
import { CategoryIteratorItem } from '../types/CommandCollection';
import Option from '../types/Option';
import { OptionType } from '../types/OptionType';
import OptionValue from '../types/OptionValue';
import isEmpty from '../utils/isEmpty';

export default class Formatter {
    static readonly YELLOW = '#ffd700';
    static readonly WHITE = '#ffffff';
    static readonly BLUE_BRIGHT = '#87ceeb';
    static readonly GREEN = '#00ff00';
    static readonly CYAN = '#00ffff';
    static readonly MAGENTA = '#ff00ff';

    static readonly SECTION_TITLE_COLOR = '#ffe7ba';

    static readonly DEFAULT_PROPERTY_COLOR = '#9acd32';
    static readonly OPTIONAL_PROPERTY_COLOR = '#828282';
    static readonly REQUIRED_PROPERTY_COLOR = '#cd5c5c';

    static readonly STRING_LITERAL_COLOR = '#deb887';
    static readonly BOOLEAN_LITERAL_COLOR = '#cd5c5c';
    static readonly NUMBER_LITERAL_COLOR = '#00eeee';

    public static formatCommandSingleLine(command: Command): string {
        return `${this.formatCommandName(command.command)} - ${this.formatCommandDescription(command.description)}`;
    }

    public static formatCommandList(tb: TextBuilder, commands: readonly Command[]) {
        for (const command of commands) {
            tb.aligned([
                this.formatCommandName(command.command),
                ' - ',
                this.formatCommandDescription(command.description),
            ]);
        }
    }

    public static formatCategory(tb: TextBuilder, category: CategoryIteratorItem) {
        tb.line(this.formatTitle(category.title) + ':');
        tb.indent();
        this.formatCommandList(tb, Object.values(category.commands));
        tb.unindent();
    }

    public static formatCommandOptionList(tb: TextBuilder, command: Command) {
        for (const optionDef of command.optionsDefinition) {
            this.formatOption(tb, Option.create(optionDef));
        }
    }

    public static formatCommandHelp(tb: TextBuilder, command: Command) {
        tb.line();
        tb.line(this.formatCommandName(command.command));
        tb.line();
        tb.indent();
        tb.line(this.formatCommandDescription(command.description));
        tb.unindent();
        tb.line();

        tb.indent();
        tb.line(this.formatTitle('Usage:'));
        tb.indent();
        this.formatCommandUsageBlock(tb, command);
        tb.unindent();
        if (!isEmpty(command.optionsDefinition)) {
            tb.line();
            tb.line(this.formatTitle('Options:'));
            tb.indent();
            this.formatCommandOptionList(tb, command);
            tb.unindent();
        }
        tb.unindent();
        tb.line();
    }

    public static formatOption(tb: TextBuilder, option: Option) {
        const validNames = [option.shortDashedName, option.longDashedName]
            .filter(Boolean)
            .map((o) => this.formatOptionName(o));

        let titleLine = `${validNames.join(', ')} ${this.formatOptionTypeName(option)}`;
        if (option.required) {
            titleLine = `${titleLine} ${this.withColorHex('[required]', this.REQUIRED_PROPERTY_COLOR)}`;
        } else if (option.defaultValue !== undefined) {
            titleLine = `${titleLine} ${this.formatOptionDefaultValue(option.defaultValue)}`;
        } else if (!option.isType('boolean')) {
            titleLine = `${titleLine} ${this.withColorHex('[optional]', this.OPTIONAL_PROPERTY_COLOR)}`;
        }

        tb.line(titleLine);
        tb.indent();
        tb.line(option.description);
        tb.unindent();
        tb.line();
    }

    public static formatCommandUsageBlock(tb: TextBuilder, command: Command) {
        const r = (s: string) => this.withColorHex(s, this.REQUIRED_PROPERTY_COLOR);
        const o = (s: string) => this.withColorHex(s, this.OPTIONAL_PROPERTY_COLOR);

        tb.line(`${this.formatCommandName('./run')} ${this.formatCommandUsage(command)}`);
        tb.line();
        tb.line(this.formatTitle('legend:'));
        tb.indent();
        tb.line(r('<required property>'));
        tb.line(o('[optional property]'));
        tb.unindent();
    }

    public static formatCommandUsage(command: Command): string {
        const r = (s: string) => this.withColorHex(s, this.REQUIRED_PROPERTY_COLOR);
        const o = (s: string) => this.withColorHex(s, this.OPTIONAL_PROPERTY_COLOR);

        const parts: string[] = [this.formatCommandName(command.command)];

        for (const optionDef of command.optionsDefinition) {
            const option = Option.create(optionDef);
            const name = this.formatOptionName(option.shortDashedName ?? option.longDashedName);

            let optionPart = name;

            if (!option.isType('boolean')) {
                const exampleValue = this.formatOptionExampleValue(option);
                optionPart += ` ${exampleValue}`;
            }

            if (!option.required) {
                optionPart = `${o('[')}${optionPart}${o(']')}`;
            } else {
                optionPart = `${r('<')}${optionPart}${r('>')}`;
            }

            parts.push(optionPart);
        }
        return parts.join(' ');
    }

    public static formatOptionTypeName(option: Option): string {
        let optionTypeName: string = option.type;
        if (option.isType('boolean')) {
            optionTypeName = 'flag';
        }
        return this.withColorHex(`[${optionTypeName}]`, this.BLUE_BRIGHT);
    }

    public static formatOptionDefaultValue(value: OptionValue<OptionType>): string {
        const c = (s: string) => this.withColorHex(s, this.DEFAULT_PROPERTY_COLOR);
        return `${c('[default: ')}${this.formatOptionLiteralValue(value)}${c(']')}`;
    }

    public static formatOptionLiteralValue(value: OptionValue<OptionType>): string {
        switch (typeof value) {
            case 'string':
                return this.formatStringLiteral(value);
            case 'boolean':
                return this.formatBooleanLiteral(value);
            case 'number':
                return this.formatNumberLiteral(value);
        }
    }

    public static formatOptionExampleValue(option: Option): string {
        switch (option.type) {
            case 'string':
                return this.formatStringLiteral('example value');
            case 'boolean':
                return this.formatBooleanLiteral(true);
            case 'number':
                return this.formatNumberLiteral(123.45);
        }
    }

    public static formatBooleanLiteral(value: boolean): string {
        return this.withColorHex(String(value), this.BOOLEAN_LITERAL_COLOR);
    }

    public static formatNumberLiteral(value: number): string {
        return this.withColorHex(value.toFixed(2), this.NUMBER_LITERAL_COLOR);
    }

    public static formatStringLiteral(text: string): string {
        return this.withColorHex(`"${text}"`, this.STRING_LITERAL_COLOR);
    }

    public static formatOptionName(text: string): string {
        return this.withColorHex(text, this.YELLOW);
    }

    public static formatTitle(text: string): string {
        return this.withColorHex(text, this.SECTION_TITLE_COLOR);
    }

    public static formatCommandName(text: string): string {
        return this.withColorHex(text, this.YELLOW);
    }

    public static formatCommandDescription(text: string): string {
        return this.withColorHex(text, this.WHITE);
    }

    public static formatCMD(text: string): string {
        return this.withColorHex(text, this.STRING_LITERAL_COLOR);
    }

    public static white(text: string): string {
        return this.withColorHex(text, this.WHITE);
    }

    public static withColorHex(text: string, color: string): string {
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
    }

    public static formatCommandListCompletions(commands: readonly Command[]): void {
        console.log('local -a commands=(');
        for (const command of commands) {
            console.log(`  '${command.command}:${command.description}'`);
        }
        console.log(')');
        console.log('_describe "command" commands');
    }

    public static formatCompleteZshScript(commands: readonly Command[]): string {
        const tb = new TextBuilder();

        tb.line('_arguments -C \\');
        tb.indent();
        tb.line('"1: :->command" \\');
        tb.line('"*:: :->args" \\');
        tb.line('&& return 0');
        tb.unindent();
        tb.line();

        tb.line('case "$state" in');
        tb.indent();

        // Command completion
        tb.line('command)');
        tb.indent();
        tb.line('local -a commands=(');
        tb.indent();
        for (const command of commands) {
            tb.line(`'${command.command}:${this.escapeQuotes(command.description)}'`);
        }
        tb.unindent();
        tb.line(')');
        tb.line('_describe "command" commands');
        tb.unindent();
        tb.line(';;');

        // Arguments completion for each command
        tb.line('args)');
        tb.indent();
        tb.line('case "$words[1]" in');
        tb.indent();

        for (const command of commands) {
            tb.line(`${command.command})`);
            tb.indent();
            tb.line(`_arguments : \\`);
            tb.indent();
            command.optionsDefinition.forEach((optionDef, index) => {
                const isLast = index === command.optionsDefinition.length - 1;
                const option = Option.create(optionDef);
                let completion = this.formatOptionForCompletion(option);
                if (!isLast) {
                    completion += ' \\';
                }
                tb.line(completion);
            });
            tb.unindent();
            tb.unindent();
            tb.line(';;');
        }

        tb.unindent();
        tb.line('esac');
        tb.unindent();
        tb.line(';;');

        tb.unindent();
        tb.line('esac');

        return tb.render();
    }

    public static formatOptionForCompletion(option: Option): string {
        const names = [option.shortDashedName, option.longDashedName].filter((o) => !isEmpty(o));

        // Description with required flag if needed
        const description = option.required
            ? `${option.description} (required)`
            : option.description;

        // Basic completion format
        let result = `"(${names.join(' ')})"{${names.join(',')}}"[${this.escapeQuotes(description)}]`;

        // Add type-specific completion info for non-boolean options
        if (!option.isType('boolean')) {
            let completionDescription = '';
            let completionFunction = '';

            if (option.isType('number')) {
                completionDescription = 'number';
                completionFunction = '_numbers';
            } else {
                completionDescription = `${option.long || 'text'} text`;
            }

            result += `:${completionDescription}:${completionFunction}`;
        }

        result += '"';

        return result;
    }

    private static escapeQuotes(text: string): string {
        return text.replace(/"/g, '\\"');
    }
}
