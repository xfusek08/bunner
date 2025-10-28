import CategoryDescription from './CategoryDescription';
import CommandAction from './CommandAction';
import CommandDescription from './CommandDescription';
import { OptionDefinitions } from './OptionDefinition';

export default interface CommandDefinition<O extends undefined | OptionDefinitions> {
    /** The command name that users will type to invoke this command */
    readonly command: string;

    /**
     * A brief description of what this command does
     *
     * Can be either:
     * - A string for simple descriptions
     * - A callback function that receives a TextBuilder instance and returns a string
     *
     * Examples:
     * ```typescript
     * // Simple string description
     * description: 'Builds the project'
     *
     * // Callback with TextBuilder for formatted descriptions
     * description: (tb) => {
     *     tb.line('Builds the project with the following options:');
     *     tb.indent();
     *     tb.line('- Fast mode');
     *     tb.line('- Optimization enabled');
     * }
     * ```
     */
    readonly description: CommandDescription;

    /**
     * Optional category to group related commands together
     *
     * Examples:
     * ```typescript
     * // String category
     * category: 'Development'
     *
     * // CategoryDescription object with metadata
     * category: {
     *     id: 'build-tools',
     *     title: 'Build Tools',
     *     hidden: false,
     * }
     * ```
     *
     * Commands with the same category id will be merged under one section in help output.
     */
    readonly category?: string | CategoryDescription;

    /**
     * Optional command-line options that this command accepts
     *
     * When defined, these options are extracted from command arguments, leaving only
     * positional arguments in args. By default, only defined options are allowed -
     * unknown options will cause parsing errors (unless passUnknownOptions is true).
     *
     * **Important**: Use `as const` for proper TypeScript typing in the action function.
     *
     * Examples:
     * ```typescript
     * options: [
     *     {
     *         short: 'v',
     *         long: 'verbose',
     *         type: 'boolean',
     *         description: 'Enable verbose output',
     *     },
     *     {
     *         short: 'o',
     *         long: 'output',
     *         type: 'string',
     *         description: 'Output file path',
     *         required: true,
     *     },
     *     {
     *         short: 'c',
     *         long: 'count',
     *         type: 'number',
     *         description: 'Number of iterations',
     *         required: false,
     *         defaultValue: 1,
     *     }
     * ] as const,  // <- 'as const' enables proper typing
     *
     * action: async ({ options }) => {
     *     // options.verbose: boolean
     *     // options.output: string
     *     // options.count: number
     * }
     * ```
     *
     * Input: `./run cmd file1 file2 --verbose --output=result.txt --count=5`
     * Result: options = {verbose: true, output: "result.txt", count: 5}, args = ["file1", "file2"]
     */
    readonly options?: O;

    /**
     * Whether to pass through unrecognized options to the command action.
     *
     * By default (false), unknown options throw parsing errors.
     * When true, unknown options remain as positional arguments in args.restArgs.
     *
     * Examples:
     * ```typescript
     * // Default: ./run cmd --unknown-flag -> Error
     * passUnknownOptions: false
     *
     * // Permissive: ./run cmd --unknown-flag -> available in args.restArgs
     * passUnknownOptions: true
     * ```
     */
    readonly passUnknownOptions?: boolean;

    /**
     * The function that executes when this command is invoked
     *
     * Examples:
     * ```typescript
     * // Simple command with no options
     * action: async () => {
     *     const dir = await $`pwd`.text();
     *     console.log(dir);
     * }
     *
     * // Command using options
     * action: async ({ options }) => {
     *     for (let i = 0; i < options.number; i++) {
     *         console.log(`${options.prefix ?? ''}${options.text}`);
     *     }
     *     if (options.polite) {
     *         console.log('Have a nice day!');
     *     }
     * }
     *
     * // Command using args and options
     * action: async ({ options, args }) => {
     *     const text = args.getString(0);
     *     if (!text) {
     *         console.error('No text provided');
     *         return 1;
     *     }
     *     // Process text with options.width, options['line-separator'], etc.
     * }
     *
     * // Command with access to all context
     * action: async ({ args, options, runCommand, commandCollection }) => {
     *     if (args.args.length > 0) {
     *         const command = commandCollection.get(args.args[0]);
     *         if (command) {
     *             return printHelpForSpecificCommand(command);
     *         }
     *     }
     *     return printGeneralHelp(commandCollection, options.all);
     * }
     * ```
     */
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
