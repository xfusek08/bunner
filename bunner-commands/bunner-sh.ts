import { defineCommand } from '../framework';
import { ProcessRunner } from '../modules/process/ProcessRunner';

export default defineCommand({
    command: 'bunner-sh',
    description: 'Runs shell in bun container for script development purposes',
    action: async () => {
        const dir = import.meta.env.BUNNER_ENTRY_POINT_DIRECTORY;
        await ProcessRunner.run({
            cmd: ['sh'],
            spawnOptions: {
                stdio: ['inherit', 'inherit', 'inherit'],
                cwd: dir,
            },
        });
    },
});
