import { defineCommand } from '../framework';
import Formatter from '../framework/Formatter/Formatter';

export default defineCommand({
    command: 'bunner-completions',
    description: 'Generates ZSH completions for dynamic completion script',
    action: async ({ commandCollection }) => {
        console.log(Formatter.formatCompleteZshScript(commandCollection.allCommands));
    },
});
