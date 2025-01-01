import defineCommand from "../framework/defineCommand";

export default defineCommand({
    command: 'help',
    description: 'Prints help message',
    options: [],
    action: async () => {
        console.log('No arguments provided');
        process.exit(1);
    }
});
