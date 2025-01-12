import BunnerConst from "../const";
import defineCommand from "../defineCommand";

export default defineCommand({
    command: BunnerConst.HELP_COMMAND,
    description: 'Initializes the bunner project',
    category: {
        id: 'special-command',
        title: 'Special System Commands',
    },
    action: async ({ commandCollection  }) => {
        console.log(commandCollection.allCommands);
        return 0;
    }
});
