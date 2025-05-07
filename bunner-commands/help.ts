import BunnerConst from '../framework/const';
import defineCommand from '../framework/defineCommand';
import executeCommandInstance from '../framework/executeCommandInstance';
import Formatter from '../framework/Formatter';
import TextBuilder from '../framework/text-rendering/TextBuilder';
import Command from '../framework/types/Command';
import CommandCollection from '../framework/types/CommandCollection';
import ScriptArguments from '../framework/types/ScriptArguments';

const d = defineCommand({
    command: BunnerConst.HELP_COMMAND,
    description: 'Prints help message for this run script',
    category: {
        id: 'special-command',
        title: 'Special System Commands',
        hidden: true,
    },
    options: [
        {
            short: 'a',
            long: 'all',
            description: 'Show all commands, including hidden ones form the bunner framework',
            type: 'boolean',
        },
    ] as const,
    action: async ({ args, options, commandCollection }) => {
        // If specific command help is requested
        if (args.args.length > 0) {
            const command = commandCollection.get(args.args[0]);
            if (command) {
                return printHelpForSpecificCommand(command);
            } else {
                console.error(`Command '${args.args[0]}' not found`);
            }
        }
        return printGeneralHelp(commandCollection, options.all);
    },
});

// run help manually if file is directly executed
if (require.main === module) {
    const command = Command.fromDefinition(d);
    if (command instanceof Command) {
        const commandCollection = CommandCollection.create([command]);
        executeCommandInstance({
            command,
            commandCollection,
            scriptArguments: ScriptArguments.initFromProcessArgv(),
        });
    }
}

export default d;

async function printGeneralHelp(commandCollection: CommandCollection, showAll: boolean = false) {
    const tb = new TextBuilder();

    tb.line();
    tb.line(
        Formatter.withColorHex('Bunner - A Bun-based CLI Application Framework', Formatter.WHITE),
    );
    tb.line();
    tb.line(Formatter.formatTitle('Usage:'));
    tb.indent();
    tb.line();
    tb.aligned([
        `${Formatter.formatCommandName('./run')} ${Formatter.formatCommandDescription('[command]')} ${Formatter.formatCommandDescription('[options]')}`,
    ]);
    tb.line();
    tb.aligned([`${Formatter.formatCommandName('./run help')}`, 'Show this help message']);
    tb.line();
    tb.aligned([
        `${Formatter.formatCommandName('./run help')} ${Formatter.formatCommandDescription('[cmd]')}`,
        'Show help for specific command',
    ]);
    tb.unindent();
    tb.line();

    Formatter.writeLegend(tb);

    tb.line();
    tb.line(Formatter.formatTitle('Available commands:'));
    tb.indent();
    tb.line();
    Formatter.formatCommandList(tb, commandCollection.unsortedCommands);

    commandCollection.categories.forEach((c) => {
        if (!c.hidden || showAll) {
            tb.line();
            Formatter.formatCategory(tb, c);
        }
    });
    tb.unindent();

    const res = tb.render();
    console.log(res);
    return 0;
}

async function printHelpForSpecificCommand(command: Command) {
    const tb = new TextBuilder();
    Formatter.formatCommandHelp(tb, command);
    console.log(tb.render());
    return 0;
}
