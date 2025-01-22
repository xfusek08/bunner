import BunnerConst from "../const";
import defineCommand from "../defineCommand";
import Formatter from "../Formatter";
import TextBuilder from "../text-rendering/TextBuilder";
import Command from "../types/Command";
import CommandCollection from "../types/CommandCollection";

async function printGeneralHelp(commandCollection: CommandCollection) {
    const tb = new TextBuilder();
    
    console.time('defined');
    tb.line();
    tb.line(Formatter.withColorHex('Bunner - A Bun-based CLI Application Framework', Formatter.WHITE));
    tb.line();
    tb.line(Formatter.formatTitle('Usage:'));
    tb.indent();
        tb.line();
        tb.aligned([`${Formatter.formatCommandName('./run')} ${Formatter.formatCommandDescription('[command]')} ${Formatter.formatCommandDescription('[options]')}`]);
        tb.line();
        tb.aligned([`${Formatter.formatCommandName('./run help')}`, 'Show this help message']);
        tb.line();
        tb.aligned([`${Formatter.formatCommandName('./run help')} ${Formatter.formatCommandDescription('[cmd]')}`, 'Show help for specific command']);
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

export default defineCommand({
    command: BunnerConst.HELP_COMMAND,
    description: 'Prints help message',
    category: {
        id: 'special-command',
        title: 'Special System Commands',
    },
    action: async ({ commandCollection, args  }) => {
        
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
    }
});
