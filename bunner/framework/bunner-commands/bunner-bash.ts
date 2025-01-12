import defineCommand from "../defineCommand";
import { exitWithScheduledCommand } from "../exitWithScheduledCommand";

export default defineCommand({
    command: 'bunner-bash',
    description: 'Runs bash in bun container for script development purposes',
    action: async () => {
        exitWithScheduledCommand('_run_in_docker_bun bash');
    }
});
