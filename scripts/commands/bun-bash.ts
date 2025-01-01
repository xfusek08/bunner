import defineCommand from "../framework/defineCommand";
import { exitWithScheduledCommand } from "../framework/exitWithScheduledCommand";

export default defineCommand({
    command: 'bun-bash',
    description: 'Runs bash in bun container for script development purposes',
    action: async () => {
        exitWithScheduledCommand('_run_in_docker_bun bash');
    }
});
