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
    static readonly ORIGINAL = '#c0c0c0';

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
            tb.line(this.formatCommandUsage(command));
            tb.indent();
            tb.aligned([this.original('⋗'), this.formatCommandDescription(command.description)]);
            tb.unindent();
            tb.line();
        }
    }

    public static formatCategory(tb: TextBuilder, category: CategoryIteratorItem) {
        tb.line(this.formatTitle(category.title));
        tb.line();
        tb.line();
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
        tb.line(this.formatTitle('Usage'));
        tb.line();
        tb.indent();
        this.formatCommandUsageBlock(tb, command);
        tb.unindent();
        if (!isEmpty(command.optionsDefinition)) {
            tb.line();
            tb.line(this.formatTitle('Options'));
            tb.line();
            tb.indent();
            this.formatCommandOptionList(tb, command);
            tb.unindent();
        }
        this.writeLegend(tb);
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
        tb.aligned([this.original('⋗'), this.formatCommandDescription(option.description)]);
        tb.unindent();
        tb.line();
    }

    public static formatCommandUsageBlock(tb: TextBuilder, command: Command) {
        tb.line(`${this.formatCommandName('./run')} ${this.formatCommandUsage(command)}`);
    }

    public static writeLegend(tb: TextBuilder) {
        const c = (s: string) => this.withColorHex(s, this.YELLOW);
        const r = (s: string) => this.withColorHex(s, this.REQUIRED_PROPERTY_COLOR);
        const o = (s: string) => this.withColorHex(s, this.OPTIONAL_PROPERTY_COLOR);
        tb.line(this.formatTitle('Legend'));
        tb.line();
        tb.indent();
        tb.line(`${c('command')} ${r('<required property>')} ${o('[optional property]')}`);
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
        } else if (option.isType('path')) {
            optionTypeName = 'path';
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
                return this.formatStringLiteral('value');
            case 'boolean':
                return this.formatBooleanLiteral(true);
            case 'number':
                return this.formatNumberLiteral(123.45);
            case 'path':
                return this.formatStringLiteral('./path/to/file');
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
        return this.original(text);
    }

    public static formatCMD(text: string): string {
        return this.withColorHex(text, this.STRING_LITERAL_COLOR);
    }

    public static white(text: string): string {
        return this.withColorHex(text, this.WHITE);
    }

    public static original(text: string): string {
        return this.withColorHex(text, this.ORIGINAL);
    }

    public static colorToHexControl(color: string): string {
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `\x1b[38;2;${r};${g};${b}m`;
    }

    public static withColorHex(text: string, color: string): string {
        return this.colorToHexControl(color) + text + this.colorToHexControl(this.ORIGINAL);
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
        let result = '';

        result += '#compdef _run run\n\n';
        result += '_run() {\n';
        result += '    _arguments -C \\\n';
        result += '        "1: :->command" \\\n';
        result += '        "*:: :->args" && return 0\n\n';

        result += '    case "$state" in\n';

        // Command completion
        result += '        command)\n';
        result += '            local -a commands=(\n';

        for (const command of commands) {
            // Clean up description to be single line and escape quotes
            const cleanDescription = this.escapeQuotes(
                command.description.replace(/\s+/g, ' ').trim(),
            );
            result += `                '${command.command}:${cleanDescription}'\n`;
        }

        result += '            )\n';
        result += '            _describe "command" commands\n';
        result += '            ;;\n';

        // Arguments completion for each command
        result += '        args)\n';
        result += '            case "$words[1]" in\n';

        for (const command of commands) {
            result += `                ${command.command})\n`;

            // Check if command has options
            if (command.optionsDefinition.length > 0) {
                result += '                    _arguments -A "-*" \\\n';

                // Add each option spec
                command.optionsDefinition.forEach((optionDef, index) => {
                    const option = Option.create(optionDef);
                    const spec = this.formatOptionForCompletion(option);
                    const isLast = index === command.optionsDefinition.length - 1;
                    result += `                        ${spec}${isLast ? '' : ' \\'}\n`;
                });

                // Add file completion fallback
                result += '                        "*:: :_files"\n';
            } else {
                // No options, just allow file completion
                result += '                    _files\n';
            }

            result += '                    ;;\n';
        }

        result += '            esac\n';
        result += '            ;;\n';
        result += '    esac\n';
        result += '}\n\n';
        result += '_run "$@"\n';

        return result;
    }

    public static formatOptionForCompletion(option: Option): string {
        const names = [option.shortDashedName, option.longDashedName].filter((o) => !isEmpty(o));

        // Clean up description to be single line and escape quotes
        const cleanDescription = this.escapeQuotes(option.description.replace(/\s+/g, ' ').trim());
        const description = option.required ? `${cleanDescription} (required)` : cleanDescription;

        // Format the option exclusion and completion parts
        let optionSpec = '';

        if (names.length === 1) {
            // Only one form (long or short only)
            optionSpec = `"${names[0]}[${description}]`;
        } else {
            // Both short and long forms
            optionSpec = `"(${names.join(' ')})"{${names.join(',')}}"[${description}]`;
        }

        // Basic completion format for boolean flags
        if (option.isType('boolean')) {
            return `${optionSpec}"`;
        }

        // For non-boolean options, add argument completion
        let completionDescription = '';
        let completionFunction = '';

        if (option.isType('number')) {
            completionDescription = 'number';
            completionFunction = '_numbers';
        } else if (option.isType('path')) {
            completionDescription = option.long || option.short || 'path';
            completionFunction = '_files';
        } else {
            // string
            completionDescription = `${option.long || 'value'} text`;
            completionFunction = '';
        }

        if (completionFunction) {
            return `${optionSpec}:${completionDescription}:${completionFunction}"`;
        } else {
            return `${optionSpec}:${completionDescription}:"`;
        }
    }

    private static escapeQuotes(text: string): string {
        return text.replace(/"/g, '\\"');
    }
}
