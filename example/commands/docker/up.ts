import { defineCommand, log } from 'bunner/framework';
import DockerComposeTool from 'bunner/modules/docker/DockerComposeTool';

export default defineCommand({
    command: 'up',
    description: 'Starts up the server',
    options: [
        {
            short: 'd',
            long: 'detached',
            type: 'boolean',
            defaultValue: false,
            description: 'Run containers in the background',
        },
    ] as const,
    action: async ({ args, options }) => {
        const [profile] = args.popFirstArg();

        if (profile) {
            log.info(`Starting up docker containers with profile: ${profile}`);
        }

        const dc = await DockerComposeTool.create();
        await dc.downAll();
        await dc.up({ profile, detached: options.detached });
    },
});
