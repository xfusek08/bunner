import BunnerConst from "../const";
import defineCommand from "../defineCommand";

export default defineCommand({
    command: BunnerConst.HELP_COMMAND,
    description: 'Initializes the bunner project',
    category: {
        id: 'special-command',
        title: 'Special System Commands',
    },
    action: async () => {
        console.log('Initializing the bunner project...');
        process.exit(1);
    }
});
