import defineCommand from "../defineCommand";

export default defineCommand({
    command: 'bunner-init',
    description: 'Initializes the bunner project',
    action: async () => {
        console.log('Initializing the bunner project...');
        process.exit(1);
    }
});
