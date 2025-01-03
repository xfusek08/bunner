import defineCommand from "../defineCommand";

export default defineCommand({
    command: 'bunner-clean',
    description: 'Cleans up the bunner project',
    action: async () => {
        console.log('Cleaning up the bunner project...');
        process.exit(1);
    }
});
