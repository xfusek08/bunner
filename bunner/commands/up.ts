import defineCommand from "../framework/defineCommand";

export default defineCommand({
    command: 'up',
    description: 'Runs the docker compose up',
    action: async () => {
        console.log('Running the docker compose up...');
        process.exit(1);
    }
});
