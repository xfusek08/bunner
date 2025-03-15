import BunnerConst from '../framework/const';
import defineCommand from '../framework/defineCommand';
import executeCommandInstance from '../framework/executeCommandInstance';
import Formatter from '../framework/Formatter';
import TextBuilder from '../framework/text-rendering/TextBuilder';
import Command from '../framework/types/Command';
import CommandCollection from '../framework/types/CommandCollection';
import ScriptArguments from '../framework/types/ScriptArguments';

async function printGeneralHelp(commandCollection: CommandCollection) {
    const tb = new TextBuilder();

    console.time('defined');
    tb.line();
    tb.line(
        Formatter.withColorHex(
            'Bunner - A Bun-based CLI Application Framework',
            Formatter.WHITE,
        ),
    );
    tb.line();
    tb.line(Formatter.formatTitle('Usage:'));
    tb.indent();
    tb.line();
    tb.aligned([
        `${Formatter.formatCommandName('./run')} ${Formatter.formatCommandDescription('[command]')} ${Formatter.formatCommandDescription('[options]')}`,
    ]);
    tb.line();
    tb.aligned([
        `${Formatter.formatCommandName('./run help')}`,
        'Show this help message',
    ]);
    tb.line();
    tb.aligned([
        `${Formatter.formatCommandName('./run help')} ${Formatter.formatCommandDescription('[cmd]')}`,
        'Show help for specific command',
    ]);
    tb.unindent();

    tb.line();
    tb.separator();
    tb.line();
    tb.line(Formatter.formatTitle('Available commands:'));
    tb.indent();
    if (commandCollection.unsortedCommands.length > 0) {
        commandCollection.unsortedCommands.forEach((c) => {
            tb.line(Formatter.formatCommandSingleLine(c));
        });
    }
    tb.line();
    commandCollection.categories.forEach((c) => {
        Formatter.formatCategory(tb, c);
        tb.line();
    });
    tb.line(); // Add empty line at the end
    console.timeEnd('defined');
    console.time('render');
    const res = tb.render();
    console.timeEnd('render');
    console.log(res);
    return 0;
}

async function printHelpForSpecificCommand(command: Command) {
    const tb = new TextBuilder();
    Formatter.formatCommandHelp(tb, command);
    console.log(tb.render());
    return 0;
}

const d = defineCommand({
    command: BunnerConst.HELP_COMMAND,
    description: 'Prints help message',
    category: {
        id: 'special-command',
        title: 'Special System Commands',
    },
    action: async ({ commandCollection, args }) => {
        // If specific command help is requested
        if (args.args.length > 0) {
            const command = commandCollection.get(args.args[0]);
            if (command) {
                return printHelpForSpecificCommand(command);
            } else {
                console.error(`Command '${args.args[0]}' not found`);
            }
        }

        return printGeneralHelp(commandCollection);
    },
});

export default d;

// run help anually if file is directly executed
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
